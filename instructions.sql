-- Create tables for SMK Prima Unggul CBT (Idempotent Version)

-- 1. Users table (extension of auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'guru', 'siswa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Students table (optional additional info)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  nis TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL
);

-- 3. Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Exams table
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Exam Questions table (linking exams to questions)
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE
);

-- 6. Answers table (student answers)
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  exam_id UUID REFERENCES public.exams(id),
  question_id UUID REFERENCES public.questions(id),
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Results table
CREATE TABLE IF NOT EXISTS public.results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  exam_id UUID REFERENCES public.exams(id),
  score NUMERIC NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Clean up and Recreate)

-- Users table policies
DROP POLICY IF EXISTS "Authenticated users can read users" ON public.users;
CREATE POLICY "Authenticated users can read users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can manage users" ON public.users;
CREATE POLICY "Admin can manage users" ON public.users FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Questions table policies
DROP POLICY IF EXISTS "Guru can manage questions" ON public.questions;
CREATE POLICY "Guru can manage questions" ON public.questions FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'guru')));

-- Exams table policies
DROP POLICY IF EXISTS "Authenticated users can read exams" ON public.exams;
CREATE POLICY "Authenticated users can read exams" ON public.exams FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Guru can manage exams" ON public.exams;
CREATE POLICY "Guru can manage exams" ON public.exams FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'guru')));

-- Results table policies
DROP POLICY IF EXISTS "Siswa can read their own results" ON public.results;
CREATE POLICY "Siswa can read their own results" ON public.results FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Guru can read all results" ON public.results;
CREATE POLICY "Guru can read all results" ON public.results FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'guru')));

-- 8. TRIGGER FOR AUTH SYNC
-- Automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'New User'), 'siswa');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
