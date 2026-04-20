import React, { useEffect, useState } from 'react';
import { supabase, type Exam } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Clock, 
  Play, 
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatDuration } from '../lib/utils';

export default function SiswaExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExamsAndResults();
  }, [user]);

  const fetchExamsAndResults = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [examsRes, resultsRes] = await Promise.all([
        supabase.from('exams').select('*').order('created_at', { ascending: false }),
        supabase.from('results').select('*').eq('user_id', user.id)
      ]);

      setExams(examsRes.data || []);
      setResults(resultsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (exam: Exam) => {
    const hasAttempted = results.some(r => r.exam_id === exam.id);
    if (hasAttempted) {
      alert('Anda sudah mengerjakan ujian ini.');
      return;
    }
    
    if (window.confirm(`Mulai ujian "${exam.title}" sekarang?\nDurasi: ${exam.duration} menit.\nPastikan koneksi internet stabil.`)) {
      navigate(`/app/siswa/exam/${exam.id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Daftar Ujian</h1>
        <p className="text-gray-500 font-medium">Pilih ujian yang tersedia untuk dikerjakan hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-gray-50" />
           ))
        ) : exams.length === 0 ? (
          <div className="col-span-full py-20 text-center card">
             <ClipboardList size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-500 font-bold text-lg">Belum ada ujian aktif</p>
             <p className="text-gray-400">Hubungi guru Anda jika Anda merasa ini adalah kesalahan.</p>
          </div>
        ) : (
          exams.map((exam, idx) => {
            const result = results.find(r => r.exam_id === exam.id);
            const isCompleted = !!result;

            return (
              <motion.div 
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "card flex flex-col group overflow-hidden transition-all",
                  isCompleted ? "border-green-100" : "hover:border-brand/30 hover:shadow-xl shadow-gray-200/50"
                )}
              >
                <div className="relative h-2 bg-gray-100">
                   <div className={cn(
                     "absolute inset-y-0 left-0 transition-all duration-1000",
                     isCompleted ? "bg-green-500 w-full" : "bg-brand w-0 group-hover:w-full"
                   )} />
                </div>
                
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "p-3 rounded-2xl",
                      isCompleted ? "bg-green-50 text-green-600" : "bg-brand-light text-brand"
                    )}>
                      {isCompleted ? <CheckCircle2 size={24} /> : <ClipboardList size={24} />}
                    </div>
                    {isCompleted && (
                       <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight">
                         Status: Selesai
                       </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    {exam.title}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mb-6">
                    SMK Prima Unggul - Kurikulum Merdeka
                  </p>

                  <div className="flex items-center gap-6 mb-8 border-t border-gray-50 pt-6">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Durasi</p>
                       <div className="flex items-center gap-1.5 font-bold text-gray-700">
                         <Clock size={14} className="text-brand" />
                         {formatDuration(exam.duration)}
                       </div>
                    </div>
                  </div>

                  {isCompleted ? (
                    <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex items-center justify-between">
                       <div>
                         <p className="text-[10px] font-bold text-green-600 uppercase">Nilai Akhir</p>
                         <p className="text-2xl font-black text-green-700">{result.score}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] font-bold text-green-600 uppercase">Dikerjakan</p>
                         <p className="text-xs font-bold text-green-700">{new Date(result.completed_at).toLocaleDateString()}</p>
                       </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleStartExam(exam)}
                      className="btn-primary w-full py-3.5 group"
                    >
                      Mulai Sekarang
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

                <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center gap-2">
                   <AlertTriangle size={14} className="text-orange-400" />
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sekali Percobaan Saja</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
