import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, ArrowLeft, Image as ImageIcon, Wand2, X, Calendar, 
  Loader2, Paperclip, File as FileIcon, FileText, Zap, 
  Sparkles, ChevronRight, PenTool, Hash, Info, Check, Plus, Tag, Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Editor } from '../../components/ui/Editor';
import { noteService } from '../../services/noteService';
import { storageService } from '../../services/storageService';
import { RoutePath, NoteAttachment } from '../../types';
import { supabase } from '../../supabaseClient';
import { StorageImage } from '../../components/ui/StorageImage';
import { Sketchbook } from '../../components/Sketchbook';
import { encryptNoteContent, decryptNoteContent } from '../../services/cryptoService';

export const CreateNote: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); 
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLimitReached, setIsLimitReached] = useState(false);
  
  // Custom tag states
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagField, setShowTagField] = useState(false);

  // Sketch pad toggle
  const [showSketchbook, setShowSketchbook] = useState(false);

  // Image preview: Blob URL (new) or Storage Path (existing)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Attachments: Mixed list of new Files and existing NoteAttachments
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<NoteAttachment[]>([]);

  // Auto save drafts states & refs
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeNoteId, setActiveNoteId] = useState<string | undefined>(id);

  const lastSavedTitleRef = React.useRef('');
  const lastSavedContentRef = React.useRef('');
  const activeNoteIdRef = React.useRef<string | undefined>(id);
  const isSavingRef = React.useRef(false);

  // Sync ref with reactive states
  useEffect(() => {
    activeNoteIdRef.current = activeNoteId;
  }, [activeNoteId]);

  // Sync last typed content initially upon first successful note fetch
  useEffect(() => {
    if (!loading) {
      lastSavedTitleRef.current = title;
      lastSavedContentRef.current = content;
    }
  }, [loading]);

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
    const checkLimitAndFetch = async () => {
      // Avoid re-initialising the component states if we completed dynamic url replace on autosave
      if (id && id === activeNoteIdRef.current && !loading) {
        return;
      }

      setLoading(true);
      try {
        if (!id) {
          // If creating a NEW note, check count (disabled)
          /*
          const count = await noteService.getCount();
          if (count >= 3) {
            setIsLimitReached(true);
            setLoading(false);
            return;
          }
          */
          setTitle('');
          setContent('');
          setImagePreview(null);
          setNewAttachments([]);
          setExistingAttachments([]);
          setActiveNoteId(undefined);
          activeNoteIdRef.current = undefined;
          lastSavedTitleRef.current = '';
          lastSavedContentRef.current = '';
        } else {
          // If editing an EXISTING note
          const note = await noteService.getById(id);
          if (note) {
            const isLocked = note.tags?.includes('locked');
            const isUnlocked = sessionStorage.getItem('neonotex_vault_unlocked') === 'true' && !!sessionStorage.getItem('neonotex_vault_key');
            
            // Decrypt if locked and we have the vault key
            if (isLocked && isUnlocked) {
              const vaultKey = sessionStorage.getItem('neonotex_vault_key') || '';
              setTitle(decryptNoteContent(note.title, vaultKey));
              setContent(decryptNoteContent(note.content, vaultKey));
            } else if (isLocked && !isUnlocked) {
              // Can't edit locked without unlocking first, bounce back to note detail
              navigate(RoutePath.NOTE_DETAIL.replace(':id', id));
              return;
            } else {
              setTitle(note.title);
              setContent(note.content);
            }
            
            setImagePreview(note.thumbnailUrl || null);
            setExistingAttachments(note.attachments || []);
            setTags(note.tags || []);
            setActiveNoteId(id);
            activeNoteIdRef.current = id;
          } else {
             navigate(RoutePath.NOTES);
          }
        }
      } catch (error) {
        console.error("Failed to initialize note view", error);
      } finally {
        setLoading(false);
      }
    };

    checkLimitAndFetch();
  }, [id, navigate]);

  // Dynamic background 3-second auto-save watchdog
  useEffect(() => {
    if (loading || isLimitReached || saving) return;

    // Verify there are content modifications to write
    const hasChanges = title !== lastSavedTitleRef.current || content !== lastSavedContentRef.current;
    if (!hasChanges) return;

    // Ensure we have some printable characters to save
    if (!title.trim() && (!content || content === '<p><br></p>')) return;

    const timer = setTimeout(async () => {
      if (isSavingRef.current) {
        // If already saving, retry in 2 seconds instead of dropping the change
        setAutoSaveStatus('idle'); // Force tiny state change to re-trigger if needed
        setTimeout(() => setAutoSaveStatus('saving'), 50); 
        return;
      }
      isSavingRef.current = true;
      setAutoSaveStatus('saving');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        let currentId = activeNoteIdRef.current;
        let updatedTags = [...tags];

        const noteData = {
          title: title || "Untitled Note",
          content: content,
          tags: updatedTags
        };

        if (updatedTags.includes('locked')) {
          const vaultKey = sessionStorage.getItem('neonotex_vault_key');
          if (vaultKey) {
            noteData.title = encryptNoteContent(noteData.title, vaultKey);
            noteData.content = encryptNoteContent(noteData.content, vaultKey);
          }
        }

        if (!currentId) {
          const newNote = await noteService.create(noteData);
          currentId = newNote.id;
          setActiveNoteId(currentId);
          activeNoteIdRef.current = currentId;

          // Silent path transition in browse bar context
          navigate(RoutePath.EDIT_NOTE.replace(':id', currentId), { replace: true });
        } else {
          await noteService.update(currentId, noteData);
        }

        lastSavedTitleRef.current = title;
        lastSavedContentRef.current = content;
        setAutoSaveStatus('saved');

        // Transition back to idle state after 4 seconds of inactivity
        const idleDelay = setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 4000);
        return () => clearTimeout(idleDelay);

      } catch (err) {
        console.error("Watchdog auto-save draft failed:", err);
        setAutoSaveStatus('idle');
      } finally {
        isSavingRef.current = false;
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, content, loading, navigate, saving, isLimitReached, tags, autoSaveStatus]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setNewAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  // Callback when a hand-drawn sketch is submitted
  const handleSketchSave = (file: File) => {
    setNewAttachments((prev) => [...prev, file]);
    setShowSketchbook(false);
  };

  const removeNewAttachment = (index: number) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = async (attachment: NoteAttachment) => {
    setExistingAttachments((prev) => prev.filter(a => a.path !== attachment.path));
    try {
      await storageService.deleteFile(attachment.path);
    } catch (err) {
      console.error("Error deleting file", err);
    }
  };

  const handleRemoveCover = () => {
    setImagePreview(null);
  };

  // Add tag handler
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = newTagInput.trim().toLowerCase().replace(/#/g, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags((prev) => [...prev, cleanTag]);
    }
    setNewTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let noteId = activeNoteId || id;
      
      let updatedTags = [...tags];

      // Propagate tags gracefully
      let noteData: any = { 
        title: title || "Untitled Note", 
        content: content, 
        tags: updatedTags 
      };

      if (updatedTags.includes('locked')) {
        const vaultKey = sessionStorage.getItem('neonotex_vault_key');
        if (vaultKey) {
          noteData.title = encryptNoteContent(noteData.title, vaultKey);
          noteData.content = encryptNoteContent(noteData.content, vaultKey);
        }
      }
      
      if (!noteId) {
        const newNote = await noteService.create(noteData);
        noteId = newNote.id;
      }

      let finalThumbnailUrl = imagePreview;
      
      if (imagePreview && imagePreview.startsWith('blob:')) {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        const file = new File([blob], "cover.jpg", { type: blob.type });
        
        finalThumbnailUrl = await storageService.uploadFile(
          file, 
          user.id, 
          `notes/${noteId}/cover`
        );
      } 
      else if (!imagePreview) {
        finalThumbnailUrl = undefined;
      }

      const uploadedAttachments: NoteAttachment[] = [];
      for (const file of newAttachments) {
        const path = await storageService.uploadFile(
          file, 
          user.id, 
          `notes/${noteId}/attachments`,
          `${Date.now()}-${file.name}`
        );
        uploadedAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          path: path,
          id: path
        });
      }

      const finalAttachments = [...existingAttachments, ...uploadedAttachments];

      await noteService.update(noteId, {
        title: noteData.title,
        content: noteData.content,
        thumbnailUrl: finalThumbnailUrl || undefined,
        attachments: finalAttachments,
        tags: updatedTags // Sync tags cleanly
      });

      navigate(RoutePath.NOTE_DETAIL.replace(':id', noteId), { replace: true });
      
    } catch (error: any) {
      if (error.message === 'FREE_LIMIT_REACHED') {
        setIsLimitReached(true);
      } else {
        console.error("Error saving note:", error);
        alert("Failed to save note.");
      }
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  if (loading) {
     return (
       <div className="flex h-[80vh] items-center justify-center">
         <div className={`h-7 w-7 animate-spin rounded-full border-2 border-t-transparent ${activeTheme === 'midnight-black' ? 'border-[#F7C948] border-t-transparent' : 'border-slate-200 border-t-black'}`} />
       </div>
     );
  }

  if (isLimitReached) {
    return (
      <div className="mx-auto max-w-2xl animate-in fade-in zoom-in-95 duration-500 py-12 md:py-20">
        <div className={`relative overflow-hidden rounded-[40px] border p-10 md:p-14 text-center shadow-apple ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/10' : 'bg-white border-[#EAEAEA]'}`}>
          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className={`flex h-20 w-20 items-center justify-center rounded-3xl shadow-inner border ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] text-[#F7C948] border-white/10' : 'bg-slate-50 text-black border-[#EAEAEA]'}`}>
              <Zap size={36} fill="currentColor" className="opacity-90" />
            </div>

            <div className="space-y-4">
              <h2 className={`text-3xl font-extrabold tracking-tight leading-tight ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>Plan Limit Reached</h2>
              <p className={`font-medium leading-relaxed max-w-sm mx-auto ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-600'}`}>
                Free plan limit is capped at 3 notes. Upgrade to Neonotex Pro to unlock limitless space.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-center pt-4">
              <Button 
                variant="primary" 
                size="lg" 
                className="rounded-full shadow-lg bg-black hover:bg-slate-900 text-white group h-14"
                onClick={() => alert("Unlimited Pro Cloud Space upgrade requested.")} 
              >
                <Sparkles size={18} className="mr-2 group-hover:rotate-12 transition-transform" />
                <span>Upgrade to Pro</span>
                <ChevronRight size={16} className="ml-1 opacity-60" />
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="rounded-full h-14 border border-[#EAEAEA]"
                onClick={() => navigate(RoutePath.NOTES)}
              >
                Back to My Notes
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasContent = content && content !== '<p><br></p>';
  const canSave = title.trim().length > 0 || hasContent;

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500 pb-20">
      
      {/* Mini Top sticky navbar */}
      <nav className={`relative sm:sticky sm:top-20 md:top-4 z-40 mb-6 sm:mb-8 flex items-center justify-between rounded-[22px] border px-3 py-2.5 sm:px-4 sm:py-3 shadow-md backdrop-blur-2xl transition-all ${activeTheme === 'midnight-black' ? 'bg-[#0A0A0A]/90 border-[#1A1A1A] shadow-[0_8px_32px_rgba(0,0,0,0.6)]' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2 shrink-0">
           <Button variant="ghost" size="sm" onClick={() => navigate(RoutePath.NOTES)} className={`rounded-full px-3 transition-colors ${activeTheme === 'midnight-black' ? '!text-[#B0B0B0] hover:!text-white hover:!bg-[#111111] !bg-transparent !border-transparent' : 'text-slate-600 hover:text-slate-900'}`}>
             <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
             Back
           </Button>
        </div>
        
        <div className="flex items-center gap-2 min-w-0">
            <Button 
              onClick={() => handleSave()} 
              size="sm" 
              variant="primary"
              className={`rounded-full shadow-lg font-bold whitespace-nowrap shrink-0 px-3 sm:px-4 transition-all duration-300 ${activeTheme === 'midnight-black' ? '!bg-gradient-to-b !from-[#F7C948] !to-[#D4A017] text-black !border-[#1A1A1A] hover:shadow-[0_0_15px_rgba(247,201,72,0.4)] hover:brightness-110 !text-black' : 'bg-black hover:bg-slate-900 text-white'}`}
              isLoading={saving} 
              disabled={!canSave}
            >
              <Check className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              <span>Publish</span>
            </Button>
        </div>
      </nav>

      {/* Main Core Editor Sheet */}
      <div className={`relative min-h-[70vh] rounded-[32px] border overflow-hidden flex flex-col ${activeTheme === 'midnight-black' ? 'bg-[#161616] border-white/5 shadow-2xl' : activeTheme === 'sakura-pink' ? 'bg-white/80 border-[#FFD6E8] shadow-apple' : 'border-slate-200 bg-white shadow-apple'}`}>
        {imagePreview && (
          <div className={`relative aspect-[21/9] w-full group border-b ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5' : 'bg-slate-50 border-rose-100/10'}`}>
              <StorageImage 
                path={imagePreview} 
                alt="Cover" 
                className="h-full w-full object-cover" 
              />
              <div className="absolute top-4 right-4 flex gap-2 opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300">
                  <label className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold shadow border transition-colors ${activeTheme === 'midnight-black' ? 'bg-[#111111]/95 text-slate-300 border-white/10 hover:bg-[#1C1C1E]' : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                      Change Cover
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  <button 
                      onClick={handleRemoveCover}
                      className={`rounded-xl p-1.5 shadow border transition-colors cursor-pointer ${activeTheme === 'midnight-black' ? 'bg-[#111111]/95 text-slate-400 border-white/10 hover:text-red-500' : 'bg-white/95 text-slate-700 border-slate-200 hover:text-red-600'}`}
                  >
                      <X size={16} />
                  </button>
              </div>
          </div>
        )}

        <div className="flex-1 px-5 sm:px-10 py-6 sm:py-10 md:px-14 md:py-12">
            
            {/* Quick Controllers toolbar */}
            <div className={`mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-5 ${activeTheme === 'midnight-black' ? 'border-white/5' : 'border-slate-100'}`}>
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-appleGray-500'}`}>
                    <Calendar size={13} />
                    <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                   <button
                     onClick={() => setShowSketchbook(true)}
                     className={`group flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all hover:shadow-subtle ${activeTheme === 'midnight-black' ? 'border-white/10 bg-[#111111] text-slate-400 hover:bg-[#1C1C1E] hover:text-white hover:border-white/20' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:text-black hover:border-black'}`}
                   >
                     <PenTool size={13} className="transition-colors group-hover:text-current" />
                     <span>Draw Sketch</span>
                   </button>

                   <label className={`group flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all hover:shadow-subtle ${activeTheme === 'midnight-black' ? 'border-white/10 bg-[#111111] text-slate-400 hover:bg-[#1C1C1E] hover:text-white hover:border-white/20' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300'}`}>
                      <Paperclip size={13} className="text-slate-400 group-hover:text-slate-600" />
                      <span>Attach File</span>
                      <input type="file" multiple className="hidden" onChange={handleAttachmentUpload} />
                   </label>

                   {!imagePreview && (
                      <label className={`group flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all hover:shadow-subtle ${activeTheme === 'midnight-black' ? 'border-white/10 bg-[#111111] text-slate-400 hover:bg-[#1C1C1E] hover:text-white hover:border-white/20' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:text-slate-800 hover:border-slate-300'}`}>
                         <ImageIcon size={13} className="text-slate-400 group-hover:text-slate-600" />
                         <span>Add Cover</span>
                         <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                   )}

                   <button
                     onClick={() => setShowTagField(!showTagField)}
                     className={`group flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all hover:shadow-subtle ${
                       activeTheme === 'midnight-black'
                         ? showTagField 
                             ? 'border-white/30 bg-[#1C1C1E] text-white' 
                             : 'border-white/10 bg-[#111111] text-slate-400 hover:bg-[#1C1C1E] hover:border-white/20 hover:text-white'
                         : showTagField 
                             ? 'border-black bg-slate-50 text-black' 
                             : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:border-slate-300 hover:text-black'
                     }`}
                   >
                     <Tag size={13} className={showTagField ? 'text-black' : 'text-slate-400'} />
                     <span>Tags</span>
                   </button>
                </div>
            </div>

            {/* Expansible Tag input compartment */}
            {showTagField && (
              <div className={`mb-6 p-4 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-300 ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E]/40 border border-white/5' : 'bg-appleGray-100/50 border border-slate-200/50'}`}>
                <div className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-500'}`}>
                  <Tag size={12} /> Add organized tags (e.g. pinned, locked, travel, projects)
                </div>
                <form onSubmit={handleAddTag} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className={`absolute left-3 top-2.5 text-sm font-bold ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}`}>#</span>
                    <input
                      type="text"
                      placeholder="Enter tag and press Enter"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className={`w-full pl-7 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 font-medium ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/10 text-white placeholder-slate-500 focus:ring-white/20' : 'bg-white border-slate-200 text-black placeholder-slate-400 focus:ring-black'}`}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${activeTheme === 'midnight-black' ? 'bg-[#F7C948] text-black hover:bg-[#D4A017]' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                  >
                    Add
                  </button>
                </form>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border ${activeTheme === 'midnight-black' ? 'bg-[#111111] text-slate-300 border-white/10' : 'bg-white text-slate-600 border-slate-200'}`}
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-slate-400 hover:text-red-500 h-4 w-4 rounded-full flex items-center justify-center cursor-pointer"
                        >
                          <X size={10} strokeWidth={2.5} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Document Title input */}
            <input
                type="text"
                placeholder="Title your paper note"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full border-none bg-transparent text-3xl sm:text-4xl md:text-5xl font-extrabold focus:outline-none focus:ring-0 p-0 mb-6 sm:mb-8 tracking-tight leading-tight ${activeTheme === 'midnight-black' ? 'text-white placeholder:text-[#555]' : activeTheme === 'sakura-pink' ? 'text-[#D81B60] placeholder:text-[#FFB6C1]' : 'text-[#1c1c1e] placeholder:text-[#c7c7cc]'}`}
                autoFocus
            />
            
            {/* Rich Text Editor */}
            <div className={`relative min-h-[400px] ${activeTheme === 'midnight-black' 
              ? 'caret-[#F7C948] [&_.ql-editor_p]:!text-white [&_.ql-editor_h1]:!text-white [&_.ql-editor_h2]:!text-white [&_.ql-editor_h3]:!text-white [&_.ql-editor]:!text-white [&_.ql-stroke]:!stroke-white [&_.ql-fill]:!fill-white [&_.ql-picker]:!text-white [&_.ql-snow_.ql-picker-options]:!bg-[#1C1C1E] [&_.ql-toolbar]:!border-white/10 [&_.ql-container]:!border-white/10 [&_.ql-editor::before]:!text-white/30 [&_.ql-editor::selection]:!bg-[#D4A017] [&_.ql-editor_p::selection]:bg-[#D4A017] [&_.ql-editor_span::selection]:bg-[#D4A017]' 
              : '[&_.ql-toolbar]:!border-slate-200 [&_.ql-container]:!border-slate-200'}`}>
                <Editor 
                    value={content} 
                    onChange={setContent} 
                    placeholder={activeTheme === 'midnight-black' ? "Every great plan begins with a note." : "Describe your thoughts or insert checklists..."}
                    className={`text-lg leading-relaxed min-h-[400px] ${activeTheme === 'midnight-black' ? 'prose-invert font-mono tracking-tight cursor-text' : ''}`}
                />
            </div>

            {/* Word Count Footer */}
            <div className={`mt-2 flex justify-end text-xs font-semibold px-2 tracking-wide ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}`}>
              {content.replace(/<[^>]*>?/gm, '').trim().split(/\s+/).filter(Boolean).length} words
            </div>

            {/* Render uploaded sketches/files lists */}
            {(newAttachments.length > 0 || existingAttachments.length > 0) && (
              <div className={`mt-12 border-t pt-8 animate-in fade-in duration-300 ${activeTheme === 'midnight-black' ? 'border-white/5' : 'border-slate-100'}`}>
                <h3 className={`text-xs font-extrabold uppercase mb-4 flex items-center gap-1.5 tracking-widest ${activeTheme === 'midnight-black' ? 'text-[#8E8E93]' : 'text-[#8e8e93]'}`}>
                  <Paperclip size={13} />
                  Document Attachments ({newAttachments.length + existingAttachments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {existingAttachments.map((att) => (
                    <div key={att.path} className={`group relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${activeTheme === 'midnight-black' ? 'bg-[#111111] hover:bg-[#1C1C1E] border-white/5' : 'bg-slate-50/50 hover:bg-white border-slate-200 hover:border-slate-300 hover:shadow-subtle'}`}>
                      <div className={`h-10 w-10 shrink-0 rounded-lg border flex items-center justify-center shadow-sm overflow-hidden ${activeTheme === 'midnight-black' ? 'bg-[#161616] text-slate-500 border-white/10' : 'bg-white text-slate-400 border-slate-200'}`}>
                         <FileText size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-700'}`}>{att.name}</p>
                        <p className="text-[10px] text-slate-400">{formatFileSize(att.size)}</p>
                      </div>
                      <button 
                        onClick={() => removeExistingAttachment(att)}
                        className={`absolute -top-2 -right-2 h-6 w-6 rounded-full border shadow-sm flex items-center justify-center opacity-100 sm:opacity-0 scale-100 sm:scale-90 sm:group-hover:opacity-100 sm:group-hover:scale-100 transition-all duration-200 cursor-pointer ${activeTheme === 'midnight-black' ? 'bg-[#161616] text-slate-400 border-white/10 hover:text-red-500 hover:border-white/30' : 'bg-white text-slate-400 border-slate-200 hover:text-red-500 hover:border-red-200'}`}
                        title="Remove attachment"
                      >
                        <X size={10} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                  {newAttachments.map((file, index) => {
                    const isSketch = file.name.startsWith('sketch-');
                    return (
                      <div key={`new-${index}`} className={`group relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5 hover:bg-[#1C1C1E]' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-subtle'}`}>
                        <div className={`h-10 w-10 shrink-0 rounded-lg border flex items-center justify-center shadow-sm overflow-hidden ${activeTheme === 'midnight-black' ? 'bg-[#161616] text-slate-500 border-white/10' : 'bg-white text-slate-400 border-slate-200'}`}>
                          {file.type.startsWith('image/') ? (
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt="preview" 
                              className="h-full w-full object-cover"
                              onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                            />
                          ) : (
                            <FileIcon size={18} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-800'}`}>{file.name}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-wider ${activeTheme === 'midnight-black' ? 'text-white/60' : 'text-black'}`}>{isSketch ? '🎨 Hand Sketch' : 'File Upload Ready'}</p>
                        </div>
                        <button 
                          onClick={() => removeNewAttachment(index)}
                          className={`absolute -top-2 -right-2 h-6 w-6 rounded-full border shadow-sm flex items-center justify-center opacity-100 sm:opacity-0 scale-100 sm:scale-90 sm:group-hover:opacity-100 sm:group-hover:scale-100 transition-all duration-200 cursor-pointer ${activeTheme === 'midnight-black' ? 'bg-[#161616] text-slate-400 border-white/10 hover:text-red-500 hover:border-white/30' : 'bg-white text-slate-400 border-slate-200 hover:text-red-500 hover:border-red-200'}`}
                        >
                          <X size={10} strokeWidth={2.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        <div className={`border-t px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left select-none ${activeTheme === 'midnight-black' ? 'border-white/5 bg-[#111111]' : 'border-slate-100 bg-slate-50'}`}>
            <div className="flex items-center justify-center sm:justify-start gap-2">
                <Info size={12} className="text-slate-400 shrink-0" />
                <p className="text-[11px] text-slate-400 font-medium leading-normal">
                   This document resides securely in the cloud under Neonotex Encrypted standards.
                </p>
            </div>
            <div className="shrink-0 flex items-center justify-center">
            </div>
        </div>
      </div>

      {/* RENDER THE DRAWING CANVAS INLAY DIALOG */}
      {showSketchbook && (
        <Sketchbook 
          onSave={handleSketchSave} 
          onClose={() => setShowSketchbook(false)} 
        />
      )}
    </div>
  );
};
