import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Key is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'guru' | 'siswa';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
}

export interface StudentProfile {
  id: string;
  nis: string;
  name: string;
  class: string;
}

export interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  created_by: string;
}

export interface Exam {
  id: string;
  title: string;
  duration: number;
  created_by: string;
  created_at: string;
}

export interface ExamWithQuestions extends Exam {
  questions: Question[];
}

export interface Answer {
  id: string;
  user_id: string;
  exam_id: string;
  question_id: string;
  answer: string;
}

export interface ExamResult {
  id: string;
  user_id: string;
  exam_id: string;
  score: number;
  completed_at: string;
}
