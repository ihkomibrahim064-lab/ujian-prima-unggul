import React, { useEffect, useState } from 'react';
import { supabase, type Question } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function ManageQuestions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingQuestion) return;

    try {
      const payload = {
        ...editingQuestion,
        created_by: user.id,
      };

      if (editingQuestion.id) {
        const { error } = await supabase
          .from('questions')
          .update(payload)
          .eq('id', editingQuestion.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('questions')
          .insert([payload]);
        if (error) throw error;
      }

      setModalOpen(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      console.error('Error saving question:', err);
      alert('Gagal menyimpan soal.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus soal ini?')) return;
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bank Soal</h1>
          <p className="text-gray-500 font-medium">Kelola pertanyaan untuk bank soal ujian.</p>
        </div>
        <button 
          onClick={() => {
            setEditingQuestion({
              question: '',
              option_a: '',
              option_b: '',
              option_c: '',
              option_d: '',
              correct_answer: 'A'
            });
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          Tambah Soal Baru
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6 border-l-4 border-l-brand">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Soal</p>
            <p className="text-2xl font-black">{questions.length}</p>
          </div>
          <div className="card p-6 border-l-4 border-l-blue-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Draft</p>
            <p className="text-2xl font-black">0</p>
          </div>
          <div className="card p-6 border-l-4 border-l-green-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Terverifikasi</p>
            <p className="text-2xl font-black">{questions.length}</p>
          </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari soal..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-outline">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
             <Loader2 className="animate-spin text-brand" size={32} />
             <p className="text-gray-400 font-medium">Buka bank data...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-20 text-center card bg-gray-50/50">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm">
              <FileText size={32} />
            </div>
            <p className="text-gray-500 font-bold">Belum ada soal ditemukan</p>
            <p className="text-sm text-gray-400">Silakan tambahkan soal pertama anda.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card group hover:border-brand/20 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded uppercase text-gray-500">UMUM</span>
                        <span className="text-xs text-gray-400 font-medium italic">Pilihan Ganda</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg leading-relaxed">{q.question}</h3>
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingQuestion(q);
                          setModalOpen(true);
                        }}
                        className="p-2 hover:bg-brand-light hover:text-brand rounded-lg text-gray-400 transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(q.id)}
                        className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'A', text: q.option_a },
                    { key: 'B', text: q.option_b },
                    { key: 'C', text: q.option_c },
                    { key: 'D', text: q.option_d },
                  ].map(opt => (
                    <div 
                      key={opt.key}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium flex items-center gap-3",
                        q.correct_answer === opt.key 
                          ? "bg-green-50 border-green-100 text-green-700" 
                          : "bg-gray-50 border-gray-100 text-gray-500"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold",
                        q.correct_answer === opt.key ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                      )}>
                        {opt.key}
                      </div>
                      {opt.text}
                      {q.correct_answer === opt.key && <CheckCircle2 size={14} className="ml-auto" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h2 className="text-2xl font-bold">{editingQuestion?.id ? 'Edit Soal' : 'Tambah Soal Baru'}</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <XCircle size={24} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Pertanyaan</label>
                  <textarea 
                    required
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Tuliskan pertanyaan di sini..."
                    value={editingQuestion?.question || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['a', 'b', 'c', 'd'] as const).map(key => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase">Opsi {key}</label>
                      <input 
                        type="text"
                        required
                        className="input-field"
                        placeholder={`Jawaban ${key.toUpperCase()}`}
                        value={(editingQuestion as any)?.[`option_${key}`] || ''}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, [`option_${key}`]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Jawaban Benar</label>
                  <select 
                    required
                    className="input-field"
                    value={editingQuestion?.correct_answer || 'A'}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })}
                  >
                    <option value="A">Opsi A</option>
                    <option value="B">Opsi B</option>
                    <option value="C">Opsi C</option>
                    <option value="D">Opsi D</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                   <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1">
                     Batal
                   </button>
                   <button type="submit" className="btn-primary flex-1">
                     Simpan Soal
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
