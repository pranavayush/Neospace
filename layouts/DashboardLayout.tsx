import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Menu, Search, User, Settings, LogOut, Loader2, FileText, X, LogIn, Flame, WifiOff } from 'lucide-react';
import { RoutePath, Note } from '../types';
import { noteService } from '../services/noteService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { StorageImage } from '../components/ui/StorageImage';
import { Logo } from '../components/ui/Logo';

import { AnimatedAvatar } from '../components/AnimatedAvatar';

import { motion } from 'motion/react';

// Dark Knight Theme Background
const DarkKnightBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#000000]" aria-hidden="true">
      {/* Distant Stars (Static, low opacity, sharp) */}
      {[...Array(150)].map((_, i) => (
        <div
           key={`dist-star-${i}`}
           className="absolute bg-white rounded-full pointer-events-none"
           style={{
             top: `${Math.random() * 100}%`,
             left: `${Math.random() * 100}%`,
             width: `${Math.random() * 1 + 0.5}px`,
             height: `${Math.random() * 1 + 0.5}px`,
             opacity: Math.random() * 0.3 + 0.15,
           }}
        />
      ))}

      {/* Near Stars (Static, slightly brighter) */}
      {[...Array(50)].map((_, i) => (
        <div
           key={`near-star-${i}`}
           className="absolute bg-white rounded-full pointer-events-none"
           style={{
             top: `${Math.random() * 100}%`,
             left: `${Math.random() * 100}%`,
             width: `${Math.random() * 1.5 + 0.5}px`,
             height: `${Math.random() * 1.5 + 0.5}px`,
             opacity: Math.random() * 0.4 + 0.3,
           }}
        />
      ))}

      {/* Subtle Static Fog */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-screen pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 120%, rgba(200,200,255,1) 0%, rgba(0,0,0,0) 60%)',
        }}
      />
    </div>
  );
};

