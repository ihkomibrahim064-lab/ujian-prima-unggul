import React, { useEffect, useState } from 'react';
import { supabase, type UserProfile } from '../lib/supabase';
import { 
  Users, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  UserPlus, 
  Search,
  Loader2,
  XCircle,
  Mail,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function ManageUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'siswa' as const
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Note: In real app, we use supabase.auth.admin for direct user creation
      // but that requires service_role key which is sensitive.
      // Usually we trigger an edge function or use standard signUp
      // Here we assume standard signUp for the demo feel or provided SQL trigger
      
      const { data, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
      });

      if (authError) throw authError;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            name: newUser.name,
            role: newUser.role
          }]);
        
        if (profileError) throw profileError;
      }

      setModalOpen(false);
      setNewUser({ email: '', password: '', name: '', role: 'siswa' });
      fetchUsers();
    } catch (err: any) {
      alert(`Gagal menambah user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen User</h1>
          <p className="text-gray-500 font-medium">Atur akses guru, siswa, dan administrator.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="btn-primary"
        >
          <UserPlus size={20} />
          Tambah User Manual
        </button>
      </div>

      <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
         <input 
           type="text" 
           placeholder="Cari nama atau role..."
           className="input-field pl-10"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
         <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
               <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detail User</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hak Akses</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aksi</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {loading && users.length === 0 ? (
                  <tr>
                     <td colSpan={3} className="px-6 py-20 text-center">
                        <Loader2 className="animate-spin text-brand mx-auto mb-4" size={32} />
                        <p className="text-gray-400 font-medium">Memuat data pengguna...</p>
                     </td>
                  </tr>
               ) : filteredUsers.length === 0 ? (
                  <tr>
                     <td colSpan={3} className="px-6 py-20 text-center">
                        <p className="text-gray-500 font-bold">Data tidak ditemukan</p>
                     </td>
                  </tr>
               ) : (
                 filteredUsers.map((u) => (
                   <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                               <UserIcon size={20} />
                            </div>
                            <div>
                               <p className="font-bold text-gray-900">{u.name}</p>
                               <p className="text-xs text-gray-400 font-medium italic">ID: {u.id.slice(0, 8)}...</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={cn(
                           "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                           u.role === 'admin' ? "bg-red-100 text-red-600" :
                           u.role === 'guru' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                         )}>
                            {u.role}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <button className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-300 transition-all">
                            <Trash2 size={18} />
                         </button>
                      </td>
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               onClick={() => !loading && setModalOpen(false)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
            >
               <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Daftarkan User Baru</h2>
                    <p className="text-sm text-gray-500 font-medium">User akan langsung dapat login setelah terdaftar.</p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                     <XCircle className="text-gray-400" />
                  </button>
               </div>

               <form onSubmit={handleAddUser} className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">Nama Lengkap</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" required className="input-field pl-10" 
                          placeholder="Masukkan nama lengkap..."
                          value={newUser.name}
                          onChange={e => setNewUser({...newUser, name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">Email Sekolah</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="email" required className="input-field pl-10" 
                          placeholder="email@smkprimaunggul.sch.id"
                          value={newUser.email}
                          onChange={e => setNewUser({...newUser, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">Password Sementara</label>
                      <input 
                        type="password" required className="input-field" 
                        placeholder="Minimal 6 karakter..."
                        value={newUser.password}
                        onChange={e => setNewUser({...newUser, password: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">Pilih Hak Akses</label>
                      <div className="grid grid-cols-3 gap-3">
                         {(['siswa', 'guru', 'admin'] as const).map(r => (
                           <button
                             key={r}
                             type="button"
                             onClick={() => setNewUser({...newUser, role: r})}
                             className={cn(
                               "py-3 rounded-2xl border-2 font-bold text-xs uppercase tracking-tight flex flex-col items-center gap-2 transition-all",
                               newUser.role === r ? "bg-brand border-brand text-white" : "bg-gray-50 border-gray-100 text-gray-400 hover:border-brand/20"
                             )}
                           >
                             {r === 'admin' ? <ShieldAlert size={20} /> : r === 'guru' ? <ShieldCheck size={20} /> : <UserIcon size={20} />}
                             {r}
                           </button>
                         ))}
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
                    {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                    Daftarkan Sekarang
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
