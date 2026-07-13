import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trash2, Search, Calendar, FileText, ArrowLeft, RefreshCw, X
} from 'lucide-react';
import { noteService } from '../../services/noteService';
import { Note, RoutePath } from '../../types';

export const Trash: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

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

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2500);
  };

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const trashNotes = await noteService.getTrash();
      setNotes(trashNotes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRecover = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    try {
      const tags = (note.tags || []).filter(t => t !== 'trash');
      await noteService.update(note.id, { tags }, { preserveUpdatedAt: true });
      setNotes(prev => prev.filter(n => n.id !== note.id));
      showToast('Note recovered successfully');
    } catch (err) {
      console.error(err);
      showToast('Error recovering note');
    }
  };

  const handleHardDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this note? This cannot be undone.")) return;
    try {
      await noteService.hardDelete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      showToast('Note permanently deleted');
    } catch (err) {
      console.error(err);
      showToast('Error deleting note');
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all notes in trash? This cannot be undone.")) return;
    try {
      setLoading(true);
      await Promise.all(notes.map(note => noteService.hardDelete(note.id)));
      setNotes([]);
      showToast('Trash emptied');
    } catch (err) {
      console.error(err);
      showToast('Error emptying trash');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <Trash2 size={16} className="text-emerald-400" />
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 mb-2">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-3 ${activeTheme === 'midnight-black' ? 'text-white' : 'text-black'}`}>
            Trash <span className={`flex h-7 items-center rounded-full px-3 text-sm font-semibold border ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>{notes.length}</span>
          </h1>

        </div>
        {notes.length > 0 && !loading && (
          <button
            onClick={handleEmptyTrash}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${
              activeTheme === 'midnight-black'
                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 shadow-sm'
            }`}
          >
            <Trash2 size={16} /> Empty Trash
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className={`h-6 w-6 animate-spin rounded-full border-2 border-t-transparent ${activeTheme === 'midnight-black' ? 'border-[#F7C948] border-t-transparent' : 'border-slate-200 border-t-black'}`}></div>
        </div>
      ) : notes.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed rounded-[28px] ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E]/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
          <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-6 shadow-sm border ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
            <Trash2 size={24} />
          </div>
          <h3 className={`text-xl font-bold font-sans leading-tight ${activeTheme === 'midnight-black' ? 'text-white' : 'text-black'}`}>Trash is empty</h3>
          <p className={`mt-2 font-medium max-w-[280px] ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
            No deleted notes found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(note => (
            <div 
              key={note.id}
              className={`rounded-2xl border shadow-sm p-4 flex flex-col gap-3 group relative transition-all ${activeTheme === 'midnight-black' ? 'bg-[#161616] border-white/5 hover:border-white/10' : 'bg-white border-slate-200'}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm line-clamp-1 ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-800'}`}>
                    {note.title || 'Untitled Note'}
                  </h4>
                  <p className={`text-xs line-clamp-2 mt-1 ${activeTheme === 'midnight-black' ? 'text-[#8E8E93]' : 'text-slate-500'}`}>
                    {note.content.replace(/<[^>]*>/g, '') || "No content."}
                  </p>
                </div>

              </div>

              <div className={`flex justify-end gap-2 mt-2 pt-3 border-t ${activeTheme === 'midnight-black' ? 'border-white/5' : 'border-slate-100'}`}>
                <button 
                  onClick={(e) => handleRecover(e, note)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${activeTheme === 'midnight-black' ? 'bg-[#111111] text-slate-400 hover:bg-[#1C1C1E] hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-black'}`}
                >
                  <RefreshCw size={14} /> Recover
                </button>
                <button 
                  onClick={(e) => handleHardDelete(e, note.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${activeTheme === 'midnight-black' ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:text-rose-400' : 'bg-rose-100 text-rose-600 hover:bg-rose-200 hover:text-rose-700'}`}
                >
                  <X size={14} strokeWidth={3} /> Delete completely
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
