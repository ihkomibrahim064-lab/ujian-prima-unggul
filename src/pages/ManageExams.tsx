import React, { useEffect, useState } from 'react';
import { supabase, type Exam, type Question } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ClipboardList, 
  Clock, 
  Calendar,
  Loader2,
  XCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDuration } from '../lib/utils';

export default function ManageExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Partial<Exam> & { question_ids: string[] } | null>(null);

  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    const { data } = await supabase.from('questions').select('*');
    setAvailableQuestions(data || []);
  };

  const loadExamQuestions = async (examId: string) => {
    const { data } = await supabase
      .from('exam_questions')
      .select('question_id')
      .eq('exam_id', examId);
    return data?.map(d => d.question_id) || [];
  };

  const handleEdit = async (exam: Exam) => {
    setLoading(true);
    const question_ids = await loadExamQuestions(exam.id);
    setEditingExam({ ...exam, question_ids });
    setModalOpen(true);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingExam) return;

    try {
      const { question_ids, ...examData } = editingExam;
      let examId = examData.id;

      if (examId) {
        // Update exam
        const { error } = await supabase
          .from('exams')
          .update({
            title: examData.title,
            duration: examData.duration,
          })
          .eq('id', examId);
        if (error) throw error;

        // Sync questions (simpler approach: delete and re-insert)
        await supabase.from('exam_questions').delete().eq('exam_id', examId);
      } else {
        // Create exam
        const { data, error } = await supabase
          .from('exams')
          .insert([{
            title: examData.title,
            duration: examData.duration,
            created_by: user.id
          }])
          .select()
          .single();
        if (error) throw error;
        examId = data.id;
      }

      // Bulk insert relations
      if (question_ids.length > 0) {
        const relations = question_ids.map(qid => ({
          exam_id: examId,
          question_id: qid
        }));
        await supabase.from('exam_questions').insert(relations);
      }

      setModalOpen(false);
      setEditingExam(null);
      fetchExams();
    } catch (err) {
      console.error('Error saving exam:', err);
      alert('Gagal menyimpan ujian.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus ujian ini?')) return;
    await supabase.from('exams').delete().eq('id', id);
    fetchExams();
  };

  const toggleQuestion = (id: string) => {
    if (!editingExam) return;
    const current = editingExam.question_ids || [];
    if (current.includes(id)) {
      setEditingExam({ ...editingExam, question_ids: current.filter(cid => cid !== id) });
    } else {
      setEditingExam({ ...editingExam, question_ids: [...current, id] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Ujian</h1>
          <p className="text-gray-500 font-medium">Buat dan atur jadwal ujian siswa.</p>
        </div>
        <button 
          onClick={() => {
            setEditingExam({ title: '', duration: 60, question_ids: [] });
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          Buat Ujian Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && exams.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="card h-48 animate-pulse bg-gray-50" />
          ))
        ) : exams.length === 0 ? (
          <div className="col-span-full py-20 text-center card">
             <ClipboardList size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-500 font-bold text-lg">Belum ada paket ujian</p>
             <p className="text-gray-400">Klik "Buat Ujian Baru" untuk memulai.</p>
          </div>
        ) : (
          exams.map((exam, idx) => (
            <motion.div 
              key={exam.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="card group hover:ring-2 hover:ring-brand/10 transition-all flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-brand-light p-2 rounded-lg text-brand">
                    <ClipboardList size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(exam)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(exam.id)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-xl text-gray-900 mb-4 group-hover:text-brand transition-colors leading-tight">
                  {exam.title}
                </h3>
                
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={16} className="text-brand" />
                      <span>{formatDuration(exam.duration)}</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={16} className="text-brand" />
                      <span>Dibuat pada {new Date(exam.created_at).toLocaleDateString('id-ID')}</span>
                   </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                 <span className="text-xs font-bold text-brand uppercase tracking-tighter">Status Ready</span>
                 <p className="text-xs text-gray-400 font-bold">SMK PRIMA UNGGUL</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <div>
                   <h2 className="text-2xl font-bold">{editingExam?.id ? 'Edit Ujian' : 'Buat Ujian Baru'}</h2>
                   <p className="text-sm text-gray-500 font-medium">Konfigurasi materi dan durasi pengerjaan.</p>
                 </div>
                 <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <XCircle size={24} className="text-gray-400" />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex overflow-hidden">
                <div className="w-1/3 p-8 border-r border-gray-100 space-y-6 overflow-y-auto">
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Judul Ujian</label>
                      <input 
                        type="text" 
                        required
                        className="input-field"
                        placeholder="Contoh: Matematika Dasar"
                        value={editingExam?.title || ''}
                        onChange={(e) => setEditingExam({ ...editingExam!, title: e.target.value })}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Durasi (Menit)</label>
                      <input 
                        type="number" 
                        required
                        className="input-field"
                        min={1}
                        value={editingExam?.duration || 60}
                        onChange={(e) => setEditingExam({ ...editingExam!, duration: parseInt(e.target.value) })}
                      />
                   </div>
                   <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Ringkasan</p>
                      <div className="space-y-3">
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Terpilih</span>
                            <span className="font-bold text-brand">{editingExam?.question_ids.length || 0} Soal</span>
                         </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Perkiraan Waktu</span>
                            <span className="font-bold">~{editingExam?.duration} Menit</span>
                         </div>
                      </div>
                   </div>
                   <button type="submit" className="btn-primary w-full py-3 mt-8 shadow-lg shadow-brand/20">
                      {editingExam?.id ? 'Simpan Perubahan' : 'Terbitkan Ujian'}
                   </button>
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                   <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Pilih dari Bank Soal</h3>
                      <div className="relative w-48">
                         <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                         <input type="text" placeholder="Cari..." className="w-full pl-8 pr-2 py-1 bg-white border border-gray-200 rounded-md text-xs focus:outline-none" />
                      </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 space-y-3">
                      {availableQuestions.map(q => {
                        const isSelected = editingExam?.question_ids.includes(q.id);
                        return (
                          <div 
                            key={q.id}
                            onClick={() => toggleQuestion(q.id)}
                            className={cn(
                              "p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4",
                              isSelected ? "bg-brand-light border-brand/20" : "bg-white border-gray-100 hover:border-brand/20"
                            )}
                          >
                             <div className={cn(
                               "mt-1 shrink-0",
                               isSelected ? "text-brand" : "text-gray-300"
                             )}>
                                {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-gray-900 leading-relaxed line-clamp-2">{q.question}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                   <span className="text-[9px] font-bold bg-white/50 border border-current px-1.5 rounded uppercase tracking-tighter">B: {q.correct_answer}</span>
                                </div>
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
