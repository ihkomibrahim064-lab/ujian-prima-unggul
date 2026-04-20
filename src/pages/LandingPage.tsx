import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Clock, Users, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const jursan = [
    { name: 'TKJ', desc: 'Teknik Komputer & Jaringan' },
    { name: 'DKV', desc: 'Desain Komunikasi Visual' },
    { name: 'AK', desc: 'Akuntansi' },
    { name: 'BC', desc: 'Broadcasting' },
    { name: 'MPLB', desc: 'Manajemen Perkantoran & Layanan Bisnis' },
    { name: 'BD', desc: 'Bisnis Digital' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-brand w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            S
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold text-slate-800 tracking-tight">Prima Unggul</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">CBT System</span>
          </div>
        </div>
        <Link to="/login" className="btn-primary px-6 py-2">
          Masuk Sekarang
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="py-24 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider mb-8">
            <Clock size={14} />
            Digital Assessment Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-[1.1] mb-8 tracking-tight">
            Sistem Ujian Terpadu <span className="text-brand">SMK Prima Unggul</span>.
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed font-medium">
            Mewujudkan evaluasi pembelajaran yang modern, transparan, dan akurat untuk seluruh sivitas akademika SMK Prima Unggul.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/login" className="btn-primary px-10 py-4 text-base rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-none">
               Mulai Ujian Sekarang
            </Link>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="aspect-[4/3] bg-slate-50 rounded-[40px] overflow-hidden relative border border-slate-100">
             <img 
               src="https://picsum.photos/seed/school-digital/1200/900" 
               alt="Digital Learning"
               className="w-full h-full object-cover grayscale-[20%] opacity-90"
               referrerPolicy="no-referrer"
             />
             <div className="absolute inset-0 bg-gradient-to-tr from-brand/5 to-transparent" />
          </div>
          
          <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-none">
            <div className="bg-brand-light text-brand p-3.5 rounded-2xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Aktif Digunakan</p>
              <p className="text-2xl font-bold text-slate-800 tracking-tight">1200+ Peserta</p>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Jurusan Section */}
      <section className="py-24 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Kompetensi Keahlian</h2>
            <p className="text-slate-500 font-medium text-lg">Mendukung digitalisasi penilaian di seluruh rumpun keahlian.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {jursan.map((item, index) => (
              <motion.div 
                key={item.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white p-10 rounded-[32px] border border-slate-100 hover:border-brand/20 transition-all group"
              >
                <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center text-slate-400 mb-8 group-hover:bg-brand-light group-hover:text-brand transition-all">
                  <BookOpen size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">{item.name}</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">{item.desc}</p>
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand font-bold text-sm transition-all">
                  Informasi <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 text-center text-slate-400">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-300 mx-auto mb-6">S</div>
        <p className="text-[13px] font-medium leading-relaxed">© 2026 SMK Prima Unggul. Hak Cipta Dilindungi.<br/>Dikembangkan untuk keunggulan akademik.</p>
      </footer>
    </div>
  );
}
