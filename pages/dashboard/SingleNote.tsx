import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit3, Trash2, ArrowLeft, Calendar, Clock, AlertCircle, Paperclip, 
  FileText, Download, Pin, Lock, PenTool, Sparkles, CheckSquare, Play, Pause, FileDown,
  Star, Tag, ShieldAlert, Maximize2, X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { noteService } from '../../services/noteService';
import { storageService } from '../../services/storageService';
import { Note, RoutePath, NoteAttachment } from '../../types';
import { StorageImage } from '../../components/ui/StorageImage';
import { Sketchbook } from '../../components/Sketchbook';
import { useAuth } from '../../context/AuthContext';
import { decryptNoteContent, hashPasscode } from '../../services/cryptoService';
import { jsPDF } from 'jspdf';

export const SingleNote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showSketchbook, setShowSketchbook] = useState(false);

  const [showTagsPopover, setShowTagsPopover] = useState(false);
  const [isFullScreenImage, setIsFullScreenImage] = useState(false);
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

  // Vault/Lock logic
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('neonotex_vault_unlocked') === 'true' && !!sessionStorage.getItem('neonotex_vault_key');
  });
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

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

  useEffect(() => {
    if (!id) return;
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const data = await noteService.getById(id!);
      if (data) {
        setNote(data);
      } else {
        navigate(RoutePath.NOTES);
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        console.warn("Network offline, could not fetch note:", err);
        setError("Network offline.");
      } else {
        console.error("Failed to fetch note", err);
        setError("Failed to load note details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsConfirmOpen(false);
      }
    };
    if (isConfirmOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isConfirmOpen]);

  const initiateDelete = () => {
    setIsConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setError(null);
    try {
      await noteService.delete(id);
      navigate(RoutePath.NOTES);
    } catch (err) {
      console.error("Failed to delete note:", err);
      setError("Something went wrong while deleting this note. Please try again.");
      setIsDeleting(false);
      setIsConfirmOpen(false); 
    }
  };

  const handleExportPDF = async () => {
    if (!note) return;
    
    try {
      const doc = new jsPDF();
      let yPos = 20;
      
      if (note.thumbnailUrl) {
        try {
          const url = await storageService.getSignedUrl(note.thumbnailUrl);
          if (url) {
            const response = await fetch(url);
            const blob = await response.blob();
            const base64data = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
            
            const img = new Image();
            img.src = base64data;
            await new Promise(resolve => {
              img.onload = resolve;
              img.onerror = resolve;
            });
            
            if (img.width > 0 && img.height > 0) {
              const maxWidth = 170;
              const maxHeight = 100;
              let imgWidth = img.width;
              let imgHeight = img.height;
              
              const ratioX = maxWidth / imgWidth;
              const ratioY = maxHeight / imgHeight;
              const ratio = Math.min(ratioX, ratioY, 1);
              
              imgWidth = imgWidth * ratio;
              imgHeight = imgHeight * ratio;
              
              const xPos = 20 + (maxWidth - imgWidth) / 2;
              
              const format = note.thumbnailUrl.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';
              doc.addImage(base64data, format, xPos, yPos, imgWidth, imgHeight);
              yPos += imgHeight + 15;
            }
          }
        } catch(err) {
          console.error("Failed to add cover image to PDF:", err);
        }
      }
      
      doc.setFontSize(22);
      const titleLines = doc.splitTextToSize(note.title || 'Untitled', 170);
      doc.text(titleLines, 20, yPos);
      yPos += titleLines.length * 10;
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, 20, yPos);
      yPos += 15;
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      const plainTextContent = (note.content || '')
        .replace(/<\/?p[^>]*>/g, '\n')
        .replace(/<br[^>]*>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
      const splitText = doc.splitTextToSize(plainTextContent, 170);
      
      for (let i = 0; i < splitText.length; i++) {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(splitText[i], 20, yPos);
        yPos += 7;
      }
      
      if (note.attachments && note.attachments.length > 0) {
        const imageAttachments = note.attachments.filter(att => 
          att.type.startsWith('image/')
        );
        
        for (const att of imageAttachments) {
          try {
            const url = await storageService.getSignedUrl(att.path);
            if (!url) continue;
            
            const response = await fetch(url);
            const blob = await response.blob();
            
            const base64data = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result);
              };
              reader.readAsDataURL(blob);
            });
            
            const img = new Image();
            img.src = base64data;
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
            
            if (img.width > 0 && img.height > 0) {
              const maxWidth = 170;
              const maxHeight = 250;
              let imgWidth = img.width;
              let imgHeight = img.height;
              
              if (imgWidth > maxWidth) {
                const ratio = maxWidth / imgWidth;
                imgWidth = maxWidth;
                imgHeight = imgHeight * ratio;
              }
              
              if (imgHeight > maxHeight) {
                const ratio = maxHeight / imgHeight;
                imgHeight = maxHeight;
                imgWidth = imgWidth * ratio;
              }
              
              if (yPos + imgHeight + 10 > 280) {
                doc.addPage();
                yPos = 20;
              } else {
                yPos += 10;
              }
              
              const format = att.type === 'image/png' ? 'PNG' : 'JPEG';
              doc.addImage(base64data, format, 20, yPos, imgWidth, imgHeight);
              yPos += imgHeight + 10;
            }
          } catch (err) {
            console.error("Failed to add image to PDF:", err);
          }
        }
      }
      
      doc.save(`${note.title ? note.title.substring(0, 20) : 'note'}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setToast({ message: 'Failed to generate PDF.', visible: true });
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(RoutePath.EDIT_NOTE.replace(':id', id));
    }
  };

  const handlePinToggle = async () => {
    if (!note) return;
    try {
      const isPinned = note.tags?.includes('pinned');
      let newTags = note.tags || [];
      if (isPinned) {
        newTags = newTags.filter(t => t !== 'pinned');
      } else {
        newTags = [...newTags, 'pinned'];
      }
      const updated = await noteService.update(note.id, { tags: newTags });
      setNote(updated);
    } catch (err) {
      console.error("Pin toggle failed", err);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!note) return;
    try {
      const isFavorite = note.tags?.includes('favorite');
      let newTags = note.tags || [];
      if (isFavorite) {
        newTags = newTags.filter(t => t !== 'favorite');
        showToast("Removed from Favorites");
      } else {
        newTags = [...newTags, 'favorite'];
        showToast("Added to Favorites ⭐");
      }
      const updated = await noteService.update(note.id, { tags: newTags });
      setNote(updated);
    } catch (err) {
      console.error("Favorite toggle failed", err);
    }
  };

  const downloadAttachment = async (path: string) => {
    const url = await storageService.getSignedUrl(path);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleSketchSave = async (file: File) => {
    if (!note) return;
    try {
      const path = await storageService.uploadFile(
        file,
        'user-sketch',
        `notes/${note.id}/attachments`,
        file.name
      );

      const newAttachment: NoteAttachment = {
        name: 'Handwritten Sketch.png',
        size: file.size,
        type: 'image/png',
        path: path,
        id: path
      };

      const updatedAttachments = [...(note.attachments || []), newAttachment];
      const updated = await noteService.update(note.id, { attachments: updatedAttachments });
      setNote(updated);
      setShowSketchbook(false);
    } catch (err) {
      console.error("Error saving sketch", err);
      alert("Error attaching sketch.");
    }
  };

  if (loading) return <div className={`flex h-screen items-center justify-center ${activeTheme === 'midnight-black' ? 'bg-[#000000]' : 'bg-slate-50'}`}><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500"></div></div>;
  if (!note) return null;

  const isLocked = note.tags?.includes('locked');
  const activeTitle = (isLocked && isVaultUnlocked)
    ? decryptNoteContent(note.title, sessionStorage.getItem('neonotex_vault_key') || '')
    : note.title;
  const activeContent = (isLocked && isVaultUnlocked)
    ? decryptNoteContent(note.content, sessionStorage.getItem('neonotex_vault_key') || '')
    : note.content;

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput || pinInput.trim().length === 0) return;
    
    // Check against saved PIN
    const savedPinHash = user?.user_metadata?.vault_pin_hash || localStorage.getItem('neonotex_vault_pin_hash');
    const hashedParams = hashPasscode(pinInput);
    if (savedPinHash === hashedParams) {
      sessionStorage.setItem('neonotex_vault_unlocked', 'true');
      sessionStorage.setItem('neonotex_vault_key', pinInput);
      setIsVaultUnlocked(true);
      setAuthError('');
      showToast("Document Unlocked 🔒");
    } else {
      setAuthError("Incorrect biometric signature. Access denied.");
    }
  }

  if (isLocked && !isVaultUnlocked) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pt-10 animate-in fade-in pb-20 relative text-center">
        <Button variant="ghost" size="sm" onClick={() => navigate(RoutePath.HOME)} className="text-slate-500 absolute left-0 top-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
        <div className={`flex flex-col items-center justify-center p-14 backdrop-blur rounded-[32px] text-center max-w-md mx-auto shadow-sm mt-12 ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E]/70 border border-white/5' : 'bg-white/70 border border-slate-200/50'}`}>
          <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${activeTheme === 'midnight-black' ? 'bg-[#F7C948] text-black' : 'bg-black text-white'}`}>
            <Lock size={32} />
          </div>
          <h2 className={`text-xl font-bold font-sans leading-tight ${activeTheme === 'midnight-black' ? 'text-white' : 'text-black'}`}>Encrypted Document</h2>
          <p className="text-sm font-semibold text-slate-400 mt-2 mb-8 leading-relaxed max-w-[280px]">
            This note requires biometric or passcode authorization.
          </p>
          
          <form className="w-full" onSubmit={handleUnlockSubmit}>
            <input 
              type="password" 
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setAuthError('');
              }}
              className={`w-full text-center text-xl tracking-[0.5em] font-mono p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black mb-4 transition-all ${activeTheme === 'midnight-black' ? 'bg-[#111111] border border-white/10 text-white placeholder-slate-600 focus:ring-white/20' : 'bg-slate-50 border border-slate-200'}`}
              placeholder="••••"
              maxLength={4}
              autoFocus
            />
            {authError && <p className="text-xs text-rose-500 font-bold mb-4">{authError}</p>}
            <Button type="submit" variant="primary" className="w-full rounded-2xl h-12 bg-black text-white hover:bg-slate-900 border-none font-bold text-sm shadow-md">
              Authorize Access
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-400 pb-20 relative">
        
        {/* Apple styled navigation header */}
        <div className="flex flex-col bg-transparent relative z-0 gap-2">
          <div className="flex items-center justify-between pb-2 pt-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(RoutePath.NOTES)} className="-ml-3 text-slate-500 hover:text-slate-900 rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePinToggle}
                className={`p-2 rounded-xl transition-all ${activeTheme === 'midnight-black' ? 'hover:bg-[#1C1C1E]' : 'hover:bg-slate-100'} ${note.tags?.includes('pinned') ? (activeTheme === 'midnight-black' ? 'text-white bg-[#1C1C1E] border border-white/10' : 'text-black bg-slate-100 border border-slate-200') : 'text-slate-400'}`}
                title="Pin note"
              >
                <Pin size={16} fill={note.tags?.includes('pinned') ? 'currentColor' : 'none'} className={note.tags?.includes('pinned') && activeTheme === 'midnight-black' ? 'text-white' : ''} />
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={`p-2 rounded-xl transition-all duration-200 active:scale-95 ${activeTheme === 'midnight-black' ? 'hover:bg-[#1C1C1E] text-slate-400 hover:text-amber-400' : 'hover:bg-slate-100 text-slate-400 hover:text-amber-500 hover:scale-110'}`}
                style={{ color: note.tags?.includes('favorite') ? (activeTheme === 'midnight-black' ? '#fbbf24' : '#F59E0B') : undefined }}
                title={note.tags?.includes('favorite') ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Star size={16} fill={note.tags?.includes('favorite') ? '#F59E0B' : 'none'} stroke={note.tags?.includes('favorite') ? '#F59E0B' : 'currentColor'} />
              </button>
              
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleExportPDF}
                className={`rounded-full w-8 h-8 !p-0 flex items-center justify-center shrink-0 ${activeTheme === 'midnight-black' ? '!bg-[#1C1C1E] !border-white/10 hover:!bg-[#2C2C2E]' : ''}`}
                title="Export PDF"
              >
                <FileDown className={`h-4 w-4 ${activeTheme === 'midnight-black' ? 'text-slate-300' : 'text-slate-500'}`} />
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleEdit}
                className={`rounded-full w-8 h-8 !p-0 flex items-center justify-center shrink-0 ${activeTheme === 'midnight-black' ? '!bg-[#1C1C1E] !border-white/10 hover:!bg-[#2C2C2E]' : ''}`}
                title="Edit"
              >
                <Edit3 className={`h-4 w-4 ${activeTheme === 'midnight-black' ? 'text-slate-300' : 'text-slate-500'}`} />
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={initiateDelete} 
                isLoading={isDeleting}
                className={`rounded-full w-8 h-8 !p-0 flex items-center justify-center shrink-0 [&>span]:mr-0 ${activeTheme === 'midnight-black' ? '!bg-[#1C1C1E] !text-rose-500 !border-white/10 hover:!bg-[#2C2C2E]' : 'text-rose-600 border-rose-100 hover:bg-rose-50'}`}
                title="Delete"
              >
                {!isDeleting && <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Tags popover display */}
          {showTagsPopover && (
            <div className={`px-4 py-2.5 border rounded-2xl flex flex-wrap gap-1.5 items-center animate-in slide-in-from-top-1 duration-200 ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10' : 'bg-slate-50 border-slate-200/60'}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1.5 flex items-center gap-1">
                <Tag size={10} /> Active Tags:
              </span>
              {note.tags && note.tags.filter(t => t !== 'pinned' && t !== 'favorite').length > 0 ? (
                note.tags.filter(t => t !== 'pinned' && t !== 'favorite').map(tag => (
                  <span key={tag} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${activeTheme === 'midnight-black' ? 'bg-[#111111] text-slate-300 border-white/5' : 'bg-white text-slate-600 border-slate-200'}`}>
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-medium text-slate-400 italic">No custom tags on this note.</span>
              )}
            </div>
          )}
        </div>

        {/* Elegant Minimalist Toast Notification */}
        {toast.visible && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-zinc-950 border border-zinc-800 text-white font-sans font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-305">
            <span>{toast.message}</span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3 text-rose-700 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Outer Frame Wrapper */}
        <article className={`rounded-[32px] border overflow-hidden ${activeTheme === 'midnight-black' ? 'bg-[#161616] border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-apple'}`}>
          {note.thumbnailUrl && (
            <>
              <div className={`w-full max-h-[70vh] flex justify-center relative border-b group ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5' : 'bg-slate-900 border-slate-900'}`}>
                <StorageImage 
                  path={note.thumbnailUrl} 
                  alt={activeTitle} 
                  className="w-full max-h-[70vh] object-contain" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setIsFullScreenImage(true)}
                  className="absolute bottom-4 right-4 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                  aria-label="View full image"
                >
                  <Maximize2 size={18} />
                </button>
              </div>

              {/* Full Screen Image Modal */}
              {isFullScreenImage && (
                <div 
                  className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-12 animate-in fade-in duration-300"
                  onClick={() => setIsFullScreenImage(false)}
                >
                  <button 
                    className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    onClick={() => setIsFullScreenImage(false)}
                  >
                    <X size={24} />
                  </button>
                  <div 
                    className="relative max-w-5xl w-full max-h-full flex items-center justify-center animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StorageImage 
                      path={note.thumbnailUrl} 
                      alt={activeTitle} 
                      className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10" 
                    />
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="p-8 md:p-14 space-y-6">
            <div className="space-y-2">
              <h1 className={`text-3xl md:text-5xl font-extrabold tracking-tight leading-snug ${activeTheme === 'midnight-black' ? 'text-white' : activeTheme === 'sakura-pink' ? 'text-[#D81B60]' : 'text-[#1c1c1e]'}`}>
                {activeTitle || 'Untitled Note'}
              </h1>
              
              <div className={`flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-widest border-b pb-5 ${activeTheme === 'midnight-black' ? 'text-slate-400 border-white/5' : 'text-appleGray-500 border-slate-100'}`}>
                <span className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(note.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="flex items-center gap-1.5"><Clock size={13} /> {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}</span>
              </div>
            </div>

            {/* Render Note HTML Editor Content */}
            <div 
              className={`prose prose-slate prose-lg max-w-none leading-relaxed text-[17px] ${activeTheme === 'midnight-black' ? 'prose-invert text-white' : activeTheme === 'sakura-pink' ? 'text-[#e91e63]' : 'text-[#1c1c1e]'}`}
              dangerouslySetInnerHTML={{ __html: activeContent || '<p className="italic opacity-60">No content inside note yet.</p>' }}
            />

            {/* Embedded custom media items block */}
            {note.attachments && note.attachments.length > 0 && (
              <div className="mt-12 border-t border-slate-100 pt-8 space-y-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-[#8e8e93] flex items-center gap-1.5">
                    <Paperclip size={13} />
                    Embedded Attachments ({note.attachments.length})
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {note.attachments.map((att, idx) => {
                      const isImage = att.type?.startsWith('image/') || att.name.toLowerCase().endsWith('.png') || att.name.toLowerCase().endsWith('.jpg');

                      // Render FaceTime Audio card if matches audio criteria
                      if (att.name.includes('Audio') || att.name.toLowerCase().endsWith('.mp3') || att.name.toLowerCase().endsWith('.wav')) {
                        return (
                          <div key={idx} className={`col-span-1 rounded-2xl border p-4 shadow-subtle flex flex-col gap-3 group ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/5' : 'border-slate-200 bg-appleGray-100/60'}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className={`text-sm font-bold ${activeTheme === 'midnight-black' ? 'text-white' : activeTheme === 'sakura-pink' ? 'text-[#D81B60]' : 'text-[#1c1c1e]'}`}>{att.name}</h4>
                                <span className={`text-[10px] font-mono font-bold mt-1 block ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-appleGray-500'}`}>FaceTime Audio log · {(att.size / 1024).toFixed(1)} KB</span>
                              </div>
                              <button 
                                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                                className={`flex items-center gap-1 border px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer ${activeTheme === 'midnight-black' ? 'bg-[#111111] hover:bg-[#161616] border-white/5 text-white' : activeTheme === 'sakura-pink' ? 'bg-[#FFF5F8] text-[#D81B60] border-[#FFE1EB] hover:bg-[#FFE1EB]' : 'bg-white hover:bg-slate-50 border-slate-200 text-[#1c1c1e]'}`}
                              >
                                {isPlayingAudio ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                                <span>{isPlayingAudio ? 'Pause' : 'Play'}</span>
                              </button>
                            </div>
                            {/* waveform block */}
                            <div className={`h-6 flex items-end gap-[1.5px] px-1 rounded-xl py-1 overflow-hidden ${activeTheme === 'midnight-black' ? 'bg-[#111111]' : 'bg-white/50'}`}>
                              {[...Array(24)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`flex-1 bg-black rounded transition-all duration-300`}
                                  style={{ 
                                    height: isPlayingAudio 
                                      ? `${Math.max(15, Math.sin(i * 1.5 + (Date.now() / 200)) * 90 + 10)}%` 
                                      : '15%' 
                                  }} 
                                />
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (isImage) {
                         return (
                           <div key={idx} className={`col-span-1 border rounded-2xl shadow-subtle overflow-hidden flex flex-col group relative ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/5' : 'border-slate-200 bg-white'}`}>
                             <div className={`h-40 overflow-hidden relative border-b ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5' : 'bg-slate-50 border-fold-100'}`}>
                               <StorageImage path={att.path} alt={att.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                               <button 
                                 onClick={() => downloadAttachment(att.path)}
                                 className={`absolute top-3 right-3 p-2 backdrop-blur-md rounded-full shadow transition-colors cursor-pointer ${activeTheme === 'midnight-black' ? 'bg-[#161616]/95 hover:bg-[#1C1C1E] text-slate-300' : 'bg-white/95 hover:text-black'}`}
                                 title="Download Sketch"
                                >
                                 <Download size={14} />
                               </button>
                             </div>
                             <div className={`p-3 ${activeTheme === 'midnight-black' ? 'bg-[#111111]' : 'bg-slate-50/50'}`}>
                               <p className={`text-xs font-bold truncate ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-800'}`}>{att.name}</p>
                               <span className={`text-[10px] block font-medium ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-zinc-400'}`}>Draw Sketch Attachment</span>
                             </div>
                           </div>
                         );
                      }

                      return (
                        <div key={idx} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all group ${activeTheme === 'midnight-black' ? 'bg-[#111111] hover:bg-[#1C1C1E] border-white/5' : 'border-slate-200 bg-slate-50 hover:bg-white hover:shadow-subtle'}`}>
                           <div className="flex items-center gap-3 min-w-0">
                             <div className={`h-9 w-9 shrink-0 rounded-lg border flex items-center justify-center shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#161616] text-slate-500 border-white/5' : 'bg-white border-slate-200 text-slate-400'}`}>
                                <FileText size={18} />
                             </div>
                             <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{att.name}</p>
                                <p className="text-[10px] text-slate-400">{(att.size / 1024).toFixed(1)} KB</p>
                             </div>
                           </div>
                           <button 
                              onClick={() => downloadAttachment(att.path)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
                              title="Download"
                           >
                              <Download size={15} />
                           </button>
                        </div>
                      );
                    })}
                 </div>
              </div>
            )}
          </div>
        </article>
      </div>

      {/* Confirmation modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`relative w-full max-w-md space-y-4 rounded-[32px] border backdrop-blur-3xl px-8 py-7 shadow-2xl overflow-hidden ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E]/90 border-white/10' : 'border-white/80 bg-white/90'}`}>
            <div className="space-y-2">
              <h3 className={`text-lg font-extrabold ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-950'}`}>Trash Document?</h3>
              <p className={`text-sm leading-relaxed font-semibold opacity-90 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-600'}`}>
                Are you sure you want to move this note to trash? This action cannot be reverted.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-2">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all outline-none ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/10 text-slate-300 hover:bg-[#161616]' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:shadow-sm'}`}
              >
                Cancel
              </button>
              <button
                onClick={performDelete}
                className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-600/10 hover:brightness-110 active:scale-95 transition-all outline-none"
              >
                {isDeleting ? 'Trashing...' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSketchbook && (
        <Sketchbook 
          onSave={handleSketchSave} 
          onClose={() => setShowSketchbook(false)} 
        />
      )}
    </>
  );
};