// Enhanced Animated Sakura Petals Component
const SakuraPetals = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Soft Pink Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF0F5] via-[#FFFAFA] to-[#FFE4E1] opacity-70" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFB6C1] blur-[100px] opacity-20 rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF69B4] blur-[120px] opacity-10 rounded-full" />
      
      {/* Stable Pink Stars */}
      {[...Array(150)].map((_, i) => {
        const size = 6 + Math.random() * 14; // cute tiny sizes
        return (
          <div
            key={`star-${i}`}
            className="absolute opacity-40 filter drop-shadow-sm"
            style={{
              width: size,
              height: size,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm text-[#FFB6C1]">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" opacity="0.8" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { user, isAuthenticated, logout } = useAuth();
  
  // Clean states
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  
  const [streak, setStreak] = useState(0);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isNoteRoute = location.pathname.startsWith('/notes/') && location.pathname !== '/notes';

  useEffect(() => {
    if (isAuthenticated) {
      noteService.getStreak().then(setStreak).catch(console.error);
    } else {
      setStreak(0);
    }
  }, [isAuthenticated, user?.id, location.pathname]); 

  // Adding location.pathname to update streak mostly after note creations which change pathname
  
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search Debounce Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        setShowResults(true);
        try {
          const results = await noteService.search(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate(RoutePath.HOME);
  };

  const handleLogin = () => {
    navigate(RoutePath.LOGIN);
  };

  const handleNavigation = (path: string) => {
    setIsProfileMenuOpen(false);
    navigate(path);
  };

  const handleSearchResultClick = (noteId: string) => {
    setSearchQuery('');
    setShowResults(false);
    if (isAuthenticated) {
      navigate(RoutePath.NOTE_DETAIL.replace(':id', noteId));
    } else {
      navigate(RoutePath.LOGIN);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
  };

  const getPreviewText = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > 60 ? text.substring(0, 60) + "..." : text;
  };

  // Modern Workspace Themes
  const THEMES: Record<string, {
    id: string;
    name: string;
    emoji: string;
    bg: string;
    sidebarBg: string;
    cardBg: string;
    borderColor: string;
    textPrimary: string;
    textMuted: string;
    accentBg: string;
    accentText: string;
    accentHover: string;
    glassStyle: string;
  }> = {
    'minimal-white': {
      id: 'minimal-white',
      name: 'Neo Default',
      emoji: '✨',
      bg: 'bg-[#F8F9FB] sm:bg-[#F2F4F7]',
      sidebarBg: 'bg-[#FAFAFA]/90 backdrop-blur-3xl border-r border-[#E5E5EA]',
      cardBg: 'bg-white/95 backdrop-blur-2xl border border-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-400',
      borderColor: 'border-[#E5E5EA]',
      textPrimary: 'text-[#1D1D1F]',
      textMuted: 'text-[#86868B]',
      accentBg: 'bg-gradient-to-tr from-[#1D1D1D] to-[#434343]',
      accentText: 'text-white font-medium tracking-wide drop-shadow-sm',
      accentHover: 'hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300',
      glassStyle: 'bg-white/70 backdrop-blur-2xl border border-white/40'
    },
    'midnight-black': {
      id: 'midnight-black',
      name: 'Neo Batman',
      emoji: '🦇',
      bg: 'bg-[#000000]',
      sidebarBg: 'bg-[#050505]/95 backdrop-blur-3xl border-r border-[#1C1C1E]',
      cardBg: 'bg-[#111111]/80 backdrop-blur-2xl border border-[#2C2C2E] shadow-[0_8px_32px_rgba(0,0,0,0.8)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.03)] hover:border-[#3A3A3C] transition-all duration-500',
      borderColor: 'border-[#1C1C1E]',
      textPrimary: 'text-[#F5F5F7]',
      textMuted: 'text-[#86868B]',
      accentBg: 'bg-gradient-to-tr from-[#1C1C1E] to-[#3A3A3C] border border-[#48484A] shadow-[inset_0_1px_rgba(255,255,255,0.1)]',
      accentText: 'text-[#E5E5EA] font-semibold tracking-wider drop-shadow-sm',
      accentHover: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:border-[#636366] hover:scale-[1.02] transition-all duration-300',
      glassStyle: 'bg-[#0A0A0A]/80 backdrop-blur-3xl border border-[#1C1C1E]'
    },
    'sakura-pink': {
      id: 'sakura-pink',
      name: 'Neo Blossom',
      emoji: '🌸',
      bg: 'bg-[#FAF0F4]',
      sidebarBg: 'bg-[#FFF5F8]/90 backdrop-blur-3xl border-r border-[#FFE1EB]',
      cardBg: 'bg-white/80 backdrop-blur-2xl border border-[#FFE1EB] shadow-[0_8px_32px_rgba(233,30,99,0.06)] hover:border-[#FFB6C1] hover:shadow-[0_8px_32px_rgba(233,30,99,0.12)] transition-all duration-400',
      borderColor: 'border-[#FFE1EB]',
      textPrimary: 'text-[#D81B60]',
      textMuted: 'text-[#E91E63]/70',
      accentBg: 'bg-gradient-to-tr from-[#FF4081] to-[#F50057] shadow-[0_4px_15px_rgba(245,0,87,0.3)]',
      accentText: 'text-white font-semibold tracking-wide drop-shadow-sm',
      accentHover: 'hover:brightness-110 hover:shadow-[0_8px_20px_rgba(245,0,87,0.4)] hover:scale-[1.02] transition-all duration-300',
      glassStyle: 'bg-white/60 backdrop-blur-2xl border border-[#FFE1EB] shadow-[0_8px_32px_rgba(233,30,99,0.05)]'
    }
  };

  const [activeTheme, setActiveTheme] = useState(() => {
    const current = localStorage.getItem('neonotex_theme');
    if (['midnight-black', 'sakura-pink', 'minimal-white'].includes(current || '')) {
      return current!;
    }
    return 'minimal-white';
  });

  const changeTheme = (themeId: string) => {
    localStorage.setItem('neonotex_theme', themeId);
    setActiveTheme(themeId);
    window.dispatchEvent(new Event('neonotex_theme_changed'));
  };

  const preset = THEMES[activeTheme] || THEMES['minimal-white'];

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${preset.bg} ${preset.textPrimary} flex flex-col md:flex-row selection:bg-black selection:text-white transition-colors duration-300 font-sans relative ${activeTheme === 'sakura-pink' ? 'sakura-theme' : ''}`}>
      
      {activeTheme === 'sakura-pink' && <SakuraPetals />}
      {activeTheme === 'midnight-black' && <DarkKnightBackground />}

      {/* Sidebar Component */}
      <Sidebar />
      
      {/* Mobile Header (Hidden on Tablet and Desktop) */}
      {!isNoteRoute && (
        <div className={`md:hidden flex items-center justify-between border-b ${preset.borderColor} ${activeTheme === 'midnight-black' ? 'bg-[#0A0A0A]/90' : 'bg-white/70'} backdrop-blur-2xl px-4 py-3 sticky top-0 z-50 shadow-sm`}>
           <div className="flex items-center gap-2">
             {activeTheme === 'midnight-black' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#F7C948" className="drop-shadow-[0_0_8px_rgba(247,201,72,0.8)] animate-pulse">
                  <path d="M23.95 10.632C23.684 10.276 21.05 8.001 16.5 8.125C15.541 8.152 14.733 8.358 14.07 8.65C13.91 7.218 13.336 6.326 12.768 5.768L12.551 5.385C12.43 5.176 12.193 5 12 5C11.807 5 11.57 5.176 11.448 5.385L11.232 5.768C10.664 6.326 10.09 7.218 9.93 8.65C9.267 8.358 8.459 8.152 7.5 8.125C2.95 8.001 0.316 10.276 0.05 10.632C-0.088 10.817 0.04 11 0.25 11C2.5 11 4.5 11.5 5.5 13C6.446 14.419 6.84 16 6.84 16C6.84 16 8 15 10 13C11.134 11.866 11.5 11.5 12 11.5C12.5 11.5 12.866 11.866 14 13C16 15 17.159 16 17.159 16C17.159 16 17.554 14.419 18.5 13C19.5 11.5 21.5 11 23.75 11C23.96 11 24.088 10.817 23.95 10.632Z" />
                </svg>
              ) : (
                <Logo size={28} theme={activeTheme} />
              )}
             <div className="flex flex-col">
               {activeTheme === 'sakura-pink' ? (
                 <span className={`font-extrabold tracking-tight font-sans text-lg leading-none text-[#D81B60] flex items-center gap-1`}>
                   Neonotex
                 </span>
               ) : (
                 <span className={`font-extrabold tracking-tight font-sans text-lg leading-none ${activeTheme === 'midnight-black' ? 'text-white' : 'text-black'}`}>Neonotex</span>
               )}
             </div>
           </div>
           <div className="flex items-center gap-2">
             <button 
               onClick={() => setIsMobileNavOpen(true)}
               className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${activeTheme === 'midnight-black' ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-black hover:bg-slate-100'}`}
             >
               <Menu size={20} />
             </button>
           </div>
        </div>
      )}

      {/* Mobile/Tablet Navigation Drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
        isMobileNavOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
      }`}>
        <div 
          onClick={() => setIsMobileNavOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" 
        />
        
        <div className={`absolute top-0 bottom-0 left-0 w-72 md:w-[280px] ${activeTheme === 'midnight-black' ? 'bg-[#000000] text-white' : 'bg-white'} border-r ${preset.borderColor} shadow-2xl flex flex-col p-6 transition-transform duration-[250ms] overscroll-none ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className={`flex items-center justify-between pb-5 mb-5 border-b ${preset.borderColor} shrink-0`}>
            <div className="flex items-center gap-2">
              {activeTheme === 'midnight-black' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#F7C948" className="drop-shadow-[0_0_8px_rgba(247,201,72,0.8)] animate-pulse">
                  <path d="M23.95 10.632C23.684 10.276 21.05 8.001 16.5 8.125C15.541 8.152 14.733 8.358 14.07 8.65C13.91 7.218 13.336 6.326 12.768 5.768L12.551 5.385C12.43 5.176 12.193 5 12 5C11.807 5 11.57 5.176 11.448 5.385L11.232 5.768C10.664 6.326 10.09 7.218 9.93 8.65C9.267 8.358 8.459 8.152 7.5 8.125C2.95 8.001 0.316 10.276 0.05 10.632C-0.088 10.817 0.04 11 0.25 11C2.5 11 4.5 11.5 5.5 13C6.446 14.419 6.84 16 6.84 16C6.84 16 8 15 10 13C11.134 11.866 11.5 11.5 12 11.5C12.5 11.5 12.866 11.866 14 13C16 15 17.159 16 17.159 16C17.159 16 17.554 14.419 18.5 13C19.5 11.5 21.5 11 23.75 11C23.96 11 24.088 10.817 23.95 10.632Z" />
                </svg>
              ) : (
                <Logo size={28} theme={activeTheme} />
              )}
              {activeTheme === 'sakura-pink' ? (
                <span className={`font-extrabold text-[#D81B60] tracking-tight text-lg font-sans leading-none flex items-center gap-1`}>
                  Neonotex
                </span>
              ) : (
                <span className={`font-extrabold ${activeTheme === 'midnight-black' ? 'text-white' : 'text-black'} tracking-tight text-lg font-sans leading-none`}>Neonotex</span>
              )}
            </div>
            <button 
              onClick={() => setIsMobileNavOpen(false)}
              className={`p-1.5 rounded-lg transition-colors ${activeTheme === 'midnight-black' ? 'text-slate-500 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-black hover:bg-[#F5F5F5]'}`}
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto min-h-0 py-2 -mx-2 px-2 scrollbar-none">
            {[
              { label: '🏠 Home', path: RoutePath.HOME },
              { label: '📝 Notes', path: RoutePath.NOTES },
              { label: '✅ My Tasks', path: RoutePath.TASKS },
              { label: '📚 Collections', path: RoutePath.COLLECTIONS },
              { label: '📱 QR Generator', path: RoutePath.QR_GENERATOR },
              { label: '⭐ Favorites', path: RoutePath.FAVORITES },
              { label: '🛍️ Neon Store', path: RoutePath.STORE },
              { label: '🗑️ Trash', path: RoutePath.TRASH },
              { label: '⚙️ Neo Account', path: RoutePath.ACCOUNT },
            ].map((item: { label: string, path: any, isNew?: boolean }) => {
              // Custom logic just like getIsActive in Sidebar
              let isItemActive = false;
              if (item.path === RoutePath.HOME) {
                isItemActive = location.pathname === RoutePath.HOME;
              } else if (item.path === RoutePath.NOTES && location.pathname === RoutePath.NOTES) {
                isItemActive = true;
              } else if (item.path !== RoutePath.HOME && item.path !== RoutePath.NOTES) {
                isItemActive = location.pathname.startsWith(item.path);
              }

              return (
                <button
                  key={item.path}
                  onClick={() => { setIsMobileNavOpen(false); navigate(item.path); }}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] border ${
                    isItemActive
                      ? (activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] text-white border-white/10' : 'bg-black/[0.04] text-black border-[#ECECEC]')
                      : (activeTheme === 'midnight-black' ? 'text-slate-400 hover:bg-[#161616] hover:text-white border-transparent' : 'text-slate-500 hover:bg-slate-100 hover:text-black border-transparent')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span>{item.label}</span>
                  </div>
                  {item.isNew && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${activeTheme === 'midnight-black' ? 'bg-[#F7C948]/20 text-[#F7C948]' : 'bg-indigo-50 text-indigo-600'}`}>
                      New
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* LOGO TAGLINE */}
          <div className="mt-auto pt-6 border-t border-slate-200/50 flex justify-center pb-6 md:pb-8  shrink-0">
            <span className={`text-[11px] font-medium tracking-[0.15em] uppercase opacity-80 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-[#8A8A8A]'}`}>
              Think It. Push It.
            </span>
          </div>

        </div>
      </div>

      <main className="flex-1 flex flex-col min-h-screen lg:pl-64 transition-all duration-300 relative z-10">
        
        {/* Top Header */}
        {!isNoteRoute && (
          <div className="relative md:sticky md:top-4 z-[100] px-4 lg:px-8 mb-4 pt-4 md:pt-0">
            <header className={`flex h-16 items-center justify-between rounded-2xl border ${preset.borderColor} ${activeTheme === 'midnight-black' ? 'bg-[#0A0A0A]/80 backdrop-blur-xl' : 'bg-white/95'} px-6 shadow-subtle transition-all`}>
              {/* Tablet Menu Toggle (Visible only on md to lg) */}
              <div className="hidden md:flex lg:hidden items-center gap-3 mr-4 shrink-0">
                <button 
                  onClick={() => setIsMobileNavOpen(true)}
                  className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${activeTheme === 'midnight-black' ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-black hover:bg-slate-100'}`}
                >
                  <Menu size={20} />
                </button>
              </div>

            {/* Search Bar Container */}
            <div ref={searchRef} className="relative flex-1 max-w-[200px] sm:max-w-sm min-w-0 mr-2 sm:mr-4">
                <div className={`flex items-center gap-2 sm:gap-3 text-slate-500 group rounded-full ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5 backdrop-blur-xl focus-within:bg-[#161616] focus-within:ring-white/10 focus-within:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]' : 'bg-[#F5F5F5] border-[#EAEAEA] focus-within:bg-white focus-within:ring-black/5 focus-within:border-black/10'} px-3 sm:px-4 py-2 border focus-within:ring-2 transition-all duration-300 w-full relative overflow-hidden`}>
                    <div className="relative flex items-center justify-center shrink-0">
                        {isSearching ? (
                             <Loader2 size={16} className="text-slate-600 animate-spin shrink-0" />
                        ) : (
                             <Search size={16} className="text-slate-400 group-focus-within:text-black transition-colors shrink-0" />
                        )}
                    </div>
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`bg-transparent text-xs sm:text-sm ${activeTheme === 'midnight-black' ? 'text-white' : 'text-black'} placeholder:text-slate-400 focus:outline-none min-w-0 w-full ml-1 sm:ml-2 font-medium`}
                        onFocus={() => searchQuery.trim() && setShowResults(true)}
                    />
                    {searchQuery && (
                        <button onClick={clearSearch} className="text-slate-400 hover:text-black transition-colors shrink-0">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && (
                    <div className="absolute top-full left-0 right-0 mt-3 w-full origin-top animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className={`overflow-hidden rounded-2xl border ${preset.borderColor} ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E]' : 'bg-white'} shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]`}>
                            <div className={`px-4 py-2 border-b text-[10px] uppercase tracking-widest text-[#8e8e93] font-bold ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5' : 'bg-slate-50 border-[#ECECEC]'}`}>
                                Results for "{searchQuery}"
                            </div>
                            <div className="max-h-[300px] overflow-y-auto py-1">
                                {searchResults.length > 0 ? (
                                    searchResults.map((note) => (
                                        <button
                                            key={note.id}
                                            onClick={() => handleSearchResultClick(note.id)}
                                            className={`w-full text-left px-4 py-3 transition-colors group flex items-start gap-3 border-b last:border-0 ${activeTheme === 'midnight-black' ? 'hover:bg-white/5 border-white/5' : 'hover:bg-slate-50 border-slate-100'}`}
                                        >
                                            <div className={`mt-1 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${activeTheme === 'midnight-black' ? 'bg-[#111111] text-white/70' : 'bg-slate-100 text-slate-600'}`}>
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className={`text-sm font-semibold ${activeTheme === 'midnight-black' ? 'text-[#FFFFFF] group-hover:text-white' : 'text-slate-900 group-hover:text-black'} truncate transition-colors`}>
                                                    {note.title || 'Untitled Note'}
                                                </h4>
                                                <p className="text-xs text-slate-400 truncate mt-0.5 opacity-80">
                                                    {getPreviewText(note.content) || 'No content'}
                                                </p>
                                                <div className="mt-1.5 flex items-center gap-2 animate-pulse">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeTheme === 'midnight-black' ? 'text-[#8e8e93] bg-[#111111]' : 'text-slate-400 bg-slate-100'}`}>
                                                        {new Date(note.updatedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-slate-500">
                                        <p className="text-sm">No matching notes found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ">
              {/* Premium 🎨 Theme Dropdown Selection */}
              <div className="relative" ref={themeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full border ${activeTheme === 'midnight-black' ? 'border-white/5 text-white bg-[#111111] hover:bg-[#1C1C1E]' : 'border-[#ECECEC] hover:border-black text-black bg-[#F7F7F7] hover:bg-slate-100'} text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0`}
                >
                  <span>🎨</span>
                  <span className="hidden xs:inline">Theme</span>
                </button>

                {isThemeDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsThemeDropdownOpen(false)} />
                    <div 
                      className={`absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 top-full mt-2 z-50 w-64 rounded-[24px] p-2 xl:p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.2)] border ${activeTheme === 'midnight-black' ? 'bg-[#151515]/90 border-[#2C2C2E] shadow-[0_16px_40px_rgba(0,0,0,0.5)]' : 'bg-white/95 border-white shadow-[0_16px_40px_rgba(0,0,0,0.1)]'} backdrop-blur-[40px] font-sans animate-in fade-in zoom-in-95 duration-200 overflow-hidden`}>
                      <p className={`px-3 pt-2 pb-1.5 text-[10px] uppercase font-bold tracking-widest ${activeTheme === 'midnight-black' ? 'text-[#86868B]' : 'text-slate-400'}`}>Select Theme</p>
                      <div className="space-y-1 mt-1">
                        {Object.values(THEMES).map((t) => {
                          const isSelected = activeTheme === t.id;
                          return (
                            <button
                              key={t.id}
                              onClick={() => {
                                changeTheme(t.id);
                                setIsThemeDropdownOpen(false);
                              }}
                              className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-[16px] transition-all duration-300 font-semibold group overflow-hidden ${
                                isSelected 
                                  ? `${t.accentBg} ${t.accentText} shadow-md` 
                                  : `hover:bg-black/5 ${activeTheme === 'midnight-black' ? 'hover:bg-white/10 text-[#E5E5EA]' : 'text-[#1D1D1F]'}`
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                              )}
                              
                              <div className="flex items-center gap-3 relative z-10">
                                <span className="text-sm shrink-0 drop-shadow-sm">{t.emoji}</span>
                                <span className="text-[13px] tracking-tight">{t.name}</span>
                              </div>

                              {isSelected && (
                                <div className="relative flex h-1.5 w-1.5 z-10 mr-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Offline Indicator Pill */}
              {isOffline && (
                <div 
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full border ${activeTheme === 'midnight-black' ? 'border-amber-500/20 text-amber-500 bg-amber-500/10' : 'border-amber-200 text-amber-700 bg-amber-50'} text-xs font-bold shadow-sm shrink-0`}
                  title="You are offline. Notes are saved locally and will sync when reconnected."
                >
                  <WifiOff size={14} className="animate-pulse" />
                  <span className="hidden sm:inline">Offline</span>
                </div>
              )}

              {/* Current Tracking Streak Pill */}
              <div 
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full border ${activeTheme === 'midnight-black' ? 'border-white/5 text-white bg-[#111111]' : 'border-[#ECECEC] text-black bg-[#F7F7F7]'} text-xs font-bold shadow-sm shrink-0  group`}
                title={`Current Writing Streak: ${streak} Days`}
              >
                <Flame size={15} className={`transition-all duration-300 ${streak > 0 ? 'text-orange-500 fill-orange-500/20' : 'text-slate-400'}`} />
                <span className={streak > 0 ? "text-orange-600 dark:text-orange-500" : "text-slate-500"}>{streak}</span>
              </div>

              {isAuthenticated ? (
                  <div className="flex items-center gap-4" ref={menuRef}>
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="relative flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md p-0.5 border border-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.15)] cursor-pointer transition-all duration-200 ease-out hover:scale-[1.04] focus:outline-none overflow-hidden"
                      >
                        {user?.avatarUrl ? (
                          user?.avatarUrl.startsWith('animated:') ? (
                            <AnimatedAvatar 
                              id={user.avatarUrl.replace('animated:', '')} 
                              className="w-9 h-9 md:w-10 md:h-10 rounded-full" 
                              interactive={false} 
                            />
                          ) : (
                            <StorageImage 
                              path={user?.avatarUrl} 
                              alt="User Avatar" 
                              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover"
                              showLoading={false}
                            />
                          )
                        ) : (
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-zinc-950 text-white font-extrabold text-xs flex items-center justify-center border border-zinc-800 shadow-sm leading-none shrink-0">
                            {(() => {
                              const name = user?.name;
                              const email = user?.email;
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
                            })()}
                          </div>
                        )}
                      </button>

                      {isProfileMenuOpen && (
                        <div className={`absolute right-0 mt-3 w-56 z-50 border rounded-2xl py-2 transition-all duration-180 ease-out origin-top-right whitespace-nowrap shadow-lg ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/5' : 'bg-white border-[#EAEAEA] shadow-[0_22px_70px_rgba(15,23,42,0.15)]'}`}>
                          <div className="px-2 space-y-1">
                            <button 
                              onClick={() => handleNavigation(RoutePath.ACCOUNT)}
                              className={`w-full flex items-center gap-3 px-3.5 py-2.5 cursor-pointer rounded-xl transition-colors duration-150 text-left ${activeTheme === 'midnight-black' ? 'hover:bg-[#111111]' : 'hover:bg-[#F5F5F5]'}`}
                            >
                              <Settings className={`w-4 h-4 ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}`} />
                              <div className="flex flex-col">
                                <span className={`text-sm font-semibold ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>Account Settings</span>
                                <span className={`text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px] ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}`}>Manage workspace</span>
                              </div>
                            </button>

                            <div className={`h-px my-1 ${activeTheme === 'midnight-black' ? 'bg-white/5' : 'bg-[#EAEAEA]'}`} />

                            <button 
                              onClick={handleLogout}
                              className={`w-full flex items-center gap-3 px-3.5 py-2.5 cursor-pointer rounded-xl transition-colors duration-150 text-left ${activeTheme === 'midnight-black' ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'}`}
                            >
                              <LogOut className={`w-4 h-4 ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}`} />
                              <span className={`text-sm font-bold ${activeTheme === 'midnight-black' ? 'text-slate-300' : 'text-slate-700'}`}>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              ) : (
                  <div className="flex items-center shrink-0 ">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="rounded-full shadow bg-gradient-to-b from-slate-800 to-black hover:brightness-110 text-white px-4 sm:px-5 py-1.5 md:py-2 whitespace-nowrap shrink-0 text-xs font-bold border-none transition-all duration-150 cursor-pointer active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                      onClick={handleLogin}
                    >
                      Sign In
                    </Button>
                  </div>
              )}
            </div>
          </header>
        </div>
        )}

        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-4 relative transition-all flex flex-col ">
          <div className="flex-1">
            <Outlet />
          </div>

          {location.pathname === RoutePath.HOME && (
            <footer className="mt-20 pt-8 pb-8 border-t border-slate-200/50 flex flex-col items-center gap-4 text-center ">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-bold tracking-widest uppercase text-slate-400">
                <span className="flex items-center gap-1.5"><span className="text-sm">🔒</span> Privacy First</span>
                <span className="flex items-center gap-1.5"><span className="text-sm">🛡️</span> End-to-End Encrypted</span>
                <span className="flex items-center gap-1.5"><span className="text-sm">⚡</span> Secure by Design</span>
              </div>
              <p className="text-[10px] text-slate-400/80 font-semibold tracking-wide">© {new Date().getFullYear()} Neonotex. All rights reserved.</p>
            </footer>
          )}
        </div>
      </main>
    </div>
  );
};
