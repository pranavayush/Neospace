import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, FileText, Loader2, Star, Clock, ChevronLeft, ChevronRight, Calendar as CalendarIcon
} from 'lucide-react';
import { RoutePath, Note } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { noteService } from '../../services/noteService';

const getRelativeTimeString = (dateStr: string): string => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHr < 24) {
    return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter and Calendar Date states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterDate, setFilterDate] = useState<Date | null>(null);

  // Theme state
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('neonotex_theme') || 'minimal-white';
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(localStorage.getItem('neonotex_theme') || 'minimal-white');
    };
    window.addEventListener('neonotex_theme_changed', handleThemeChange);
    return () => window.removeEventListener('neonotex_theme_changed', handleThemeChange);
  }, []);

  const fetchHomeNotes = async () => {
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        const allNotes = await noteService.getAll();
        setNotes(allNotes.filter(n => !n.tags?.includes('trash')));
      } catch (error: any) {
        if (error.message === 'Failed to fetch') {
          console.warn('Network offline, could not fetch home notes.');
        } else {
          console.error('Failed to fetch home notes:', error);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchHomeNotes();
  }, [isAuthenticated]);

  const handleCreateClick = () => {
    if (isAuthenticated) {
      navigate(RoutePath.CREATE_NOTE);
    } else {
      navigate(RoutePath.LOGIN);
    }
  };

  const handleViewNote = (noteId: string) => {
    if (isAuthenticated) {
      navigate(RoutePath.NOTE_DETAIL.replace(':id', noteId));
    } else {
      navigate(RoutePath.LOGIN);
    }
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  // 1. Filtered Notes List: Show notes matching filterDate, or top 3 most recently updated
  const displayedNotes = filterDate 
    ? [...notes]
        .filter(note => isSameDay(new Date(note.createdAt), filterDate))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [...notes]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3);

  // Calendar setup
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const numDaysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIdx = new Date(year, month, 1).getDay();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIdx; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= numDaysInMonth; d++) {
    daysArray.push(d);
  }

  const shiftMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getNotesCreatedOnDay = (day: number) => {
    return notes.filter(n => {
      const cDate = new Date(n.createdAt);
      return cDate.getDate() === day && cDate.getMonth() === month && cDate.getFullYear() === year;
    });
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    if (filterDate && isSameDay(filterDate, clickedDate)) {
      setFilterDate(null);
    } else {
      setFilterDate(clickedDate);
    }
  };

  // Calendar Custom theme style sheets mapping
  const CALENDAR_THEMES: Record<string, {
    container: string;
    dayHover: string;
    todayBorder: string;
    todayText: string;
    hasNotesBg: string;
    hasNotesText: string;
    activeBg: string;
    activeText: string;
    dotBg: string;
  }> = {
    'minimal-white': {
      container: 'bg-[#FAFAFA] border-slate-200/60',
      dayHover: 'hover:bg-slate-200/50',
      todayBorder: 'border-zinc-950 text-zinc-950',
      todayText: 'text-zinc-950',
      hasNotesBg: 'bg-[#5B5CF0]/10 text-[#5B5CF0]',
      hasNotesText: 'text-[#5B5CF0]',
      activeBg: 'bg-zinc-950 text-white',
      activeText: 'text-white',
      dotBg: 'bg-[#5B5CF0]'
    },
    'midnight-black': {
      container: 'bg-[#111111] border-[#1A1A1A] shadow-[0_4px_20px_rgba(0,0,0,0.5)]',
      dayHover: 'hover:bg-[#1A1A1A] hover:border-[#D4A017]/30 transition-all duration-300',
      todayBorder: 'border-[#F7C948] text-[#F7C948] shadow-[0_0_10px_rgba(247,201,72,0.2)]',
      todayText: 'text-[#F7C948] font-bold',
      hasNotesBg: 'bg-[#F7C948]/10 text-[#F7C948] border border-[#F7C948]/20',
      hasNotesText: 'text-[#F7C948]',
      activeBg: 'bg-gradient-to-br from-[#F7C948] to-[#D4A017] text-black shadow-[0_0_15px_rgba(247,201,72,0.4)]',
      activeText: 'text-[#000000] font-bold',
      dotBg: 'bg-[#F7C948]'
    },
    'sakura-pink': {
      container: 'bg-white/80 backdrop-blur-2xl border border-[#FFD6E8] shadow-[0_8px_32px_rgba(255,105,180,0.1)]',
      dayHover: 'hover:bg-[#FFF0F5] hover:scale-[1.05] transition-all duration-300',
      todayBorder: 'border-[#FF3366] text-[#D81B60] shadow-[0_0_10px_rgba(255,51,102,0.2)]',
      todayText: 'text-[#D81B60] font-bold',
      hasNotesBg: 'bg-[#FFEBF5] text-[#D81B60] border border-[#FFD6E8]',
      hasNotesText: 'text-[#D81B60]',
      activeBg: 'bg-[#FF3366] text-white shadow-[0_4px_15px_rgba(255,51,102,0.3)]',
      activeText: 'text-white font-bold',
      dotBg: 'bg-[#FF3366] shadow-[0_0_5px_rgba(255,51,102,0.4)]'
    }
  };

  const activeCalTheme = CALENDAR_THEMES[activeTheme] || CALENDAR_THEMES['minimal-white'];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      
      {/* 👋 Welcome Banner (Elegant Apple Notes Pro / Notion inspired display) */}
      <div className={`relative w-full rounded-2xl md:rounded-[2rem] border overflow-hidden p-8 md:p-12 shadow-sm transition-all duration-500 ${
        activeTheme === 'midnight-black' 
          ? 'bg-[#111111] border-white/5' 
          : activeTheme === 'sakura-pink'
          ? 'bg-gradient-to-r from-[#FFF0F5] to-[#FFE4E1] border-[#FFD6E8]'
          : 'bg-gradient-to-r from-[#FDF9F6] via-[#FAF9F6] to-[#F1F5F9] border-[#ECECEC]'
      }`}>
        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-none text-current">
              Welcome, {isAuthenticated && user?.name ? user.name : 'Buddy'}
            </h1>
            <p className="text-slate-400 font-medium text-base md:text-lg max-w-lg mx-auto leading-relaxed font-sans">
              A beautiful place for every idea.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={handleCreateClick}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold shadow transition-all active:scale-95 cursor-pointer select-none ${
                activeTheme === 'midnight-black' 
                  ? 'bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border border-[#1A1A1A] text-[#F7C948] hover:shadow-[0_0_15px_rgba(247,201,72,0.3)] hover:border-[#F7C948]/50 shadow-[inset_0_1px_rgba(255,255,255,0.05)]' 
                  : activeTheme === 'sakura-pink'
                  ? 'bg-[#FF3366] text-white hover:bg-[#E91E63] shadow-[0_4px_15px_rgba(255,51,102,0.3)]'
                  : 'bg-black text-white hover:bg-slate-900'
              }`}
            >
              <PlusCircle size={14} />
              <span>Create a New Note</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className={`animate-spin h-8 w-8 ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}`} />
          <span className={`text-xs font-extrabold uppercase tracking-widest ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}`}>Loading workspace...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Main Left Column (Recent Notes) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-405'}`}>
                <FileText size={15} />
                <h3 className="text-xs uppercase tracking-widest font-extrabold">
                  {filterDate 
                    ? `📝 Notes Created ${filterDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` 
                    : '📝 Recent Notes'}
                </h3>
              </div>
              
              {filterDate ? (
                <button 
                  onClick={() => setFilterDate(null)}
                  className="text-xs font-bold text-slate-500 hover:text-black hover:underline cursor-pointer"
                >
                  Clear Filter
                </button>
              ) : (
                <button 
                  onClick={() => navigate(RoutePath.NOTES)}
                  className="text-xs font-bold text-[#5B5CF0] hover:underline cursor-pointer"
                >
                  View All
                </button>
              )}
            </div>

            {displayedNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayedNotes.map((note) => (
                  <div 
                    key={note.id}
                    onClick={() => handleViewNote(note.id)}
                    className={`group rounded-[18px] p-5 border cursor-pointer transition-all hover:-translate-y-[2px] shadow-sm duration-350 ${
                      activeTheme === 'midnight-black' 
                        ? 'bg-[#161616] border-white/5 hover:bg-[#1C1C1E]' 
                        : activeTheme === 'sakura-pink'
                        ? 'bg-white/70 backdrop-blur-lg border-[#FFD6E8] hover:border-[#FFB6C1] hover:bg-white/90 shadow-[0_4px_20px_rgba(255,105,180,0.05)]'
                        : 'bg-white border-[#ECECEC] hover:bg-black/[0.01]'
                    }`}
                  >
                  <h4 className={`font-extrabold text-sm transition-colors truncate flex items-center gap-1 ${activeTheme === 'midnight-black' ? 'text-white' : activeTheme === 'sakura-pink' ? 'text-[#D81B60]' : 'text-current'} group-hover:text-[#FF3366]`}>
                      {note.tags?.includes('favorite') && <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />}
                      <span>{note.tags?.includes('locked') ? '🔒 Secure Document Note' : (note.title || 'Untitled Note')}</span>
                    </h4>
                    <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-2 leading-relaxed opacity-90">
                      {note.tags?.includes('locked') ? 'Content is encrypted.' : (note.content.replace(/<[^>]*>/g, '') || "No content.")}
                    </p>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {new Date(note.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                      {note.tags && note.tags.filter(t => t !== 'pinned' && t !== 'favorite').length > 0 && (
                        <span className="text-[9px] font-bold text-[#5B5CF0] bg-[#5B5CF0]/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          #{note.tags.filter(t => t !== 'pinned' && t !== 'favorite')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`rounded-2xl border border-dashed p-8 text-center ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E]/50 border-white/10' : 'bg-slate-50/50 border-slate-200'}`}>
                <p className={`text-xs font-bold ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {filterDate ? 'No notes created on this date.' : 'Your workbench is currently empty.'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Click Create a New Note to begin writing.
                </p>
              </div>
            )}

          </div>
          <div className="space-y-6">
            


            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <CalendarIcon size={15} />
                <h3 className="text-xs uppercase tracking-widest font-extrabold">📅 Calendar</h3>
              </div>

            <div className={`p-5 rounded-2xl border ${activeCalTheme.container} shadow-sm transition-all duration-300`}>
              {/* Header month navigator */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-current">
                  {monthName} {year}
                </span>

                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => shiftMonth('prev')}
                    className="p-1 rounded-lg hover:bg-black/[0.05] text-slate-500 hover:text-black transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => shiftMonth('next')}
                    className="p-1 rounded-lg hover:bg-black/[0.05] text-slate-500 hover:text-black transition-colors cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Days labels */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase mb-2">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>

              {/* Calendar Days Matrix */}
              <div className="grid grid-cols-7 gap-1.5">
                {daysArray.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} />;
                  }

                  const matches = getNotesCreatedOnDay(day);
                  const hasNotes = matches.length > 0;
                  const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                  const isSelected = filterDate && isSameDay(filterDate, new Date(year, month, day));

                  const hoverText = hasNotes 
                    ? `${matches.length} note${matches.length > 1 ? 's' : ''} created`
                    : 'No notes created';

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      title={hoverText}
                      onClick={() => handleDayClick(day)}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? activeCalTheme.activeBg + ' ' + activeCalTheme.activeText
                          : isToday
                          ? `border-2 ${activeCalTheme.todayBorder} ${activeCalTheme.todayText} font-black`
                          : hasNotes
                          ? activeCalTheme.hasNotesBg + ' ' + activeCalTheme.hasNotesText + ' font-black'
                          : `text-slate-600 ${activeCalTheme.dayHover}`
                      }`}
                    >
                      <span>{day}</span>
                      {hasNotes && !isSelected && (
                        <span className={`absolute bottom-1 h-1 w-1 rounded-full ${activeCalTheme.dotBg}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tiny helpful detail label */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                <span>Hover day to see stats</span>
                {filterDate && (
                  <button 
                    onClick={() => setFilterDate(null)}
                    className="text-[9px] uppercase font-bold text-[#5B5CF0] hover:underline"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        </div>
      )}
    </div>
  );
};
