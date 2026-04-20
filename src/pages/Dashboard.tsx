import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { LayoutDashboard, Users, GraduationCap, ClipboardCheck, TrendingUp, Bell } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { profile } = useAuth();
  
  const stats = [
    { label: 'Ujian Tersedia', value: '04', icon: Users, color: 'text-slate-800' },
    { label: 'Ujian Selesai', value: '12', icon: GraduationCap, color: 'text-slate-800' },
    { label: 'Rata-rata Nilai', value: '88.5', icon: TrendingUp, color: 'text-slate-800' },
  ];

  const announcements = [
    { title: 'Ujian Akhir Semester Ganjil', date: '21 Apr 2026', type: 'PENTING' },
    { title: 'Pemeliharaan Server CBT', date: '25 Apr 2026', type: 'INFO' },
    { title: 'Workshop Guru tentang LMS', date: '28 Apr 2026', type: 'KEGIATAN' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 mb-0.5">
            Dashboard Utama
          </h1>
          <p className="text-[13px] text-slate-500 font-medium tracking-tight">
            Ringkasan aktivitas ujian Anda di SMK Prima Unggul.
          </p>
        </div>
        <div className="text-[13px] text-slate-400 font-medium">
          Minggu, 19 April 2026
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col gap-1 shadow-none transition-all cursor-default"
          >
            <span className="text-[13px] text-slate-400 font-medium">{stat.label}</span>
            <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Jadwal Ujian Aktif (Mocking the list structure from theme) */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Jadwal Ujian Aktif</h2>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
             <div className="grid grid-cols-4 px-5 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <div className="col-span-1">Nama Ujian</div>
                <div>Mata Pelajaran</div>
                <div>Durasi</div>
                <div className="text-right">Aksi</div>
             </div>
             
             <div className="grid grid-cols-4 px-5 py-4 border-b border-slate-100 text-[13px] text-slate-700 items-center">
                <div className="font-semibold">Penilaian Akhir Semester (PAS)</div>
                <div className="text-slate-500">Matematika</div>
                <div className="text-slate-500">90 Menit</div>
                <div className="text-right">
                   <button className="btn-primary px-4 py-1.5 text-xs">Kerjakan</button>
                </div>
             </div>

             <div className="grid grid-cols-4 px-5 py-4 border-b border-slate-100 text-[13px] text-slate-700 items-center">
                <div className="font-semibold">Ujian Harian Ke-3</div>
                <div className="text-slate-500">B. Indonesia</div>
                <div className="text-slate-500">60 Menit</div>
                <div className="text-right">
                   <button className="btn-primary px-4 py-1.5 text-xs">Kerjakan</button>
                </div>
             </div>

             <div className="grid grid-cols-4 px-5 py-4 border-b border-slate-100 text-[13px] text-slate-700 items-center">
                <div className="font-semibold">Praktikum Jaringan Dasar</div>
                <div className="text-slate-500">Produktif TKJ</div>
                <div className="text-slate-500">120 Menit</div>
                <div className="text-right">
                   <span className="status-pill status-pill-success">Selesai</span>
                </div>
             </div>

             <div className="grid grid-cols-4 px-5 py-4 text-[13px] text-slate-700 items-center">
                <div className="font-semibold text-slate-800">Kewirausahaan XII</div>
                <div className="text-slate-500">PKK</div>
                <div className="text-slate-500">45 Menit</div>
                <div className="text-right">
                   <button className="btn-primary px-4 py-1.5 text-xs">Kerjakan</button>
                </div>
             </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="md:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Pengumuman
            </h2>
          </div>
          <div className="space-y-4">
            {announcements.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors group cursor-pointer shadow-none">
                <div className="flex items-center justify-between mb-2">
                   <span className={cn(
                     "px-2 py-0.5 rounded-md text-[10px] font-bold",
                     item.type === 'PENTING' ? "bg-red-50 text-red-600" : 
                     item.type === 'INFO' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                   )}>
                     {item.type}
                   </span>
                   <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                </div>
                <h3 className="font-bold text-[13px] text-slate-700 group-hover:text-brand transition-colors">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility imported inside for simplicity in this turn
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

import { FileText } from 'lucide-react';
