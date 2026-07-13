import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, FileText, ArrowUpRight, Calendar, Search, Pin, PinOff, ArrowLeft,
  Lock, Unlock, Mic, Edit3, Trash2, Tag, Paperclip, Download, Play, Pause,
  Sparkles, PenTool, CheckSquare, Smile, Clock, Notebook, AlertCircle,
  Star, ShieldAlert, Fingerprint, ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Note, RoutePath, NoteAttachment } from '../../types';
import { noteService } from '../../services/noteService';
import { storageService } from '../../services/storageService';
import { StorageImage } from '../../components/ui/StorageImage';
import { Sketchbook } from '../../components/Sketchbook';
import { useAuth } from '../../context/AuthContext';
import { 
  encryptNoteContent, 
  decryptNoteContent, 
  hashPasscode 
} from '../../services/cryptoService';

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

export const MyNotes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const queryParams = new URLSearchParams(location.search);
  const isVaultSection = queryParams.get('filter') === 'locked';

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'last-edited' | 'created' | 'title'>('last-edited');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const pressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Dual-pane status
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showSketchbook, setShowSketchbook] = useState(false);

  const [showTagsPopover, setShowTagsPopover] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // ----------------------------------------------------
  // PRIVATE VAULT SECURITY STATES & LOGIC
  // ----------------------------------------------------
  const [vaultKey, setVaultKey] = useState<string>(() => {
    return sessionStorage.getItem('neonotex_vault_key') || '';
  });
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('neonotex_vault_unlocked') === 'true' && !!sessionStorage.getItem('neonotex_vault_key');
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Vault Setup state
  const [isSettingUpVault, setIsSettingUpVault] = useState(false);
  const [setupPin, setSetupPin] = useState('');
  const [setupConfirmPin, setSetupConfirmPin] = useState('');
  
  // Biometric access states
  const [biometricsEnabled, setBiometricsEnabled] = useState(() => {
    return localStorage.getItem('neonotex_biometrics_enabled') === 'true';
  });
  const [bioScanning, setBioScanning] = useState(false);

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
    fetchNotes();
  }, [isVaultUnlocked, isVaultSection]);

  const toggleSelection = (id: string) => {
    setSelectedNotes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedNotes.size === 0) return;
    try {
      const idsToDelete = Array.from(selectedNotes) as string[];
      for (const id of idsToDelete) {
        await noteService.delete(id);
      }
      setNotes(prev => prev.filter(n => !selectedNotes.has(n.id)));
      setSelectedNotes(new Set());
      setIsSelectionMode(false);
      showToast(`${idsToDelete.length} notes moved to trash.`);
    } catch (error) {
      console.error("Failed to delete selected notes:", error);
      showToast("Error deleting notes.");
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await noteService.getAll();
      setNotes(data);
      
      // Filter out base selection depending on vault section
      const matched = data.filter(n => {
        if (n.tags?.includes('trash')) return false;
        const hasLock = n.tags?.includes('locked');
        if (isVaultSection) return hasLock;
        return !hasLock;
      });

      if (matched.length > 0) {
        setSelectedNoteId(matched[0].id);
      } else {
        setSelectedNoteId(null);
      }
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        console.warn("Network offline, could not fetch notes.");
      } else {
        console.error("Failed to fetch notes", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPreviewText = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > 60 ? text.substring(0, 60) + "..." : text;
  };

  const handleCreateNote = () => {
    if (isVaultSection) {
      if (!isVaultUnlocked) {
        showToast("Please unlock the vault first.");
        return;
      }
      handleCreateSecureNote();
    } else {
      navigate(RoutePath.CREATE_NOTE);
    }
  };

  const handleCreateSecureNote = async () => {
    if (!vaultKey) return;
    try {
      const encryptedTitle = encryptNoteContent("New Secure Draft", vaultKey);
      const encryptedContent = encryptNoteContent("<p>Start typing your private note...</p>", vaultKey);
      
      const created = await noteService.create({
        title: encryptedTitle,
        content: encryptedContent,
        tags: ['locked']
      });

      setNotes(prev => [...prev, created]);
      setSelectedNoteId(created.id);
      showToast("Created Secure Note 🔒");
    } catch (error) {
      console.error("Failed to create secure vault note", error);
    }
  };

  const handlePinToggle = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const isPinned = note.tags?.includes('pinned');
      let newTags = note.tags || [];
      if (isPinned) {
        newTags = newTags.filter(t => t !== 'pinned');
      } else {
        newTags = [...newTags, 'pinned'];
      }
      
      const updated = await noteService.update(note.id, { tags: newTags });
      setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    } catch (err) {
      console.error("Failed to toggle pin", err);
    }
  };

  const handleFavoriteToggle = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
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
      setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  // Modern Vault move/remove handlers
  const handleLockToggle = async (note: Note, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const isLocked = note.tags?.includes('locked');
    if (!isLocked) {
      // Moving to Vault
      const currentVaultKey = sessionStorage.getItem('neonotex_vault_key');
      if (!currentVaultKey) {
        alert("Please unlock or set up your Private Vault inside the Vault section first to secure your draft.");
        navigate(`${RoutePath.NOTES}?filter=locked`);
        return;
      }
      
      try {
        const encryptedTitle = encryptNoteContent(note.title, currentVaultKey);
        const encryptedContent = encryptNoteContent(note.content, currentVaultKey);
        const newTags = [...(note.tags || []), 'locked'];
        
        const updated = await noteService.update(note.id, { 
          title: encryptedTitle,
          content: encryptedContent,
          tags: newTags 
        });
        
        setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
        showToast("Moved to Vault 🔒");
        
        // Deselect because we are in normal notes list
        const remaining = notes.filter(n => n.id !== note.id && !n.tags?.includes('locked'));
        setSelectedNoteId(remaining.length > 0 ? remaining[0].id : null);
      } catch (err) {
        console.error("Failed to move note to vault", err);
      }
    } else {
      // Removing from Vault
      const currentVaultKey = sessionStorage.getItem('neonotex_vault_key');
      if (!currentVaultKey) {
        alert("Please unlock the vault first to retrieve this secure note.");
        return;
      }
      
      try {
        const decryptedTitle = decryptNoteContent(note.title, currentVaultKey);
        const decryptedContent = decryptNoteContent(note.content, currentVaultKey);
        const newTags = (note.tags || []).filter(t => t !== 'locked');
        
        const updated = await noteService.update(note.id, { 
          title: decryptedTitle,
          content: decryptedContent,
          tags: newTags 
        });
        
        setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
        showToast("Removed from Vault");
        
        // Deselect because we are in vault list
        const remaining = notes.filter(n => n.id !== note.id && n.tags?.includes('locked'));
        setSelectedNoteId(remaining.length > 0 ? remaining[0].id : null);
      } catch (err) {
        console.error("Failed to remove note from vault", err);
      }
    }
  };

  const handleDeleteActiveNote = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    setIsDeleting(true);
    try {
      await noteService.delete(id);
      const remaining = notes.filter(n => n.id !== id);
      setNotes(remaining);
      setSelectedNoteId(remaining.length > 0 ? remaining[0].id : null);
    } catch (err) {
      console.error("Failed to delete note", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSketchSave = async (file: File) => {
    if (!selectedNoteId) return;
    try {
      const active = notes.find(n => n.id === selectedNoteId);
      if (!active) return;

      const path = await storageService.uploadFile(
        file,
        'user-sketch',
        `notes/${selectedNoteId}/attachments`,
        file.name
      );

      const newAttachment: NoteAttachment = {
        name: 'Handwritten Sketch.png',
        size: file.size,
        type: 'image/png',
        path: path,
        id: path
      };

      const updatedAttachments = [...(active.attachments || []), newAttachment];
      const updated = await noteService.update(selectedNoteId, {
        attachments: updatedAttachments
      });

      setNotes(prev => prev.map(n => n.id === selectedNoteId ? updated : n));
      setShowSketchbook(false);
    } catch (err) {
      console.error("Error saving sketch", err);
      alert("Error attaching sketch.");
    }
  };

  const handleDownloadAttachment = async (path: string) => {
    try {
      const url = await storageService.getSignedUrl(path);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter notes based on local search query & vault status
  const matchedSectionNotes = notes.filter(note => {
    if (note.tags?.includes('trash')) return false;
    const isLocked = note.tags?.includes('locked');
    if (isVaultSection) return isLocked;
    return !isLocked;
  });

  // Sort notes based on user preference
  const sortedSectionNotes = [...matchedSectionNotes].sort((a, b) => {
    if (sortBy === 'last-edited') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sortBy === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  const filteredNotes = sortedSectionNotes.filter(note => {
    // Decrypt details first before searching if vault is unlocked
    let activeTitle = note.title;
    let activeContent = note.content;
    
    if (note.tags?.includes('locked') && isVaultUnlocked) {
      activeTitle = decryptNoteContent(note.title, vaultKey);
      activeContent = decryptNoteContent(note.content, vaultKey);
    }

    const titleMatch = activeTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const contentText = activeContent.replace(/<[^>]*>/g, '').toLowerCase();
    const contentMatch = contentText.includes(searchQuery.toLowerCase());
    const tagsMatch = note.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return titleMatch || contentMatch || tagsMatch;
  });

  // Chronological Grouping Logic
  const getGroupedNotes = (notesList: Note[]) => {
    const pinned: Note[] = [];
    const today: Note[] = [];
    const yesterday: Note[] = [];
    const older: { [key: string]: Note[] } = {};

    const now = new Date();
    const todayStr = now.toDateString();
    
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    notesList.forEach(note => {
      // Check Pin
      if (note.tags?.includes('pinned')) {
        pinned.push(note);
        return;
      }

      const updatedDate = new Date(note.updatedAt);
      const updatedStr = updatedDate.toDateString();

      if (updatedStr === todayStr) {
        today.push(note);
      } else if (updatedStr === yesterdayStr) {
        yesterday.push(note);
      } else {
        const monthStr = updatedDate.toLocaleDateString('en-US', { month: 'long' });
        const dayVal = updatedDate.getDate();
        const yearVal = updatedDate.getFullYear();
        const currentYear = now.getFullYear();
        const groupName = currentYear === yearVal ? `${dayVal} ${monthStr}` : `${dayVal} ${monthStr} ${yearVal}`;

        if (!older[groupName]) {
          older[groupName] = [];
        }
        older[groupName].push(note);
      }
    });

    return { pinned, today, yesterday, older };
  };

  const { pinned, today, yesterday, older } = getGroupedNotes(filteredNotes);
  const activeNote = notes.find(n => n.id === selectedNoteId);

  // Helper to print date nicely
  const getNoteDateString = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
  };

  // ----------------------------------------------------
  // VAULT SECURITY SYSTEM INTERACTIONS
  // ----------------------------------------------------
  const savedPinHash = user?.user_metadata?.vault_pin_hash || localStorage.getItem('neonotex_vault_pin_hash') || '';

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupPin.length < 4 || setupPin.length > 6) {
      setPinError("Passcode must be between 4 and 6 digits code.");
      return;
    }
    if (setupPin !== setupConfirmPin) {
      setPinError("Confirm passcode does not match.");
      return;
    }

    const hashed = hashPasscode(setupPin);
    
    // Save locally
    localStorage.setItem('neonotex_vault_pin_hash', hashed);
    showToast("Vault Secure Pin Configured! 🛡️");
    
    // Auto unlock
    sessionStorage.setItem('neonotex_vault_key', setupPin);
    sessionStorage.setItem('neonotex_vault_unlocked', 'true');
    setVaultKey(setupPin);
    setIsVaultUnlocked(true);
    setIsSettingUpVault(false);
    setSetupPin('');
    setSetupConfirmPin('');
    setPinError('');
  };

  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const typedHash = hashPasscode(pinInput);
    
    if (typedHash === savedPinHash) {
      sessionStorage.setItem('neonotex_vault_key', pinInput);
      sessionStorage.setItem('neonotex_vault_unlocked', 'true');
      setVaultKey(pinInput);
      setIsVaultUnlocked(true);
      setPinInput('');
      setPinError('');
      showToast("Access Authorized 🔒");
    } else {
      setPinError("Incorrect PIN Passcode. Access Denied.");
      setPinInput('');
    }
  };

  const handleKeypadPress = (num: string) => {
    setPinError('');
    if (pinInput.length < 6) {
      setPinInput(prev => prev + num);
    }
  };

  const handleKeypadDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
  };

  // Physical computer keyboard pin typing support
  useEffect(() => {
    if (isVaultSection && !isVaultUnlocked && !isSettingUpVault && savedPinHash) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (/^[0-9]$/.test(e.key)) {
          if (pinInput.length < 6) {
            setPinInput(prev => prev + e.key);
          }
        } else if (e.key === 'Backspace') {
          setPinInput(prev => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          // Trigger unlock
          const typedHash = hashPasscode(pinInput);
          if (typedHash === savedPinHash) {
            sessionStorage.setItem('neonotex_vault_key', pinInput);
            sessionStorage.setItem('neonotex_vault_unlocked', 'true');
            setVaultKey(pinInput);
            setIsVaultUnlocked(true);
            setPinInput('');
            setPinError('');
            showToast("Access Authorized 🔒");
          } else {
            setPinError("Incorrect PIN Passcode. Access Denied.");
            setPinInput('');
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [pinInput, isVaultSection, isVaultUnlocked, isSettingUpVault, savedPinHash]);

  // Simulate Biometric login
  const triggerBiometricScan = () => {
    if (!biometricsEnabled) {
      alert("Biometric validation is not toggled. Please configure Biometrics in Settings (Neo Account page) first.");
      return;
    }
    setBioScanning(true);
    setPinError('');
    setTimeout(() => {
      // Fetch pin automatically
      const mockSavedPin = "1111"; // Standard fallback/simulated biometric PIN code
      sessionStorage.setItem('neonotex_vault_key', mockSavedPin);
      sessionStorage.setItem('neonotex_vault_unlocked', 'true');
      setVaultKey(mockSavedPin);
      setIsVaultUnlocked(true);
      setBioScanning(false);
      showToast("Biometric Signature Match: Unlocked 🔒");
    }, 1500);
  };

  const renderVaultLockScreen = () => {
    if (!savedPinHash) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-50 border border-slate-200 rounded-[28px] max-w-lg mx-auto my-12 text-center shadow-sm">
          <div className="h-16 w-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow">
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-bold text-zinc-950 font-sans">Set Up Private Vault</h2>
          <p className="text-xs text-slate-500 font-semibold max-w-xs mt-2 leading-relaxed">
            Create a secure passkey/PIN passcode to protect your documents in our secure encrypted local sandbox.
          </p>

          <form onSubmit={handleSetupSubmit} className="w-full mt-6 space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Set 4-6 Digit Secure PIN</label>
              <input 
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={setupPin}
                onChange={(e) => setSetupPin(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-slate-250 bg-white px-3 py-2.5 text-center font-mono font-bold text-sm tracking-widest focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Confirm PIN</label>
              <input 
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={setupConfirmPin}
                onChange={(e) => setSetupConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-slate-250 bg-white px-3 py-2.5 text-center font-mono font-bold text-sm tracking-widest focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>

            {pinError && (
              <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                <AlertCircle size={12} /> {pinError}
              </p>
            )}

            <button 
              type="submit"
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 border-none transition-colors text-white rounded-xl font-bold text-xs shadow cursor-pointer uppercase tracking-wider"
            >
              Configure Master Security
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-900 text-white rounded-[28px] max-w-md mx-auto my-12 text-center shadow-apple-extreme relative overflow-hidden">
        {bioScanning ? (
          <div className="flex flex-col items-center justify-center py-16 gap-6 animate-in fade-in zoom-in-95">
            <div className="relative flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border border-emerald-500 animate-ping absolute opacity-45" />
              <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                <Fingerprint size={32} className="text-zinc-950 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold tracking-widest uppercase text-emerald-400">Verifying Identity</h3>
              <p className="text-[10px] text-slate-400 font-medium">Please position finger on sensor simulator...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-5 shrink-0">
              <Lock size={22} className="text-white" />
            </div>
            <h2 className="text-lg font-bold font-sans">Locked Private Vault</h2>
            <p className="text-[11px] text-slate-400 font-semibold max-w-xs mt-1.5">
              Enter your passcode or trigger biometric signature simulation to read secure notes.
            </p>

            <form onSubmit={handlePinUnlock} className="w-full mt-6 space-y-5">
              {/* Dots representation */}
              <div className="flex justify-center gap-3.5">
                {[...Array(6)].map((_, i) => {
                  const hasChar = pinInput.length > i;
                  return (
                    <div 
                      key={i} 
                      className={`h-3 w-3 rounded-full border transition-all duration-150 ${hasChar ? 'bg-white border-white scale-110' : 'bg-transparent border-white/35'}`} 
                    />
                  );
                })}
              </div>

              {pinError && (
                <p className="text-xs text-rose-450 font-bold flex items-center gap-1 justify-center bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                  <AlertCircle size={13} /> {pinError}
                </p>
              )}

              {/* Grid Touch Keypad */}
              <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto pt-3">
                {['1','2','3','4','5','6','7','8','9'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="w-14 h-14 rounded-full bg-white/10 text-white font-extrabold text-lg hover:bg-white/20 active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer select-none"
                  >
                    {num}
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={handleKeypadDelete}
                  className="w-14 h-14 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer font-bold text-xs select-none uppercase"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="w-14 h-14 rounded-full bg-white/10 text-white font-extrabold text-lg hover:bg-white/20 active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer select-none"
                >
                  0
                </button>
                <button
                  type="submit"
                  disabled={pinInput.length < 4}
                  className="w-14 h-14 rounded-full bg-white text-zinc-950 font-extrabold text-[10px] uppercase hover:bg-slate-200 active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none"
                >
                  OK
                </button>
              </div>

              {biometricsEnabled && (
                <div className="pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={triggerBiometricScan}
                    className="mx-auto flex items-center gap-2 rounded-full py-2 px-5 text-[10px] font-bold tracking-wider text-emerald-400 border border-emerald-400/40 hover:bg-emerald-400/10 active:scale-95 transition-all cursor-pointer uppercase"
                  >
                    <Fingerprint size={14} /> Simulate biometrics
                  </button>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // HTML JSX LAYOUT
  // ----------------------------------------------------
  if (isVaultSection && !isVaultUnlocked) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        {renderVaultLockScreen()}
      </div>
    );
  }

  // Decrypted Active Note for Inspector
  const decryptedActiveNote = activeNote && activeNote.tags?.includes('locked') && isVaultUnlocked
    ? {
        ...activeNote,
        title: decryptNoteContent(activeNote.title, vaultKey),
        content: decryptNoteContent(activeNote.content, vaultKey)
      }
    : activeNote;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* LEFT COLUMN: Organized Notes Inset-Grouped List (Now full width) */}
      <div className={`w-full backdrop-blur-md rounded-[28px] border shadow-sm p-5 flex flex-col min-h-[500px] ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5' : 'bg-appleGray-100/90 border-slate-200/55'}`}>
        
        {/* List Title Block */}
        <div className="px-2 pt-2 pb-3 mb-1 flex items-baseline justify-between">
          <div>
            <h1 className={`text-3xl font-extrabold tracking-tight font-sans flex items-center gap-1.5 ${activeTheme === 'midnight-black' ? 'text-white' : activeTheme === 'sakura-pink' ? 'text-[#D81B60]' : 'text-[#1c1c1e]'}`}>
              {isVaultSection ? 'Private Vault' : 'Notes'}
            </h1>
          </div>
          <button 
            onClick={handleCreateNote} 
            className={`w-[44px] h-[44px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 shadow-md shadow-black/10 transition-all cursor-pointer ${
              activeTheme === 'sakura-pink'
                 ? 'bg-gradient-to-r from-[#FF5FA2] to-[#FF8FC7] text-white shadow-[0_4px_15px_rgba(255,95,162,0.4)] hover:shadow-[0_6px_20px_rgba(255,95,162,0.6)]'
                 : activeTheme === 'midnight-black'
                   ? 'bg-[#F7C948] text-black shadow-[0_4px_15px_rgba(247,201,72,0.3)] hover:brightness-110' 
                   : 'bg-black text-white hover:bg-slate-900 shadow-md shadow-black/10'
            }`}
            title={isVaultSection ? "Create Secure Note" : "Create Note"}
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Sorting Controller Bar */}
        <div className="flex items-center justify-between px-2 mb-3">
          <button
            onClick={() => navigate(RoutePath.HOME)}
            className={`p-1.5 rounded-lg transition-colors ${activeTheme === 'midnight-black' ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) setSelectedNotes(new Set());
              }}
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all ${
                isSelectionMode 
                  ? (activeTheme === 'midnight-black' ? 'bg-[#F7C948]/20 text-[#F7C948]' : 'bg-rose-100 text-rose-600')
                  : (activeTheme === 'midnight-black' ? 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200/70 hover:text-black')
              }`}
            >
              {isSelectionMode ? 'Done' : 'Select'}
            </button>
            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className={`flex items-center gap-1.5 leading-none shadow-sm/5 p-1.5 py-0.5 rounded-lg select-none ${activeTheme === 'midnight-black' ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200/70'}`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-400'}`}>Sort:</span>
                <span className={`text-[11px] font-bold capitalize flex items-center gap-1 ${activeTheme === 'midnight-black' ? 'text-[#8E8E93] hover:text-white' : 'text-slate-600 hover:text-black'}`}>
                  {sortBy.replace('-', ' ')}
                  <ChevronDown size={12} className="opacity-50" />
                </span>
              </button>
              
              {isSortDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortDropdownOpen(false)} />
                  <div className={`absolute right-0 top-full mt-1 z-50 w-36 rounded-xl shadow-lg border overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-slate-200'}`}>
                    {[
                      { value: 'last-edited', label: 'Last Edited' },
                      { value: 'created', label: 'Date Created' },
                      { value: 'title', label: 'Title (A-Z)' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value as any);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${
                          sortBy === option.value 
                            ? (activeTheme === 'midnight-black' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                            : (activeTheme === 'midnight-black' ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')
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
        </div>

        {/* Search Input Bar */}
        <div className="px-1 mb-4">
          <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 transition-all ${activeTheme === 'midnight-black' ? 'bg-[#111111] border border-white/5 focus-within:bg-[#161616] focus-within:ring-2 focus-within:ring-white/10' : 'bg-[#EAEAEA]/80 border border-slate-300/10 focus-within:ring-2 focus-within:ring-black/5 focus-within:bg-white'}`}>
            <Search size={16} className={activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'} />
            <input 
              type="text" 
              placeholder={isVaultSection ? "Search vault..." : "Search notes, folders, tags..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-transparent text-sm focus:outline-none w-full font-medium ${activeTheme === 'midnight-black' ? 'text-white placeholder:text-slate-500' : 'text-[#111111] placeholder:text-slate-500'}`}
            />
          </div>
        </div>

        {/* Notes Grouped List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          
          {/* Section: PINNED */}
          {pinned.length > 0 && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <span className={`text-[11px] font-bold uppercase tracking-widest pl-1 flex items-center gap-1 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-appleGray-500'}`}>
                <Pin size={10} className={activeTheme === 'midnight-black' ? 'text-white fill-white' : 'text-black fill-black'} /> Pinned
              </span>
              <div className="flex flex-col gap-2">
                {pinned.map((n) => renderNoteRow(n))}
              </div>
            </div>
          )}

          {/* Section: TODAY */}
          {today.length > 0 && (
            <div className="space-y-2">
              <span className={`text-[11px] font-bold uppercase tracking-widest pl-1 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-appleGray-500'}`}>Today</span>
              <div className="flex flex-col gap-2">
                {today.map((n) => renderNoteRow(n))}
              </div>
            </div>
          )}

          {/* Section: YESTERDAY */}
          {yesterday.length > 0 && (
            <div className="space-y-2">
              <span className={`text-[11px] font-bold uppercase tracking-widest pl-1 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-appleGray-500'}`}>Yesterday</span>
              <div className="flex flex-col gap-2">
                {yesterday.map((n) => renderNoteRow(n))}
              </div>
            </div>
          )}

          {/* Sections: MONTH ARCHIVES */}
          {Object.keys(older).map((monthKey) => (
            <div key={monthKey} className="space-y-2">
              <span className={`text-[11px] font-bold uppercase tracking-widest pl-1 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-appleGray-500'}`}>{monthKey}</span>
              <div className="flex flex-col gap-2">
                {older[monthKey].map((n) => renderNoteRow(n))}
              </div>
            </div>
          ))}

          {/* Empty Space Block (Fulfills exact vault empty requirements) */}
          {filteredNotes.length === 0 && !loading && (
            isVaultSection ? (
              <div className={`text-center py-24 px-4 border border-dashed rounded-[20px] mx-1 ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white/40 border-slate-200'}`}>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4 scale-102 hover:scale-105 transition-transform duration-300 shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#F7C948] text-black' : 'bg-zinc-950 text-white'}`}>
                  <Lock size={18} />
                </div>
                <h3 className={`text-sm font-bold leading-tight ${activeTheme === 'midnight-black' ? 'text-white' : 'text-zinc-900'}`}>🔒 Private Vault</h3>
                <p className={`text-[11px] font-semibold leading-relaxed max-w-[190px] mx-auto mt-1 opacity-90 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Store your most sensitive notes securely.
                </p>
                <button
                  type="button"
                  onClick={handleCreateSecureNote}
                  className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-zinc-950 hover:bg-zinc-850 px-4 py-2 text-[10px] font-bold text-white transition-transform active:scale-95 cursor-pointer uppercase shadow-sm"
                >
                  Create Secure Note
                </button>
              </div>
            ) : (
              <div className={`text-center py-20 px-4 border border-dashed rounded-[20px] mx-1 ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white/40 border-slate-200'}`}>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4 scale-102 shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#F7C948] text-black' : 'bg-zinc-950 text-white'}`}>
                  <FileText size={18} />
                </div>
                {searchQuery ? (
                  <>
                    <p className={`text-sm font-semibold leading-tight ${activeTheme === 'midnight-black' ? 'text-white' : 'text-zinc-900'}`}>No notes matching query</p>
                    <p className={`text-[11px] font-semibold mt-1 opacity-90 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>Try searching another tag or term.</p>
                  </>
                ) : (
                  <>
                    <h3 className={`text-sm font-bold leading-tight ${activeTheme === 'midnight-black' ? 'text-white' : 'text-zinc-900'}`}>No Notes Yet</h3>
                    <p className={`text-[11px] font-semibold leading-relaxed max-w-[210px] mx-auto mt-1 opacity-90 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Start writing with confidence. Your notes are protected with end-to-end encryption.
                    </p>
                  </>
                )}
              </div>
            )
          )}

          {loading && (
            <div className="space-y-3.5 p-2">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="h-16 bg-slate-200/50 rounded-xl animate-pulse" />
              ))}
            </div>
          )}
        </div>

        {/* Motivational Footer */}
        <div className="mt-8 pt-4 pb-2 flex justify-center text-center">
          <p className="text-[13px] font-medium text-slate-400/80 tracking-wide">
            🚀 Start writing. Your next big idea is waiting.
          </p>
        </div>
      </div>

      {/* Selection Toolbar */}
      {isSelectionMode && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-slate-200'}`}>
          <span className={`text-sm font-bold ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>
            {selectedNotes.size} selected
          </span>
          <div className="h-4 w-px bg-slate-300/50" />
          <button
            onClick={() => {
              setIsSelectionMode(false);
              setSelectedNotes(new Set());
            }}
            className={`text-sm font-bold hover:opacity-70 transition-opacity ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedNotes.size === 0}
            className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full transition-all ${
              selectedNotes.size === 0 
                ? 'opacity-50 cursor-not-allowed text-slate-400 bg-slate-100' 
                : 'text-white bg-rose-500 hover:bg-rose-600 shadow-sm'
            }`}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}

      {showSketchbook && (
        <Sketchbook 
          onSave={handleSketchSave} 
          onClose={() => setShowSketchbook(false)} 
        />
      )}
    </div>
  );

  // Note row visual builder inside grouped cells
  function renderNoteRow(note: Note) {
    const isSelected = note.id === selectedNoteId;
    const isPinned = note.tags?.includes('pinned');
    const isLocked = note.tags?.includes('locked');
    const isFavorite = note.tags?.includes('favorite');
    const hasImage = note.thumbnailUrl || (note.attachments && note.attachments.some(a => a.type?.startsWith('image/') || a.name.toLowerCase().endsWith('.png') || a.name.toLowerCase().endsWith('.jpg')));
    
    // Decrypt details first before rendering preview if locked & authorized
    let displayTitle = note.title;
    let displayContent = note.content;
    
    if (isLocked) {
      if (isVaultUnlocked) {
        displayTitle = decryptNoteContent(note.title, vaultKey);
        displayContent = decryptNoteContent(note.content, vaultKey);
      } else {
        displayTitle = "🔒 Secure Document Note";
        displayContent = "Content is encrypted";
      }
    }

    const preview = getPreviewText(displayContent) || 'No additional text';

    const handlePressStart = () => {
      pressTimerRef.current = setTimeout(() => {
        setIsSelectionMode(true);
        toggleSelection(note.id);
      }, 500); // 500ms long press
    };

    const handlePressEnd = () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
    };

    const isNoteSelected = selectedNotes.has(note.id);

    return (
      <div 
        key={note.id}
        onClick={(e) => {
          if (isSelectionMode) {
            e.preventDefault();
            toggleSelection(note.id);
          } else {
            navigate(RoutePath.NOTE_DETAIL.replace(':id', note.id));
          }
        }}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onContextMenu={(e) => {
          // Prevent right-click menu from popping up if we're entering selection mode
          e.preventDefault(); 
        }}
        className={`w-full text-left px-4 py-4 rounded-[18px] transition-all cursor-pointer flex items-center gap-3 group relative ${
          activeTheme === 'midnight-black' 
            ? (isNoteSelected ? 'bg-[#2A2A2C] border-white/20' : 'bg-[#161616] border border-white/5 shadow-sm hover:border-white/10 hover:bg-[#1C1C1E] hover:-translate-y-[2px]') 
            : (isNoteSelected ? 'bg-slate-100 border-slate-300' : 'bg-white border border-slate-200/50 hover:border-slate-300 hover:shadow-subtle')
        }`}
      >
        {isSelectionMode && (
          <div className="shrink-0 flex items-center justify-center mr-1">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
              isNoteSelected 
                ? (activeTheme === 'midnight-black' ? 'bg-[#F7C948] border-[#F7C948]' : 'bg-black border-black')
                : (activeTheme === 'midnight-black' ? 'border-white/20' : 'border-slate-300')
            }`}>
              {isNoteSelected && <CheckSquare size={12} className={activeTheme === 'midnight-black' ? 'text-black' : 'text-white'} />}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              {isLocked && <Lock size={11} className="text-slate-400 flex-shrink-0" />}
              {isFavorite && <Star size={11} className="text-amber-550 fill-amber-500 flex-shrink-0 text-amber-500 shrink-0" style={{ color: '#F59E0B', fill: '#F59E0B' }} />}
              <h4 className={`text-[14px] font-bold truncate transition-colors ${activeTheme === 'midnight-black' ? 'text-[#FFFFFF] group-hover:text-white' : activeTheme === 'sakura-pink' ? 'text-[#D81B60] group-hover:text-[#FF3366]' : 'text-[#1c1c1e] group-hover:text-black'}`}>
                {displayTitle || 'Untitled Note'}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 select-none">
            <span className={`text-[11px] font-bold shrink-0 ${activeTheme === 'midnight-black' ? 'text-[#B3B3B8]' : activeTheme === 'sakura-pink' ? 'text-[#D81B60]' : 'text-[#1c1c1e]/75'}`}>
               {new Date(note.updatedAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: '2-digit' })}
            </span>
            <span className={`text-[11px] truncate ${activeTheme === 'midnight-black' ? 'text-[#8e8e93]' : 'text-[#8e8e93]'}`}>
              {preview}
            </span>
          </div>

          {note.tags && note.tags.filter(t => t !== 'pinned' && t !== 'locked' && t !== 'favorite').length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {note.tags.filter(t => t !== 'pinned' && t !== 'locked' && t !== 'favorite').map(tag => (
                <span key={tag} className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${activeTheme === 'midnight-black' ? 'text-[#B3B3B8] bg-white/10 border-white/5' : 'text-slate-500 bg-slate-100/80 border-slate-200/50'} border`}>
                  <Tag size={8} /> #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {hasImage && !isLocked ? (
          <div className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5' : 'bg-slate-100 border-slate-200/50'}`}>
            {note.thumbnailUrl ? (
              <StorageImage path={note.thumbnailUrl} alt={note.title} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E]' : 'bg-slate-50'}`}>
                <FileText size={16} className={activeTheme === 'midnight-black' ? 'text-[#8E8E93]' : 'text-[#8e8e93]'} />
              </div>
            )}
          </div>
        ) : null}

      </div>
    );
  }
};
