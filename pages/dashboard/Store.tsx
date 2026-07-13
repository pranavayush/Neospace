import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Star, Package, Book, CheckCircle, PenTool, AlertCircle, ShoppingCart, Folder, FileText, MoreHorizontal, Gift, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import confetti from 'canvas-confetti';

export const Store: React.FC = () => {
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('neonotex_theme') || 'minimal-white';
  });

  const targetDate = new Date('2026-07-10T00:00:00Z').getTime();
  const startDate = new Date('2026-06-01T00:00:00Z').getTime();
  
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const handleConfetti = useCallback(() => {
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#a855f7', '#ec4899', '#3b82f6'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
      
      const now = new Date().getTime();
      const totalDuration = targetDate - startDate;
      const elapsed = now - startDate;
      setProgressPercent(Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(localStorage.getItem('neonotex_theme') || 'minimal-white');
    };
    window.addEventListener('neonotex_theme_changed', handleThemeChange);
    return () => window.removeEventListener('neonotex_theme_changed', handleThemeChange);
  }, []);

  const THEME_STYLES: Record<string, any> = {
    'minimal-white': {
      text: 'text-zinc-950',
      subtext: 'text-slate-500',
      cardBg: 'bg-[#FAFAFA]',
      cardBorder: 'border-slate-200/60',
      accent: 'text-[#5B5CF0]',
    },
    'midnight-black': {
      text: 'text-[#FFFFFF]',
      subtext: 'text-[#B0B0B0]',
      cardBg: 'bg-[#111111]',
      cardBorder: 'border-[#1A1A1A]',
      accent: 'text-[#F7C948]',
    },
    'sakura-pink': {
      text: 'text-[#D81B60]',
      subtext: 'text-[#E91E63]/70',
      cardBg: 'bg-white/80 backdrop-blur-xl',
      cardBorder: 'border-[#FFD6E8]',
      accent: 'text-[#FF3366]',
    }
  };

  const currentTheme = THEME_STYLES[activeTheme] || THEME_STYLES['minimal-white'];

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setNotified(true);
      setEmail('');
    }
  };

  const PREVIEW_PRODUCTS = [
    { name: 'Notebooks', icon: <Book size={48} className="mb-4 text-emerald-500 opacity-80" /> },
    { name: 'Pencils', icon: <PenTool size={48} className="mb-4 text-amber-500 opacity-80" /> },
    { name: 'Pens', icon: <PenTool size={48} className="mb-4 text-blue-500 opacity-80" /> },
    { name: 'Erasers', icon: <Package size={48} className="mb-4 text-rose-400 opacity-80" /> },
    { name: 'Rulers', icon: <Star size={48} className="mb-4 text-indigo-500 opacity-80" /> },
    { name: 'Scissors', icon: <Star size={48} className="mb-4 text-orange-500 opacity-80" /> },
    { name: 'Study Kits', icon: <ShoppingBag size={48} className="mb-4 text-fuchsia-500 opacity-80" /> },
    { name: 'Highlighters', icon: <Star size={48} className="mb-4 text-yellow-400 opacity-80" /> },
    { name: 'Markers', icon: <PenTool size={48} className="mb-4 text-cyan-500 opacity-80" /> },
    { name: 'Sticky Notes', icon: <FileText size={48} className="mb-4 text-lime-500 opacity-80" /> },
    { name: 'Files & Folders', icon: <Folder size={48} className="mb-4 text-purple-500 opacity-80" /> },
    { name: 'Many More...', icon: <MoreHorizontal size={48} className="mb-4 text-slate-400 opacity-80" /> },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-6 animate-in fade-in duration-500 pb-20 px-4 md:px-0">
      
      {/* Header Block */}
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b ${currentTheme.cardBorder}`}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-3xl md:text-5xl font-extrabold tracking-tight font-sans ${currentTheme.text}`}>
              Neo Store
            </h1>
          </div>
          <p className={`text-sm md:text-base font-semibold mt-2 opacity-90 leading-relaxed max-w-xl ${currentTheme.subtext}`}>
            Everything a student needs, at the best price.
          </p>
        </div>
      </div>

      {/* Banner */}
      <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-14 border ${currentTheme.cardBorder} flex flex-col items-center justify-center text-center ${activeTheme === 'midnight-black' ? 'bg-[#111111]' : 'bg-[#FAFAFA]'}`}>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse ${activeTheme === 'midnight-black' ? 'bg-amber-500' : 'bg-purple-500'}`}></div>
        <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000 ${activeTheme === 'midnight-black' ? 'bg-orange-500' : 'bg-indigo-500'}`}></div>
        
        <div className="relative z-10 flex flex-col items-center space-y-6">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${activeTheme === 'midnight-black' ? 'bg-[#F7C948]/20 text-[#F7C948]' : 'bg-indigo-50 text-indigo-600'}`}>
            🚀 Coming Soon
          </span>
          <h2 className={`text-4xl md:text-5xl font-black ${currentTheme.text} tracking-tight`}>
            🛍️ Neo Store
          </h2>
          <p className={`text-lg md:text-xl font-medium max-w-2xl ${currentTheme.subtext}`}>
            Buy premium stationery directly from Neonotex at student-friendly prices. <br className="hidden md:block"/> From notebooks to pens, we've got everything you need to stay productive.
          </p>
        </div>
      </div>

      {/* Launch Countdown */}
      <div className={`relative rounded-[2rem] p-8 md:p-10 border ${currentTheme.cardBorder} ${currentTheme.cardBg} flex flex-col items-center justify-center text-center`}>
        <div className="flex flex-col items-center space-y-8 relative z-50 w-full">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-[#1A1A1A] mb-2 flex-shrink-0">
            <motion.span 
              initial={{ y: "100vh", x: "50vw", scale: 4, opacity: 0 }}
              animate={{ 
                y: ["100vh", "-80vh", "60vh", "-40vh", "20vh", "-10vh", 0], 
                x: ["50vw", "-40vw", "30vw", "-20vw", "10vw", "-5vw", 0], 
                rotate: [-45, -135, 45, -135, 45, -90, 0], 
                opacity: [0, 1, 1, 1, 1, 1, 1],
                scale: [4, 3, 3.5, 2, 2.5, 1.5, 1] 
              }}
              transition={{ duration: 6.5, ease: "easeInOut" }}
              className="text-4xl text-center inline-block drop-shadow-[0_15px_15px_rgba(244,63,94,0.6)]"
            >
              🚀
            </motion.span>
          </div>
          
          <h3 className={`text-2xl font-extrabold tracking-tight ${currentTheme.text}`}>You're early. Get ready for launch.</h3>
        </div>
      </div>

      {/* Launch Offer & Notify */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Launch Offer Section */}
        <div className={`p-8 md:p-10 rounded-[2rem] border ${currentTheme.cardBorder} ${currentTheme.cardBg} flex flex-col justify-center`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔥</span>
            <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${currentTheme.text}`}>Launch Offer</h3>
          </div>
          <p className={`font-semibold mb-6 ${currentTheme.subtext} text-sm md:text-base`}>Get exclusive discounts on stationery products.</p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <CheckCircle size={20} className={currentTheme.accent} />
              <span className={`font-medium ${currentTheme.text}`}>Up to 50% OFF on selected items.</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle size={20} className={currentTheme.accent} />
              <span className={`font-medium ${currentTheme.text}`}>Student-friendly pricing.</span>
            </li>
          </ul>
        </div>

        {/* Birthday Discount Section */}
        <div 
          className="relative group p-[1px] rounded-[2rem] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 overflow-hidden cursor-default"
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500`} />
          
          <div className={`relative h-full rounded-[2rem] p-8 md:p-10 backdrop-blur-3xl transition-transform duration-500 group-hover:-translate-y-1 ${activeTheme === 'midnight-black' ? 'bg-[#0A0A0A]/90' : 'bg-white/90'} flex flex-col justify-center`}>
            <div 
              className="absolute top-6 right-6 animate-pulse text-yellow-400 cursor-pointer z-20 hover:scale-110 transition-transform" 
              onClick={(e) => { e.stopPropagation(); handleConfetti(); }}
            >
              <Sparkles size={20} />
            </div>

            <div className="flex flex-col space-y-4">
              <h3 className={`text-2xl md:text-3xl font-black tracking-tight ${currentTheme.text} flex items-center gap-3`}>
                <span className="drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">🎂</span> Birthday Discount
              </h3>
              <p className={`text-sm md:text-base font-medium ${currentTheme.subtext} leading-relaxed`}>
                Celebrate your special day with an exclusive Neo Store discount available only on your birthday.
              </p>

              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-purple-500/20">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎂</span>
                  <span className={`text-sm font-bold ${currentTheme.text}`}>Birthday Special Discount</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎉</span>
                  <span className={`text-sm font-bold ${currentTheme.text}`}>Valid Only On Your Birthday</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🛍️</span>
                  <span className={`text-sm font-bold ${currentTheme.text}`}>Applicable Across Eligible Store Items</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">✨</span>
                  <span className={`text-sm font-bold ${currentTheme.text}`}>Automatically Unlocked On Your Birthday</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Preview */}
      <div className="pt-6">
        <h3 className={`text-2xl font-extrabold tracking-tight mb-8 flex items-center gap-3 ${currentTheme.text}`}>
          <ShoppingCart size={24} className={currentTheme.accent} /> Product Preview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {PREVIEW_PRODUCTS.map((product, idx) => (
             <div key={idx} className={`p-8 rounded-[2rem] border flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 ${currentTheme.cardBorder} ${currentTheme.cardBg} hover:shadow-lg`}>
               {product.icon}
               <span className={`font-bold tracking-tight text-sm ${currentTheme.text}`}>{product.name}</span>
             </div>
          ))}
        </div>
      </div>

      {/* Footer Message */}
      <div className={`mt-16 py-12 border-t ${currentTheme.cardBorder} flex flex-col items-center text-center space-y-4`}>
         <p className={`text-xl md:text-2xl font-black tracking-tight ${currentTheme.text}`}>✨ Building something exciting for students.</p>
         <p className={`text-base font-medium ${currentTheme.subtext}`}>Stay tuned.</p>
         <div className="pt-8">
           <span className={`font-black text-2xl tracking-tighter ${currentTheme.text}`}>Neonotex</span>
           <span className={`block mt-1.5 font-bold text-[10px] tracking-widest uppercase ${currentTheme.accent}`}>🚀 Think It. Push It.</span>
         </div>
      </div>

    </div>
  );
};
