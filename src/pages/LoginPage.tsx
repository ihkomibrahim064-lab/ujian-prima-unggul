import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GraduationCap, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Fetch profile to redirect correctly
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (profile) {
          navigate('/app');
        } else {
          // If no profile, they might be the very first user (Admin)
          // We'll handle automatic admin creation in a real scenario, 
          // here we just send to dashboard and let them set it up.
          navigate('/app');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Silakan periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-3 justify-center mb-10">
          <div className="bg-brand w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Prima Unggul</h1>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">CBT System v1.0</p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-none">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Masuk Dashboard</h2>
            <p className="text-[13px] text-slate-500 font-medium">Silakan gunakan akun resmi sekolah untuk mengakses sistem CBT.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="text-xs font-semibold">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Sekolah</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="nama@smkprimaunggul.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kata Sandi</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk Sekarang
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-[13px] text-slate-400 font-medium">
              Lupa password? Hubungi <span className="text-brand font-bold">Admin IT</span>
            </p>
            <Link to="/" className="inline-block mt-4 text-[13px] text-slate-400 hover:text-slate-600 transition-colors">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
