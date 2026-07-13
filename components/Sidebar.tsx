import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, FileText, Star, Settings, LogOut, LogIn, Edit3, Library, Trash2, ShoppingBag, QrCode, Bot
} from 'lucide-react';
import { RoutePath } from '../types';
import { useAuth } from '../context/AuthContext';
import { Logo } from './ui/Logo';
import { StorageImage } from './ui/StorageImage';
import { AnimatedAvatar } from './AnimatedAvatar';

const getInitials = (name?: string, email?: string): string => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
  }
  if (email) {
    return email.substring(0, Math.min(2, email.length)).toUpperCase();
  }
  return 'UX';
};

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname, search } = location;
  const { isAuthenticated, logout, user } = useAuth();

  const [activeTheme, setActiveTheme] = React.useState(() => {
    return localStorage.getItem('neonotex_theme') || 'minimal-white';
  });

  React.useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(localStorage.getItem('neonotex_theme') || 'minimal-white');
    };
    window.addEventListener('neonotex_theme_changed', handleThemeChange);
    return () => window.removeEventListener('neonotex_theme_changed', handleThemeChange);
  }, []);

  const THEMES_CONFIG: Record<string, {
    sidebarBg: string;
    border: string;
    textPrimary: string;
    textMuted: string;
    activeItem: string;
  }> = {
    'minimal-white': {
      sidebarBg: 'bg-[#FAFAFA]/90 backdrop-blur-3xl border-r border-[#E5E5EA]',
      border: 'border-[#E5E5EA]',
      textPrimary: 'text-[#1D1D1F]',
      textMuted: 'text-[#86868B]',
      activeItem: 'bg-black/5 text-[#1D1D1F] border-transparent font-semibold shadow-sm'
    },
    'midnight-black': {
      sidebarBg: 'bg-[#050505]/95 backdrop-blur-3xl border-r border-[#1C1C1E]',
      border: 'border-[#1C1C1E]',
      textPrimary: 'text-[#F5F5F7]',
      textMuted: 'text-[#86868B]',
      activeItem: 'bg-white/10 text-white border-transparent shadow-[0_4px_16px_rgba(0,0,0,0.5)] font-semibold'
    },
    'sakura-pink': {
      sidebarBg: 'bg-[#FFF5F8]/90 backdrop-blur-3xl border-r border-[#FFE1EB]',
      border: 'border-[#FFE1EB]',
      textPrimary: 'text-[#D81B60]',
      textMuted: 'text-[#E91E63]/80',
      activeItem: 'bg-gradient-to-tr from-[#FF4081] to-[#F50057] text-white border-transparent shadow-[0_4px_15px_rgba(245,0,87,0.3)] font-semibold tracking-wide'
    }
  };

  const currentConfig = THEMES_CONFIG[activeTheme] || THEMES_CONFIG['minimal-white'];

  const handleLogout = () => {
    logout();
    navigate(RoutePath.HOME);
  };

  const handleLogin = () => {
    navigate(RoutePath.LOGIN);
  };

  const getIsActive = (path: string, exactQuery?: string) => {
    if (exactQuery !== undefined) {
      return pathname === path && search === exactQuery;
    }
    if (path === RoutePath.HOME) {
      return pathname === RoutePath.HOME && !search;
    }
    if (path === RoutePath.NOTES) {
      return pathname.startsWith(RoutePath.NOTES) && pathname !== RoutePath.CREATE_NOTE && !search;
    }
    if (path === RoutePath.TASKS) {
      return pathname.startsWith(RoutePath.TASKS);
    }
    return pathname.startsWith(path);
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: RoutePath.HOME, active: getIsActive(RoutePath.HOME) },
    { icon: FileText, label: 'Notes', path: RoutePath.NOTES, active: getIsActive(RoutePath.NOTES) },
    { icon: Edit3, label: 'My Tasks', path: RoutePath.TASKS, active: getIsActive(RoutePath.TASKS) },
    { icon: Library, label: 'Collections', path: RoutePath.COLLECTIONS, active: getIsActive(RoutePath.COLLECTIONS) },
    { icon: QrCode, label: 'QR Generator', path: RoutePath.QR_GENERATOR, active: getIsActive(RoutePath.QR_GENERATOR) },
    { icon: Star, label: 'Favorites', path: RoutePath.FAVORITES, active: getIsActive(RoutePath.FAVORITES) },
    { icon: ShoppingBag, label: 'Neo Store', path: RoutePath.STORE, active: getIsActive(RoutePath.STORE) },
    { icon: Trash2, label: 'Trash', path: RoutePath.TRASH, active: getIsActive(RoutePath.TRASH) },
    { icon: Settings, label: 'Neo Account', path: RoutePath.ACCOUNT, active: getIsActive(RoutePath.ACCOUNT) },
  ];

  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen w-64 ${currentConfig.sidebarBg} hidden lg:flex flex-col select-none animate-in slide-in-from-left duration-500 transition-colors duration-300`}>
      
      {/* Sidebar Header */}
      <div className={`flex h-20 items-center px-6 border-b ${currentConfig.border}`}>
        <Link to="/" className="flex items-center gap-3 font-bold group">
          <div className="transition-transform duration-300 group-hover:scale-105">
            {activeTheme === 'midnight-black' ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#F7C948" className="drop-shadow-[0_0_8px_rgba(247,201,72,0.8)] animate-pulse">
                <path d="M23.95 10.632C23.684 10.276 21.05 8.001 16.5 8.125C15.541 8.152 14.733 8.358 14.07 8.65C13.91 7.218 13.336 6.326 12.768 5.768L12.551 5.385C12.43 5.176 12.193 5 12 5C11.807 5 11.57 5.176 11.448 5.385L11.232 5.768C10.664 6.326 10.09 7.218 9.93 8.65C9.267 8.358 8.459 8.152 7.5 8.125C2.95 8.001 0.316 10.276 0.05 10.632C-0.088 10.817 0.04 11 0.25 11C2.5 11 4.5 11.5 5.5 13C6.446 14.419 6.84 16 6.84 16C6.84 16 8 15 10 13C11.134 11.866 11.5 11.5 12 11.5C12.5 11.5 12.866 11.866 14 13C16 15 17.159 16 17.159 16C17.159 16 17.554 14.419 18.5 13C19.5 11.5 21.5 11 23.75 11C23.96 11 24.088 10.817 23.95 10.632Z" />
              </svg>
            ) : (
              <Logo size={28} theme={activeTheme} />
            )}
          </div>
          <div>
            {activeTheme === 'sakura-pink' ? (
              <span className={`text-base tracking-tight text-[#D81B60] font-extrabold font-sans leading-none flex items-center gap-0.5`}>
                Neonotex
              </span>
            ) : (
              <span className={`text-base tracking-tight ${activeTheme === 'midnight-black' ? 'text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]' : 'text-black'} font-extrabold font-sans leading-none`}>Neonotex</span>
            )}
          </div>
        </Link>
      </div>

      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-4">
        
        <div className="space-y-1">
          <nav className="space-y-0.5">
            {menuItems.map((item, idx) => {
              const isItemActive = item.active;

              const content = (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <item.icon size={16} strokeWidth={isItemActive ? 2.5 : 2} className={isItemActive ? 'text-current' : 'text-slate-400'} />
                    <span className="font-sans ml-1 text-xs font-semibold">{item.label}</span>
                  </div>
                  {item.isNew && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${activeTheme === 'midnight-black' ? 'bg-[#F7C948]/20 text-[#F7C948]' : 'bg-indigo-50 text-indigo-600'}`}>
                      New
                    </span>
                  )}
                </div>
              );

              return (
                <Link
                  key={idx}
                  to={item.path!}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 border ${
                    isItemActive
                      ? `${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] text-white border-white/10' : `${currentConfig.activeItem} ${currentConfig.border}`}`
                      : `${activeTheme === 'midnight-black' ? 'text-slate-400 hover:bg-[#161616] hover:text-white border-transparent' : 'text-slate-500 hover:bg-black/[0.04] hover:text-black border-transparent'}`
                  }`}
                >
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>

      </div>

      {/* FOOTER ACTIONS */}
      <div className={`p-4 border-t ${currentConfig.border} flex flex-col gap-3.5`}>
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${activeTheme === 'midnight-black' ? 'text-slate-400 hover:bg-rose-500/10 hover:text-rose-500' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'}`}
          >
            <LogOut size={16} strokeWidth={2.5} className="opacity-70" />
            Sign Out
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all shadow cursor-pointer justify-center ${activeTheme === 'midnight-black' ? 'bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border border-[#1A1A1A] text-[#F7C948] hover:shadow-[0_0_15px_rgba(247,201,72,0.3)] hover:border-[#F7C948]/50 shadow-[inset_0_1px_rgba(255,255,255,0.05)]' : 'bg-black text-white hover:bg-slate-900'}`}
          >
            <LogIn size={16} strokeWidth={2.5} />
            Get Started
          </button>
        )}
      </div>
    </aside>
  );
};
