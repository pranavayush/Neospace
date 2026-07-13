import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Search, ArrowUpDown, Calendar, Clock, FileText, ArrowRight,
  Loader2, Tag, Trash2, Edit3, HeartCrack, Trash, Plus, Sparkles, ChevronDown
} from 'lucide-react';
import { noteService } from '../../services/noteService';
import { collectionService } from '../../services/collectionService';
import { Note, CollectionItem, RoutePath } from '../../types';
import { StorageImage } from '../../components/ui/StorageImage';
import { CollectionItemCard } from './CollectionItemCard';

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Array<Note | CollectionItem>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recently_added' | 'last_modified'>('recently_added');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Read theme
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

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const allNotes = await noteService.getAll();
      const starredNotes = allNotes.filter(n => n.tags?.includes('favorite') && !n.tags?.includes('trash'));
      
      const allItems = await collectionService.getAllItems();
      const starredItems = allItems.filter(i => i.isFavorite);
      
      setItems([...starredNotes, ...starredItems]);
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        console.warn("Network offline, could not fetch favorites.");
      } else {
        console.error("Failed to fetch favorites", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnfavoriteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const note = items.find(n => n.id === noteId && 'content' in n) as Note;
      if (!note) return;
      
      const newTags = (note.tags || []).filter(t => t !== 'favorite');
      await noteService.update(noteId, { tags: newTags });
      
      setItems(prev => prev.filter(n => n.id !== noteId));
      showToast("Removed from Favorites");
    } catch (err) {
      console.error("Failed to unfavorite", err);
    }
  };

  const handleUnfavoriteItem = async (item: CollectionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await collectionService.updateItem(item.id, { isFavorite: false });
      setItems(prev => prev.filter(n => n.id !== item.id));
      showToast("Removed from Favorites");
    } catch (err) {
      console.error("Failed to unfavorite", err);
    }
  };

  // Filter based on search query
  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const titleMatch = item.title.toLowerCase().includes(query);
    let contentMatch = false;
    let tagsMatch = false;

    if ('content' in item) {
      const contentText = item.content.replace(/<[^>]*>/g, '').toLowerCase();
      contentMatch = contentText.includes(query);
    }
    
    if (item.tags) {
       tagsMatch = item.tags.some(t => t.toLowerCase().includes(query));
    }
    
    return titleMatch || contentMatch || tagsMatch;
  });

  // Sort
  const sortedItems = [...filteredItems].sort((a, b) => {
    const timeA1 = new Date(a.createdAt).getTime();
    const timeB1 = new Date(b.createdAt).getTime();
    
    const timeA2 = 'updatedAt' in a ? new Date(a.updatedAt).getTime() : timeA1;
    const timeB2 = 'updatedAt' in b ? new Date(b.updatedAt).getTime() : timeB1;

    if (sortBy === 'recently_added') {
      return timeB1 - timeA1;
    } else {
      return timeB2 - timeA2;
    }
  });

  const getPreviewText = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > 120 ? text.substring(0, 120) + "..." : text;
  };

  // Theme matching styling configs
  const THEME_STYLES: Record<string, {
    bg: string;
    cardBg: string;
    cardBorder: string;
    text: string;
    subtext: string;
    accent: string;
  }> = {
    'minimal-white': {
      bg: 'bg-white',
      cardBg: 'bg-[#FAFAFA]',
      cardBorder: 'border-slate-200/60',
      text: 'text-zinc-950',
      subtext: 'text-slate-500',
      accent: 'text-[#5B5CF0]'
    },
    'midnight-black': {
      bg: 'bg-[#000000]',
      cardBg: 'bg-[#111111] hover:bg-[#1A1A1A] transition-colors border-[#1A1A1A] hover:border-[#D4A017]/30 hover:shadow-[0_8px_30px_rgba(247,201,72,0.05)]',
      cardBorder: 'border-[#1A1A1A]',
      text: 'text-[#FFFFFF]',
      subtext: 'text-[#B0B0B0]',
      accent: 'text-[#F7C948]'
    },
    'sakura-pink': {
      bg: 'bg-transparent',
      cardBg: 'bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(255,105,180,0.1)] hover:shadow-[0_12px_40px_rgba(255,105,180,0.2)] hover:border-[#FFB6C1] transition-all duration-300',
      cardBorder: 'border-[#FFD6E8]',
      text: 'text-[#D81B60]',
      subtext: 'text-[#E91E63]/70',
      accent: 'text-[#FF3366]'
    }
  };

  const currentTheme = THEME_STYLES[activeTheme] || THEME_STYLES['minimal-white'];

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header Block */}
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b ${currentTheme.cardBorder}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl text-amber-500">⭐</span>
            <h1 className={`text-3xl md:text-5xl font-extrabold tracking-tight font-sans ${currentTheme.text}`}>
              Favorites
            </h1>
          </div>
          <p className={`text-sm md:text-base font-semibold mt-1 opacity-90 leading-relaxed max-w-xl ${currentTheme.subtext}`}>
            Your most important notes in one place.
          </p>
        </div>

        <span className={`self-start md:self-auto text-xs font-bold tracking-wider uppercase rounded-full flex items-center gap-1.5 px-3 py-1 border ${activeTheme === 'midnight-black' ? 'bg-[#F7C948]/10 text-[#F7C948] border-[#F7C948]/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
          <Star size={12} fill="currentColor" /> {items.length} Starred Items
        </span>
      </div>

      {/* Toolbar Options (Filters & Search) */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className={`w-full sm:max-w-md flex items-center gap-2 rounded-2xl px-3.5 py-2.5 transition-all ${activeTheme === 'midnight-black' ? 'bg-[#111111] border border-white/5 focus-within:bg-[#1C1C1E] focus-within:ring-2 focus-within:ring-white/10' : 'bg-appleGray-100 border border-slate-200 focus-within:ring-2 focus-within:ring-black/5 focus-within:bg-white'}`}>
            <Search size={16} className={currentTheme.subtext} />
            <input 
              type="text" 
              placeholder="Search in favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-transparent text-sm focus:outline-none w-full font-medium placeholder-slate-400 ${currentTheme.text}`}
            />
          </div>

          {/* Sort Controller */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto relative">
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border focus:outline-none cursor-pointer transition-colors ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5 hover:bg-[#1a1a1a]' : 'bg-[#F5F5F7] border-[#E5E5EA] hover:bg-[#EBEBEF]'}`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${currentTheme.subtext}`}>
                <ArrowUpDown size={12} /> Sort:
              </span>
              <span className={`text-xs font-bold capitalize flex items-center gap-1.5 ${activeTheme === 'midnight-black' ? 'text-slate-300' : 'text-slate-700'}`}>
                {sortBy === 'recently_added' ? 'Recently Added' : 'Last Modified'}
                <ChevronDown size={14} className="opacity-60" />
              </span>
            </button>
            
            {isSortDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSortDropdownOpen(false)} />
                <div className={`absolute right-0 top-full mt-2 z-50 w-48 rounded-xl shadow-lg border overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-slate-200'}`}>
                  {[
                    { value: 'recently_added', label: 'Recently Added' },
                    { value: 'last_modified', label: 'Last Modified' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as any);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${
                        sortBy === option.value 
                          ? (activeTheme === 'midnight-black' ? 'bg-[#3A82F6] text-white' : 'bg-[#007AFF] text-white')
                          : (activeTheme === 'midnight-black' ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50')
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main star grid content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-slate-300 h-8 w-8" />
          <span className="text-xs text-slate-450 font-extrabold uppercase tracking-widest">Reading Starred notes...</span>
        </div>
      ) : sortedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItems.map((item) => {
            if ('content' in item) {
              const note = item as Note;
              const hasCover = !!note.thumbnailUrl;
              return (
                <div 
                  key={`note-${note.id}`}
                  onClick={() => navigate(RoutePath.NOTE_DETAIL.replace(':id', note.id))}
                  className={`group relative rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full ${activeTheme === 'midnight-black' ? 'bg-[#161616] border-white/5 hover:bg-[#1C1C1E] shadow-sm hover:border-white/10' : 'bg-white border-slate-250/50 hover:bg-slate-50/20 shadow-subtle hover:shadow-md hover:-translate-y-1'}`}
                >
                  {/* Micro cover height image banner */}
                  {hasCover && (
                    <div className={`h-36 w-full relative overflow-hidden border-b ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5' : 'bg-slate-50 border-slate-200/50'}`}>
                      <StorageImage 
                        path={note.thumbnailUrl!} 
                        alt={note.title} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-extrabold text-lg transition-colors leading-snug line-clamp-1 ${activeTheme === 'midnight-black' ? 'text-white group-hover:text-amber-500' : 'text-[#1c1c1e] group-hover:text-amber-600'}`}>
                          {note.title || 'Untitled note'}
                        </h3>
                        
                        {/* Interactive Unstar trigger button */}
                        <button
                          onClick={(e) => handleUnfavoriteNote(note.id, e)}
                          className={`p-1.5 rounded-full hover:scale-110 hover:rotate-12 transition-all cursor-pointer shadow-sm border flex-shrink-0 ${activeTheme === 'midnight-black' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-500 hover:bg-amber-100 border-amber-200/50'}`}
                          title="Remove from favorites"
                        >
                          <Star size={14} fill="currentColor" />
                        </button>
                      </div>

                      <p className={`text-xs font-medium leading-relaxed font-sans line-clamp-3 ${currentTheme.subtext}`}>
                        {getPreviewText(note.content) || <span className="italic opacity-50">No additional text content.</span>}
                      </p>
                    </div>

                    <div className={`space-y-3.5 pt-3 border-t ${activeTheme === 'midnight-black' ? 'border-white/5' : 'border-slate-100'}`}>
                      <div className="flex flex-wrap gap-1">
                        {note.tags && note.tags.filter(t => t !== 'favorite' && t !== 'pinned').map(tag => (
                          <span key={tag} className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${activeTheme === 'midnight-black' ? 'bg-white/10 border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200/50 text-slate-500'}`}>
                            <Tag size={8} /> #{tag}
                          </span>
                        ))}
                      </div>

                      <div className={`flex items-center justify-between text-[11px] font-bold ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> Edited {new Date(note.updatedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </span>
                        
                        <span className={`text-[10px] uppercase font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
                          Open Note <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              const collectionItem = item as CollectionItem;
              return (
                <CollectionItemCard 
                  key={`item-${collectionItem.id}`} 
                  item={collectionItem} 
                  onDelete={() => {}} // Disabled from favorites view
                  onToggleFavorite={handleUnfavoriteItem}
                  onTogglePin={() => {}} // Disabled from favorites view
                />
              );
            }
          })}
        </div>
      ) : searchQuery ? (
        <div className={`text-center py-20 px-4 border border-dashed rounded-3xl ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E]/40 border-white/10' : 'bg-slate-50/50 border-slate-200'}`}>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4 border ${activeTheme === 'midnight-black' ? 'bg-[#111111] text-slate-500 border-white/5' : 'bg-appleGray-100 text-[#8e8e93] border-[#ECECEC]'}`}>
            <Search size={20} />
          </div>
          <p className={`text-sm font-bold ${activeTheme === 'midnight-black' ? 'text-white' : 'text-[#1c1c1e]'}`}>No matching favorites found</p>
          <p className={`text-xs mt-1 ${activeTheme === 'midnight-black' ? 'text-[#8E8E93]' : 'text-[#8e8e93]'}`}>Try searching another tag or term.</p>
        </div>
      ) : (
        /* Empty State */
        <div className="mx-auto max-w-md text-center py-16 md:py-24 animate-in zoom-in-95 duration-400">
          <div className={`relative inline-flex h-20 w-20 items-center justify-center rounded-3xl shadow-sm border mb-7 scale-102 hover:scale-105 hover:rotate-2 transition-transform duration-300 ${activeTheme === 'midnight-black' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-amber-50/50 text-amber-500 border-amber-200/50'}`}>
            <Star size={34} fill="currentColor" className="opacity-90" />
            <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#F7C948] text-black border-[#000000]' : 'bg-black text-white border-white'}`}>
              <Plus size={10} />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className={`text-xl font-bold leading-tight ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>
              ⭐ No Favorite Notes Yet
            </h2>
            <p className={`font-semibold text-xs leading-relaxed max-w-xs mx-auto opacity-90 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
              Start writing with confidence. Your notes are protected with end-to-end encryption.
            </p>
          </div>

          <button 
            onClick={() => navigate(RoutePath.NOTES)}
            className={`mt-8 rounded-full px-6 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer ${activeTheme === 'midnight-black' ? 'bg-[#F7C948] text-black hover:bg-[#D4A017]' : 'bg-zinc-950 text-white hover:bg-zinc-850'}`}
          >
            Go to My Notes
          </button>
        </div>
      )}

      {/* Elegant Minimalist Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-zinc-950 border border-zinc-800 text-white font-sans font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
};
