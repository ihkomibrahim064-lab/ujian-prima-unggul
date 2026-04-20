import React from 'react';
import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardList, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  UserCircle,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AppLayout() {
  const { user, profile, loading, signOut } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Menyiapkan Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = profile?.role || 'siswa'; // Fallback to siswa

  const menuItems = [
    { 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/app', 
      roles: ['admin', 'guru', 'siswa'] 
    },
    { 
      label: 'Manajemen User', 
      icon: Users, 
      path: '/app/admin/users', 
      roles: ['admin'] 
    },
    { 
      label: 'Bank Soal', 
      icon: FileText, 
      path: '/app/guru/questions', 
      roles: ['admin', 'guru'] 
    },
    { 
      label: 'Manajemen Ujian', 
      icon: ClipboardList, 
      path: '/app/guru/exams', 
      roles: ['admin', 'guru'] 
    },
    { 
      label: 'Daftar Ujian', 
      icon: ClipboardList, 
      path: '/app/siswa/exams', 
      roles: ['siswa'] 
    },
    { 
      label: 'Riwayat & Nilai', 
      icon: CreditCard, 
      path: '/app/results', 
      roles: ['admin', 'guru', 'siswa'] 
    },
  ].filter(item => item.roles.includes(role));

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-slate-200 flex flex-col transition-all duration-300 transform",
        !isSidebarOpen ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-100 shrink-0">
          <div className="bg-brand text-white w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg shrink-0">
            S
          </div>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col whitespace-nowrap"
            >
              <span className="font-bold text-slate-800 text-base">Prima Unggul</span>
              <span className="text-[11px] text-slate-400 font-medium">CBT System v1.0</span>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative",
                  isActive 
                    ? "bg-brand-light text-brand" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <item.icon size={20} className="shrink-0" />
                {isSidebarOpen && (
                  <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-6 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100">
           <div className={cn(
             "flex items-center gap-3 p-2 transition-all",
             !isSidebarOpen ? "justify-center" : ""
           )}>
             <div className="shrink-0">
               <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">
                 {profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AS'}
               </div>
             </div>
             {isSidebarOpen && (
               <div className="flex-1 min-w-0">
                 <p className="text-[13px] font-semibold text-slate-800 truncate">{profile?.name || 'User'}</p>
                 <p className="text-[11px] font-medium text-slate-400 capitalize">{role} • XII TKJ 1</p>
               </div>
             )}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isSidebarOpen ? "lg:ml-[260px]" : "lg:ml-20"
      )}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 hidden md:block">
              Selamat Datang, {profile?.name?.split(' ')[0] || 'User'}
            </h2>
          </div>

          <button 
            onClick={handleSignOut}
            className="logout-btn px-4 py-2 border-2 border-brand text-brand rounded-md hover:bg-brand-light transition-all font-semibold text-sm"
          >
            Keluar
          </button>
        </header>

        {/* Viewport */}
        <div className="p-8 max-w-full overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
