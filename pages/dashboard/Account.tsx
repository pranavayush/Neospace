import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { 
  User, Mail, Shield, AlertTriangle, Save, Camera, Lock, ChevronRight, 
  Globe, Key, Trash2, Smartphone, X, Image as ImageIcon, Check, Sliders, Instagram, LogOut, Calendar, Share2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../supabaseClient';
import { RoutePath } from '../../types';
import { storageService } from '../../services/storageService';
import { StorageImage } from '../../components/ui/StorageImage';
import { useAuth } from '../../context/AuthContext';
import { AnimatedAvatar, ANIMATED_AVATARS } from '../../components/AnimatedAvatar';
import { DatePicker } from '../../components/ui/DatePicker';
import { motion, AnimatePresence } from 'motion/react';

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
  { value: 'I\'m Gay', label: 'I\'m Gay' },
];

const getBirthdayCountdownText = (birthdayStr: string) => {
  if (!birthdayStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bday = new Date(birthdayStr + 'T00:00:00');
  bday.setFullYear(today.getFullYear());
  if (bday < today) {
    bday.setFullYear(today.getFullYear() + 1);
  }
  const diffTime = Math.abs(bday.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Happy Birthday! 🎉🥳';
  if (diffDays === 1) return 'Tomorrow! 🎈';
  return `🥳 ${diffDays} days away`;
};

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // User profile details
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  
  // Avatar system state
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // Crop Tool Simulator State
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotation, setCropRotation] = useState(0);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });


  // Read theme
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('neonotex_theme') || 'minimal-white';
  });

  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const genderDropdownRef = useRef<HTMLDivElement>(null);

  const handleGenderSelect = async (selectedGender: string) => {
    setGender(selectedGender);
    setIsGenderDropdownOpen(false);
    
    // Auto-save the gender specifically so it persists immediately
    try {
      await supabase.auth.updateUser({
        data: { gender: selectedGender }
      });
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error("Failed to auto-save gender:", err);
    }
    
    if (selectedGender === 'I\'m Gay') {
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    }
  };

  useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(localStorage.getItem('neonotex_theme') || 'minimal-white');
    };
    window.addEventListener('neonotex_theme_changed', handleThemeChange);
    return () => window.removeEventListener('neonotex_theme_changed', handleThemeChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target as Node)) {
        if ((event.target as Element).closest('.mobile-gender-portal')) {
          return;
        }
        setIsGenderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate(RoutePath.LOGIN);
        return;
      }

      setUserId(user.id);
      setEmail(user.email || '');
      setAvatarPath(user.user_metadata?.avatar_url || null);
      setFullName(user.user_metadata?.full_name || '');
      setDisplayName(user.user_metadata?.display_name || '');
      setBirthday(user.user_metadata?.birthday || '');
      setGender(user.user_metadata?.gender || '');
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setFetching(false);
    }
  };

  // ----------------------------------------------------
  // PROFILE AVATAR SYSTEMS
  // ----------------------------------------------------
  
  // Trigger file uploads and direct them straight to Crop Screen!
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert("Only JPEG, JPG, PNG, and WEBP formats are supported.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setRawImageSrc(reader.result as string);
        setCropZoom(100);
        setCropRotation(0);
        setCropOffset({ x: 0, y: 0 });
        setIsCropOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submitting Crop - uploads to storage bucket
  const applyCropAndSave = async () => {
    if (!rawImageSrc) return;
    setLoading(true);
    setIsCropOpen(false);

    try {
      // Decode base64 to File
      const res = await fetch(rawImageSrc);
      const blob = await res.blob();
      const file = new File([blob], `avatar_cropped_${Date.now()}.png`, { type: 'image/png' });

      // Save to Supabase storage under "avatar" folder
      const path = await storageService.uploadFile(file, userId, 'avatar', `avatar.png`);
      setAvatarPath(path);

      // Instantly synchronize user metadata
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: path }
      });
      if (error) throw error;

      showToast("Profile Photo Cropped & Saved! 🎨");
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error("Error cropping photo:", err);
      alert("Failed to save cropped image.");
    } finally {
      setLoading(false);
    }
  };

  // Preset built-ins anime avatar selection
  const selectAnimatedAvatar = async (avatarId: string) => {
    setLoading(true);
    try {
      const dbValue = `animated:${avatarId}`;
      setAvatarPath(dbValue);
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: dbValue }
      });
      if (error) throw error;

      showToast("Animated avatar applied! ✨");
      if (refreshUser) refreshUser();
      setIsGalleryOpen(false);
    } catch (err) {
      console.error("Failed to select animated avatar", err);
    } finally {
      setLoading(false);
    }
  };

  // Remove avatar/photo completely (fallbacks to Initials)
  const removeAvatar = async () => {
    setLoading(true);
    try {
      setAvatarPath(null);
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });
      if (error) throw error;
      
      showToast("Profile photo removed.");
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error("Failed to remove avatar", err);
    } finally {
      setLoading(false);
    }
  };


  // Submitting standard layout metadata changes (Name, timezone)
  const handleProfileSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          display_name: displayName,
          birthday: birthday,
          gender: gender
        }
      });
      if (error) throw error;

      showToast("Settings Updated Successfully! ✅");
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error("Error saving profile settings:", err);
      alert("Failure updating profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + RoutePath.ACCOUNT,
      });
      if (error) throw error;
      alert("Verification password reset email sent!");
    } catch (err: any) {
      alert(err.message || "Failed to trigger reset.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(RoutePath.LOGIN);
  };

  const handleInviteFriends = async () => {
    const inviteText = "Check out Neonotex to manage your notes seamlessly! Join me at " + window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Neonotex',
          text: inviteText,
          url: window.location.origin,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(inviteText);
      showToast("Invite link copied to clipboard!");
    }
  };

  // Get initials fallback representation
  const getInitials = () => {
    const primaryName = displayName?.trim() || fullName?.trim();
    const first = primaryName?.split(' ')[0] || email || 'P';
    const last = primaryName?.split(' ')[1] || '';
    if (last) {
      return (first[0] + last[0]).toUpperCase();
    }
    return first[0].toUpperCase();
  };

  // ----------------------------------------------------
  // DRAGGING INTERACTIVE CROP HANDLERS
  // ----------------------------------------------------
  const startDrag = (e: React.MouseEvent) => {
    setIsDraggingCrop(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };
  const onDrag = (e: React.MouseEvent) => {
    if (isDraggingCrop) {
      setCropOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  const endDrag = () => {
    setIsDraggingCrop(false);
  };

  if (fetching) {
    return (
      <div className={`flex h-screen w-full items-center justify-center ${activeTheme === 'midnight-black' ? 'bg-[#000000] text-slate-400' : 'text-slate-500 bg-[#FAFAFA]'}`}>
         <div className="flex flex-col items-center gap-3">
            <div className={`h-6 w-6 animate-spin rounded-full border-2 border-t-transparent ${activeTheme === 'midnight-black' ? 'border-amber-400 border-t-transparent' : 'border-slate-900 border-t-transparent'}`}></div>
            <span className="text-sm font-medium">Loading account...</span>
         </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      
      {/* Background Ambient Decorator */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[100px] -z-10 mix-blend-multiply pointer-events-none ${activeTheme === 'midnight-black' ? 'bg-[#F7C948]/5 mix-blend-screen' : 'bg-slate-300/10'}`} />

      {/* Main Glass Panel */}
      <div className={`relative rounded-[40px] border backdrop-blur-[60px] shadow-xl overflow-hidden ${activeTheme === 'midnight-black' ? 'border-white/10 bg-[#161616]/80' : 'border-white/60 bg-white/40'}`}>
        
        <form onSubmit={handleProfileSaveChanges} className={`divide-y ${activeTheme === 'midnight-black' ? 'divide-white/10' : 'divide-white/45'}`}>
          
          {/* Header Profile Picture Management Area */}
          <div className={`px-6 sm:px-12 py-12 flex flex-col md:flex-row items-center gap-8 justify-between relative ${activeTheme === 'midnight-black' ? 'bg-[#111111]/50' : 'bg-white/10'}`}>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Profile Avatar Frame with on-hover trigger */}
              <div 
                className="group relative cursor-pointer"
                onClick={() => document.getElementById('file-avatar-upload')?.click()}
              >
                <div className={`h-32 w-32 rounded-full p-1 border shadow-lg transition-transform duration-300 group-hover:scale-103 hover:shadow-xl relative overflow-hidden flex items-center justify-center ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-slate-200/65'}`}>
                  {avatarPath ? (
                    avatarPath.startsWith('animated:') ? (
                      <AnimatedAvatar id={avatarPath.replace('animated:', '')} className="h-full w-full rounded-full" interactive={false} />
                    ) : avatarPath.startsWith('http') ? (
                      <img src={avatarPath} alt="Preset Profile" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <StorageImage path={avatarPath} alt="Profile" className="h-full w-full rounded-full object-cover" />
                    )
                  ) : (
                    <div className="h-full w-full rounded-full bg-zinc-900 text-white font-extrabold text-3xl flex items-center justify-center">
                      {getInitials()}
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  className={`absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full shadow ring-2 transition-all cursor-pointer ${activeTheme === 'midnight-black' ? 'bg-[#F7C948] text-black ring-[#111111] hover:bg-[#D4A017]' : 'bg-black text-white hover:bg-slate-900 ring-white'}`}
                >
                  <Camera size={14} />
                </button>
                <input 
                  id="file-avatar-upload"
                  type="file" 
                  accept=".jpg,.jpeg,.png,.webp" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-1.5 min-w-0 max-w-full">
                <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight truncate ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-950'}`}>
                  {displayName || fullName || email.split('@')[0]}
                </h1>
                <p className={`text-xs font-semibold flex items-center gap-2 justify-center sm:justify-start max-w-full overflow-hidden ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Mail size={13} className={`shrink-0 ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className="truncate min-w-0">{email}</span>
                </p>
                <div className="flex flex-wrap gap-2 pt-1.5 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-avatar-upload')?.click()}
                    className={`rounded-full border px-3.5 py-1.5 text-[10.5px] font-bold transition-all cursor-pointer ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10 hover:bg-[#2C2C2E] text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                  >
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGalleryOpen(true)}
                    className={`rounded-full px-3.5 py-1.5 text-[10.5px] font-bold transition-all cursor-pointer border border-transparent shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#F7C948] hover:bg-[#D4A017] text-black' : 'bg-zinc-950 hover:bg-zinc-900 text-white'}`}
                  >
                    Choose Animated Avatar
                  </button>
                  {avatarPath && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className={`rounded-full border px-3.5 py-1.5 text-[10.5px] font-bold transition-all cursor-pointer ${activeTheme === 'midnight-black' ? 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-500' : 'bg-rose-50/70 border-rose-100 hover:bg-rose-100/80 text-rose-600'}`}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Main Form Fields Layout */}
          <div className={`px-6 sm:px-12 py-10 space-y-12 ${activeTheme === 'midnight-black' ? 'bg-[#111111]/50' : 'bg-white/10'}`}>
            
            {/* Section 1: Name and details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] text-slate-400' : 'bg-zinc-900 text-white'}`}>
                  <User size={15} />
                </div>
                <h3 className={`text-base font-bold ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <Input 
                  label="Full Name" 
                  name="fullName" 
                  theme={activeTheme}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                />
                <Input 
                  label="Display Name" 
                  name="displayName" 
                  theme={activeTheme}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Jane"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-xs font-bold uppercase tracking-wider ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-500'}`}>
                      Birthday
                    </label>
                    {birthday && (
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${activeTheme === 'midnight-black' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                        {getBirthdayCountdownText(birthday)}
                      </span>
                    )}
                  </div>
                  <DatePicker
                    value={birthday}
                    onChange={setBirthday}
                    theme={activeTheme}
                  />
                </div>
                
                <div className="w-full">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-500/80'}`}>
                    Gender
                  </label>
                  <div className="relative" ref={genderDropdownRef}>
                    <div 
                      onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                      className={`w-full rounded-2xl border px-5 py-4 text-[15px] font-medium shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 cursor-pointer flex justify-between items-center ${
                        activeTheme === 'midnight-black' 
                          ? 'bg-[#1C1C1E] border-white/10 text-white hover:bg-[#2C2C2E] hover:border-white/20 focus:border-white/30 focus:bg-[#2C2C2E]' 
                          : 'bg-white/50 border-slate-200/60 text-slate-900 hover:bg-white/80 hover:border-slate-300/60 hover:shadow-md'
                      } ${isGenderDropdownOpen ? (activeTheme === 'midnight-black' ? 'border-white/40 ring-4 ring-white/10' : 'border-slate-800/30 bg-white ring-4 ring-slate-900/10 shadow-md') : ''}`}
                    >
                      <span>{gender || <span className="text-slate-500">Select Gender</span>}</span>
                      <div className={`transition-transform duration-200 text-slate-500 ${isGenderDropdownOpen ? 'rotate-180' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                    
                    {/* Inner shadow/highlight for depth */}
                    <div className={`absolute inset-0 rounded-2xl ring-1 ring-inset pointer-events-none ${activeTheme === 'midnight-black' ? 'ring-white/5' : 'ring-black/5'}`} />

                    <AnimatePresence>
                      {isGenderDropdownOpen && (
                        <>
                          {/* Desktop Dropdown */}
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`hidden md:block absolute z-50 mt-2 w-full rounded-[16px] border p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-slate-100'}`}
                          >
                            <div className="flex flex-col">
                              {GENDER_OPTIONS.map((option) => (
                                <div
                                  key={option.value}
                                  onClick={() => {
                                    handleGenderSelect(option.value);
                                  }}
                                  className={`flex items-center gap-3 px-3 py-3 rounded-[12px] cursor-pointer font-medium text-[15px] transition-colors ${gender === option.value ? (activeTheme === 'midnight-black' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900') : (activeTheme === 'midnight-black' ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}`}
                                >
                                  <span>{option.label}</span>
                                  {gender === option.value && (
                                    <div className="ml-auto text-indigo-500">
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>

                          {/* Mobile Bottom Sheet */}
                          {<div className="md:hidden mobile-gender-portal">
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setIsGenderDropdownOpen(false)}
                                className={`fixed inset-0 z-[100] ${activeTheme === 'midnight-black' ? 'bg-black/60' : 'bg-slate-900/40'} backdrop-blur-sm`}
                              />
                              <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className={`fixed bottom-0 left-0 right-0 z-[101] rounded-t-[24px] p-6 shadow-[0_-20px_60px_rgba(0,0,0,0.15)] pb-10 ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-t border-white/10' : 'bg-white border-t border-slate-100'}`}
                              >
                                <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 ${activeTheme === 'midnight-black' ? 'bg-white/20' : 'bg-slate-200'}`} />
                                <h4 className={`text-xl font-bold mb-5 px-1 ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>Select Gender</h4>
                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[60vh] custom-scrollbar px-1 pb-2">
                                  {GENDER_OPTIONS.map((option) => (
                                    <div
                                      key={option.value}
                                      onClick={() => {
                                        handleGenderSelect(option.value);
                                      }}
                                      className={`flex items-center gap-4 px-4 py-3.5 rounded-[16px] cursor-pointer font-semibold text-[16px] transition-colors ${gender === option.value ? (activeTheme === 'midnight-black' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900') : (activeTheme === 'midnight-black' ? 'text-slate-300 hover:bg-white/5 active:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100 hover:text-slate-900')}`}
                                    >
                                      <span>{option.label}</span>
                                      {gender === option.value && (
                                        <div className="ml-auto text-indigo-500">
                                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            </div>}
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Security & Lock Simulation Options */}
            <div className={`space-y-6 pt-8 border-t ${activeTheme === 'midnight-black' ? 'border-white/10' : 'border-slate-200/50'}`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] text-slate-400' : 'bg-zinc-900 text-white'}`}>
                    <Shield size={15} />
                  </div>
                  <h3 className={`text-base font-bold ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-905'}`}>Privacy & Security</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium pl-11">
                  Your notes are protected using end-to-end encryption and industry-standard security practices.
                </p>
              </div>

              <div className={`rounded-3xl border p-6 space-y-6 shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/10' : 'border-slate-200/60 bg-white/70'}`}>
                
                {/* Security Status Badges */}
                <div className={`rounded-2xl p-5 border ${activeTheme === 'midnight-black' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100/50'}`}>
                  <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${activeTheme === 'midnight-black' ? 'text-emerald-500' : 'text-emerald-900'}`}>Security Status</h4>
                  <ul className="space-y-2.5">
                    <li className={`flex items-center gap-2.5 text-xs font-semibold ${activeTheme === 'midnight-black' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      <div className="h-4 w-4 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0"><Check size={10} /></div>
                      End-to-End Encryption Active
                    </li>
                    <li className={`flex items-center gap-2.5 text-xs font-semibold ${activeTheme === 'midnight-black' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      <div className="h-4 w-4 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0"><Check size={10} /></div>
                      Secure Authentication Enabled
                    </li>
                    <li className={`flex items-center gap-2.5 text-xs font-semibold ${activeTheme === 'midnight-black' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      <div className="h-4 w-4 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0"><Check size={10} /></div>
                      Private Data Protection
                    </li>
                  </ul>
                </div>

                {/* Reset Password */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] text-slate-400' : 'bg-slate-150 text-slate-700'}`}>
                      <Key size={16} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${activeTheme === 'midnight-black' ? 'text-slate-300' : 'text-slate-900'}`}>Account Passcode</h4>
                      <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5">Reset or alter your standard cloud account password.</p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" className={`rounded-full ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/20 text-slate-300 hover:bg-[#2C2C2E]' : ''}`} onClick={handlePasswordReset}>
                    Change Password
                  </Button>
                </div>

                <div className={`h-px ${activeTheme === 'midnight-black' ? 'bg-white/10' : 'bg-slate-200/60'}`} />

                {/* Contact & Support */}
                <div className="flex flex-col gap-3">
                  <div>
                    <h4 className={`text-xs font-bold ${activeTheme === 'midnight-black' ? 'text-slate-300' : 'text-slate-900'}`}>Contact & Support & Share</h4>
                    <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5">Reach out to us directly and Share Neonotex with your friends</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleInviteFriends}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10 text-slate-400 hover:text-indigo-500 hover:bg-[#2C2C2E]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600'}`}
                      title="Share with friends"
                    >
                      <Share2 size={14} />
                    </button>
                    <a 
                      href="https://www.instagram.com/neonotex/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10 text-slate-400 hover:text-pink-500 hover:bg-[#2C2C2E]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-pink-600'}`}
                      title="Follow us on Instagram"
                    >
                      <Instagram size={14} />
                    </a>
                    <a 
                      href="mailto:devpranavayush@outlook.com" 
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10 text-slate-400 hover:text-white hover:bg-[#2C2C2E]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                      title="Email developer"
                    >
                      <Mail size={14} />
                    </a>
                  </div>
                </div>

              </div>
            </div>



          </div>

          {/* Footer Save Changes Bar */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-t px-8 sm:px-12 pb-8 pt-6 gap-5 backdrop-blur-xl rounded-b-[40px] ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white/80 border-slate-250'}`}>
            <button 
              type="button" 
              onClick={handleSignOut}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-auto ${activeTheme === 'midnight-black' ? 'text-slate-500 hover:text-rose-500' : 'text-slate-450 hover:text-rose-650'}`}
            >
              <div className={`p-2 rounded-full border shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/10' : 'bg-white border-slate-200'}`}>
                <LogOut size={13} />
              </div>
              Sign Out Account
            </button>
            <div className="flex gap-3 self-end sm:self-auto flex-wrap justify-end">
              <Button type="button" variant="ghost" onClick={() => navigate(RoutePath.HOME)} className={`rounded-full ${activeTheme === 'midnight-black' ? 'text-slate-300 hover:text-white hover:bg-white/10' : ''}`}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading} variant="primary" theme={activeTheme} className="rounded-full tracking-tight font-extrabold whitespace-nowrap transition-all duration-300 px-6">
                <Save className="mr-2 h-4 w-4 shrink-0" />
                Commit Updates
              </Button>
            </div>
          </div>

        </form>
      </div>

      {/* ----------------------------------------------------
          INTERACTIVE CROP MODAL / SLIDER PANEL WORKSPACE
          ---------------------------------------------------- */}
      {isCropOpen && rawImageSrc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-[32px] border border-white/20 bg-zinc-900 p-6 text-white shadow-2xl flex flex-col gap-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-slate-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Crop/Align Profile Photo</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsCropOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Instruction Callout */}
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Drag photo inside the circle window to align it. Zoom in or rotate using sliders below.
            </p>

            {/* Circular Align Frame Crop Box Viewport */}
            <div className="relative h-64 w-full bg-zinc-950 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 select-none">
              <div className="absolute inset-0 bg-black/35 z-10 pointer-events-none" />
              
              {/* Highlight Circle Guideline Mask */}
              <div className="w-[180px] h-[180px] rounded-full border-2 border-dashed border-white/80 absolute z-20 pointer-events-none ring-[1000px] ring-black/45 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
              
              {/* Actual Image Drag Canvas */}
              <div 
                className="absolute w-full h-full flex items-center justify-center cursor-move"
                onMouseDown={startDrag}
                onMouseMove={onDrag}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
              >
                <img 
                  src={rawImageSrc} 
                  alt="Source Crop" 
                  className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-75"
                  style={{
                    transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom / 100}) rotate(${cropRotation}deg)`
                  }}
                />
              </div>
            </div>

            {/* Zoom / Scale Trackers */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Resize Zoom</span>
                    <span>{cropZoom}%</span>
                  </div>
                  <input 
                    type="range"
                    min="50"
                    max="250"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseInt(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Orientation Rotation</span>
                    <span>{cropRotation}°</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="360"
                    value={cropRotation}
                    onChange={(e) => setCropRotation(parseInt(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
              </div>
            </div>

            {/* Action Triggers */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCropOpen(false)}
                className="rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-xs font-bold hover:bg-white/5 cursor-pointer uppercase tracking-wider"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={applyCropAndSave}
                className="rounded-full bg-white text-zinc-950 font-bold px-6 py-2.5 text-xs hover:bg-slate-200 transition-all cursor-pointer uppercase tracking-wider"
              >
                Apply Crop Selection
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          INTERACTIVE ANIMATED AVATARS GALLERY MODAL
          ---------------------------------------------------- */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-250">
          <div className="relative w-full max-w-2xl rounded-[32px] border border-white/20 bg-zinc-950 p-6 md:p-8 text-white shadow-2xl flex flex-col gap-6 my-8 max-h-[90vh]">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">✨</span>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider">Animated Avatar Gallery</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Smooth, responsive, high-fidelity Gen Z cyberpunk avatars</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsGalleryOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Avatar Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 overflow-y-auto pr-1 select-none py-2 max-h-[50vh]">
              {ANIMATED_AVATARS.map((avatar) => {
                const isActive = avatarPath === `animated:${avatar.id}`;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => selectAnimatedAvatar(avatar.id)}
                    className={`group flex flex-col items-center p-3 rounded-2xl border bg-black/35 transition-all text-center relative hover:scale-103 cursor-pointer ${
                      isActive 
                        ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] ring-1 ring-indigo-500/50'
                        : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-0.5 text-white z-10 shadow-md">
                        <Check size={10} className="stroke-[3]" />
                      </div>
                    )}

                    <div className="mb-3">
                      <AnimatedAvatar id={avatar.id} className="w-16 h-16 rounded-full" interactive={true} />
                    </div>

                    <h4 className="text-[11px] font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">
                      {avatar.name}
                    </h4>
                    <span className="text-[8px] font-mono font-bold tracking-widest text-slate-400 uppercase mt-1 block">
                      {avatar.category}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions Row */}
            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="rounded-full border border-white/20 bg-transparent px-6 py-2 text-xs font-bold hover:bg-white/5 cursor-pointer uppercase tracking-wider"
              >
                Close Gallery
              </button>
            </div>

          </div>
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
