import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type ExamWithQuestions, type Question } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  GraduationCap,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatTime } from '../lib/utils';
import confetti from 'canvas-confetti';

export default function ExamWindow() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [exam, setExam] = useState<ExamWithQuestions | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchExamData();
    // Prevent accidental exit
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  const fetchExamData = async () => {
    if (!id) return;
    try {
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', id)
        .single();
      
      if (examError) throw examError;

      const { data: qData, error: qError } = await supabase
        .from('exam_questions')
        .select('questions (*)')
        .eq('exam_id', id);
      
      if (qError) throw qError;

      const questions = qData.map(d => (d as any).questions as Question);
      setExam({ ...examData, questions });
      setTimeLeft(examData.duration * 60);
    } catch (err) {
      console.error('Error fetching exam:', err);
      navigate('/app/siswa/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    if (!exam) return 0;
    let correct = 0;
    exam.questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    return Math.round((correct / exam.questions.length) * 100);
  };

  const submitExam = async () => {
    if (!user || !exam || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const score = calculateScore();
      
      // Save results
      const { error: resultError } = await supabase
        .from('results')
        .insert([{
          user_id: user.id,
          exam_id: exam.id,
          score
        }]);
      
      if (resultError) throw resultError;

      // Save individual answers for re-eval later if needed
      const answerBatch = Object.entries(answers).map(([qid, ans]) => ({
        user_id: user.id,
        exam_id: exam.id,
        question_id: qid,
        answer: ans
      }));
      
      if (answerBatch.length > 0) {
        await supabase.from('answers').insert(answerBatch);
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Show temporary score or go back
      alert(`Ujian selesai! Skor Anda: ${score}`);
      navigate('/app/siswa/exams');
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Gagal menyimpan hasil ujian. Hubungi pengawas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    alert('Waktu habis! Ujian akan dikirimkan otomatis.');
    submitExam();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-brand mb-4" size={48} />
        <p className="font-bold text-gray-500">Memuat lembar soal...</p>
      </div>
    );
  }

  const currentQuestion = exam?.questions[currentIndex];
  const progress = ((currentIndex + 1) / (exam?.questions.length || 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Main Interface */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-50">
           <div className="flex items-center gap-3">
              <div className="bg-brand text-white p-2 rounded-xl">
                <GraduationCap size={20} />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 leading-none">{exam?.title}</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">SMK Prima Unggul CBT</p>
              </div>
           </div>

           <div className={cn(
             "flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all",
             timeLeft < 300 ? "bg-red-50 border-red-100 text-red-600 animate-pulse" : "bg-gray-50 border-gray-100 text-gray-700"
           )}>
             <Clock size={20} />
             <span className="font-black text-lg tabular-nums">{formatTime(timeLeft)}</span>
           </div>
        </header>

        {/* Progress Rail */}
        <div className="h-1 bg-gray-100 w-full overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             className="h-full bg-brand"
           />
        </div>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                 <span className="bg-brand text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm">
                   {currentIndex + 1}
                 </span>
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pertanyaan dari {exam?.questions.length}</span>
               </div>
               <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
                 {currentQuestion?.question}
               </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {['a', 'b', 'c', 'd'].map((key) => {
                 const optKey = `option_${key}` as keyof Question;
                 const letter = key.toUpperCase();
                 const isSelected = answers[currentQuestion?.id!] === letter;
                 
                 return (
                   <button
                     key={key}
                     onClick={() => handleAnswer(currentQuestion?.id!, letter)}
                     className={cn(
                       "flex items-center gap-6 p-6 rounded-3xl border-2 text-left transition-all group",
                       isSelected 
                        ? "bg-brand border-brand text-white shadow-xl shadow-brand/20 ring-4 ring-brand/5" 
                        : "bg-white border-gray-100 hover:border-brand/30 hover:bg-gray-50 text-gray-700"
                     )}
                   >
                     <div className={cn(
                       "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 transition-all",
                       isSelected ? "bg-white text-brand" : "bg-gray-100 text-gray-500 group-hover:bg-brand-light group-hover:text-brand"
                     )}>
                       {letter}
                     </div>
                     <span className="flex-1 font-bold text-lg">
                        {(currentQuestion as any)?.[optKey]}
                     </span>
                   </button>
                 );
               })}
            </div>
          </div>
        </main>

        {/* Navigation Bar */}
        <footer className="bg-white border-t border-gray-100 p-6 md:px-12 flex items-center justify-between sticky bottom-0 z-50">
           <button 
             disabled={currentIndex === 0}
             onClick={() => setCurrentIndex(prev => prev - 1)}
             className="btn-outline px-6 py-3 disabled:opacity-0"
           >
             <ChevronLeft size={20} />
             Sebelumnya
           </button>

           <div className="hidden md:flex items-center gap-2">
             <div className="flex gap-1.5 overflow-x-auto max-w-sm px-4">
                {exam?.questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-bold transition-all shrink-0",
                      currentIndex === i ? "bg-brand text-white ring-4 ring-brand/10" : 
                      answers[exam.questions[i].id] ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
             </div>
           </div>

           {currentIndex === (exam?.questions.length || 0) - 1 ? (
             <button 
               onClick={() => setShowExitWarning(true)}
               className="btn-primary px-8 py-3 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
             >
               <CheckCircle2 size={20} />
               Selesaikan Ujian
             </button>
           ) : (
             <button 
               onClick={() => setCurrentIndex(prev => prev + 1)}
               className="btn-primary px-8 py-3"
             >
               Berikutnya
               <ChevronRight size={20} />
             </button>
           )}
        </footer>
      </div>

      {/* Side Navigation (Desktop only, for quick jumping) */}
      <div className="w-80 bg-white border-l border-gray-50 hidden lg:flex flex-col">
         <div className="p-8 border-b border-gray-50">
           <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
             <ClipboardList size={18} className="text-brand" />
             Navigasi Soal
           </h3>
           <p className="text-xs font-medium text-gray-400">Pastikan semua pertanyaan terjawab sebelum dikirim.</p>
         </div>
         <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-5 gap-3">
              {exam?.questions.map((q, i) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = currentIndex === i;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center font-black text-sm transition-all relative",
                      isCurrent ? "bg-brand text-white shadow-lg shadow-brand/20 scale-110 z-10" : 
                      isAnswered ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-400 border border-gray-200"
                    )}
                  >
                    {i + 1}
                    {isAnswered && !isCurrent && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
         </div>
         <div className="p-8 border-t border-gray-50 space-y-4">
            <div className="flex justify-between items-center text-xs font-bold uppercase text-gray-400 tracking-tighter">
               <span>Terjawab</span>
               <span className="text-gray-900">{Object.keys(answers).length} / {exam?.questions.length}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-green-500 transition-all duration-500" 
                 style={{ width: `${(Object.keys(answers).length / (exam?.questions.length || 1)) * 100}%` }} 
               />
            </div>
         </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showExitWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               onClick={() => !isSubmitting && setShowExitWarning(false)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white max-w-md w-full rounded-[40px] p-10 relative overflow-hidden shadow-2xl text-center"
            >
               <div className="bg-orange-50 text-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                 <AlertCircle size={40} />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Kumpulkan Jawaban?</h3>
               <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                 Jawaban yang telah dikirim tidak dapat diubah kembali. Pastikan Anda telah memeriksa semua jawaban dengan teliti.
               </p>

               <div className="flex flex-col gap-3">
                  <button 
                    onClick={submitExam}
                    disabled={isSubmitting}
                    className="btn-primary py-4 text-lg bg-brand hover:bg-brand-dark shadow-xl shadow-brand/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        Sedang Mengirim...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={24} />
                        Ya, Kirim Sekarang
                      </>
                    )}
                  </button>
                  <button 
                    disabled={isSubmitting}
                    onClick={() => setShowExitWarning(false)}
                    className="btn-outline py-4 text-lg border-transparent text-gray-400 hover:text-gray-600"
                  >
                    Batal, Periksa Lagi
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
