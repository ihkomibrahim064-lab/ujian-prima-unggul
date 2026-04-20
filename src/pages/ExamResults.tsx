import React, { useEffect, useState } from 'react';
import { supabase, type ExamResult } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { 
  Trophy, 
  Search, 
  Download, 
  Calendar, 
  User as UserIcon,
  BookOpen,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function ExamResults() {
  const { user, profile } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResults();
  }, [user]);

  const fetchResults = async () => {
    if (!user) return;
    try {
      let query = supabase
        .from('results')
        .select('*, users(name, role), exams(title)');
      
      // If student, only see theirs
      if (profile?.role === 'siswa') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('completed_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(r => 
    r.exams?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.users?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hasil Ujian</h1>
          <p className="text-gray-500 font-medium">Rekapitulasi nilai dan capaian pembelajaran.</p>
        </div>
        <button className="btn-outline">
          <Download size={20} />
          Ekspor PDF / Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-light border-brand/10">
            <div className="bg-brand text-white p-4 rounded-3xl mb-4 shadow-lg shadow-brand/20">
               <Trophy size={32} />
            </div>
            <h3 className="text-sm font-bold text-brand uppercase tracking-tighter mb-1">Rata-rata Kelas</h3>
            <p className="text-4xl font-black text-gray-900">88.4</p>
         </div>
         <div className="card p-8 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-tighter mb-1">Total Pengerjaan</h3>
            <p className="text-4xl font-black text-gray-900">{results.length}</p>
         </div>
         <div className="card p-8 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-tighter mb-1">Bulan Ini</h3>
            <p className="text-4xl font-black text-gray-900">42</p>
         </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama siswa atau ujian..."
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

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <tr>
                     <th className="px-8 py-5">Peserta</th>
                     <th className="px-8 py-5">Mata Pelajaran / Ujian</th>
                     <th className="px-8 py-5">Waktu Selesai</th>
                     <th className="px-8 py-5">Skor Akhir</th>
                     <th className="px-8 py-5">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-8 py-4 h-16 bg-gray-50/20" />
                      </tr>
                    ))
                  ) : filteredResults.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="px-8 py-20 text-center">
                          <p className="text-gray-400 font-bold">Data hasil belum tersedia</p>
                       </td>
                    </tr>
                  ) : (
                    filteredResults.map((r, idx) => (
                      <motion.tr 
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-gray-50/80 transition-colors group"
                      >
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                  <UserIcon size={18} />
                               </div>
                               <div>
                                  <p className="font-bold text-gray-900 leading-none mb-1">{r.users?.name}</p>
                                  <p className="text-[10px] font-bold text-brand uppercase tracking-tighter">{r.users?.role}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <BookOpen size={18} className="text-gray-300" />
                               <span className="font-bold text-gray-700">{r.exams?.title}</span>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-gray-400">
                               <Calendar size={14} />
                               <span className="text-sm font-medium">{new Date(r.completed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <span className={cn(
                                 "text-2xl font-black",
                                 r.score >= 75 ? "text-green-600" : "text-brand"
                               )}>
                                 {r.score}
                               </span>
                               <div className="h-6 w-[1px] bg-gray-100" />
                               <span className="text-xs font-bold text-gray-400 italic">/ 100</span>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <div className={cn(
                               "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                               r.score >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                            )}>
                               <CheckCircle2 size={12} />
                               {r.score >= 75 ? 'Lulus' : 'Remedi'}
                            </div>
                         </td>
                      </motion.tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
