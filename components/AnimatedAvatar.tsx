import React from 'react';

export interface AvatarOption {
  id: string;
  name: string;
  category: string;
  bgGrad: string;
}

export const ANIMATED_AVATARS: AvatarOption[] = [
  { id: 'anime-boy', name: 'Anime Boy', category: 'Lofi & Chill', bgGrad: 'from-blue-600/25 to-indigo-600/25' },
  { id: 'anime-girl', name: 'Anime Girl', category: 'KAWAII', bgGrad: 'from-pink-500/20 to-rose-500/20' },
  { id: 'cyberpunk-anime', name: 'Cyberpunk Anime', category: 'NEO-TOKYO 2099', bgGrad: 'from-fuchsia-600/30 to-cyan-500/20' },
  { id: 'pixel-character', name: 'Pixel Character', category: 'RETRO 8-BIT', bgGrad: 'from-amber-500/20 to-orange-600/20' },
  { id: 'chibi-character', name: 'Chibi Character', category: 'CUTE MINI', bgGrad: 'from-purple-500/20 to-pink-500/20' },
  { id: 'hacker-avatar', name: 'Hacker Avatar', category: 'MATRIX NET', bgGrad: 'from-emerald-500/25 to-zinc-900' },
  { id: 'minimal-neon', name: 'Minimal Neon Avatar', category: 'ABSTRACT VECTOR', bgGrad: 'from-cyan-500/10 to-blue-600/30' },
  { id: 'japanese-anime', name: 'Japanese Anime Style', category: 'POP ART', bgGrad: 'from-red-500/15 to-orange-500/15' },
  { id: 'cute-mascot', name: 'Cute Mascot Avatar', category: 'GAMER CHILL', bgGrad: 'from-yellow-400/20 to-amber-505/20' },
  { id: 'space-explorer', name: 'Space Explorer Avatar', category: 'COSMIC DRIVE', bgGrad: 'from-violet-600/30 to-indigo-900/40' }
];

interface AnimatedAvatarProps {
  id: string;
  className?: string;
  interactive?: boolean;
}

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ id, className = "w-24 h-24", interactive = true }) => {
  const hoverClass = interactive ? "transition-all duration-300 hover:scale-108 group-hover:scale-105" : "";

  const styles = (
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes float-astronaut {
        0% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-5px) rotate(1.5deg); }
        100% { transform: translateY(0px) rotate(0deg); }
      }
      @keyframes pulse-headphones {
        0%, 100% { filter: drop-shadow(0 0 2px rgba(99, 102, 241, 0.4)); opacity: 0.8; }
        50% { filter: drop-shadow(0 0 10px rgba(99, 102, 241, 1)); opacity: 1; }
      }
      @keyframes neon-flicker {
        0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { filter: drop-shadow(0 0 3px rgba(236, 72, 153, 0.4)); opacity: 0.9; }
        20%, 24%, 55% { filter: none; opacity: 0.3; }
      }
      @keyframes bounce-slime {
        0%, 100% { transform: translateY(0) scaleY(1); }
        50% { transform: translateY(-6px) scaleY(0.94); }
      }
      @keyframes scanline-sweep {
        0% { transform: translateY(-20px); }
        100% { transform: translateY(20px); }
      }
      @keyframes twinkle-cosmic {
        0%, 100% { opacity: 0.35; transform: scale(0.9); }
        50% { opacity: 1; transform: scale(1.15); }
      }
      @keyframes cloud-slide {
        0% { transform: translateX(-15px); }
        100% { transform: translateX(15px); }
      }
      @keyframes wince-cheeks {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
      }
      @keyframes pixel-blink {
        0%, 94%, 100% { transform: scaleY(1); }
        95%, 99% { transform: scaleY(0.1); }
      }
      .avatar-astronaut { animation: float-astronaut 4s ease-in-out infinite; }
      .avatar-headphones { animation: pulse-headphones 2.2s infinite; }
      .avatar-visor { animation: neon-flicker 3s infinite; }
      .avatar-slime { animation: bounce-slime 2.5s ease-in-out infinite; }
      .avatar-pixel-eye { animation: pixel-blink 5s steps(1) infinite; }
      .avatar-cloud { animation: cloud-slide 8s ease-in-out infinite alternate; }
    `}} />
  );

  switch (id) {
    case 'anime-boy':
      return (
        <div className={`relative ${className} ${hoverClass} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-blue-600/30 to-indigo-600/40 border border-indigo-400/20`}>
          {styles}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="1" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="0.5" />
            <path d="M25,48 Q15,35 30,22 Q50,12 70,22 Q85,35 75,48" fill="#1E293B" />
            <path d="M32,40 Q32,68 50,71 Q68,68 68,40 Z" fill="#FCE7F3" opacity="0.9" />
            <path d="M25,28 Q32,32 38,25 Q45,36 50,22 Q56,36 62,25 Q68,32 75,28 Q65,14 50,15 Q35,14 25,28" fill="#0F172A" />
            <rect x="34" y="38" width="14" height="6" rx="2" fill="#1E293B" opacity="0.95" />
            <rect x="52" y="38" width="14" height="6" rx="2" fill="#1E293B" opacity="0.95" />
            <line x1="48" y1="41" x2="52" y2="41" stroke="#1E293B" strokeWidth="2.5" />
            <circle cx="41" cy="41" r="1.5" fill="#facc15" />
            <circle cx="59" cy="41" r="1.5" fill="#facc15" />
            <path d="M47,56 Q50,58 53,56" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M25,45 C25,20 75,20 75,45" fill="none" stroke="#6366F1" strokeWidth="5.5" strokeLinecap="round" className="avatar-headphones" />
            <rect x="20" y="40" width="8" height="15" rx="4" fill="#312E81" className="avatar-headphones" style={{animationDelay: '0.1s'}} />
            <circle cx="24" cy="47" r="2.5" fill="#818CF8" />
            <rect x="72" y="40" width="8" height="15" rx="4" fill="#312E81" className="avatar-headphones" style={{animationDelay: '0.1s'}} />
            <circle cx="76" cy="47" r="2.5" fill="#818CF8" />
            <path d="M28,78 Q50,68 72,78 L78,100 L22,100 Z" fill="#312E81" />
            <path d="M43,73 L57,73 L50,85 Z" fill="#EF4444" />
            <line x1="50" y1="85" x2="50" y2="100" stroke="#0F172A" strokeWidth="3" />
          </svg>
        </div>
      );
    
    case 'anime-girl':
      return (
        <div className={`relative ${className} ${hoverClass} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-pink-500/25 to-rose-500/30 border border-pink-400/20`}>
          {styles}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M15,22 Q12,18 15,15 Q18,18 15,22" fill="#F43F5E" className="avatar-slime" style={{animationDuration: '2.8s'}} />
            <path d="M85,25 Q82,21 85,18 Q88,21 85,25" fill="#F43F5E" className="avatar-slime" style={{animationDuration: '3.1s'}} />
            <circle cx="50" cy="50" r="39" fill="#9333EA" />
            <circle cx="25" cy="22" r="11" fill="#7E22CE" className="avatar-slime" style={{animationDuration: '2s'}} />
            <circle cx="75" cy="22" r="11" fill="#7E22CE" className="avatar-slime" style={{animationDuration: '2s', animationDelay: '0.3s'}} />
            <path d="M33,44 Q33,67 50,71 Q67,67 67,44 Z" fill="#FEE2E2" />
            <ellipse cx="41" cy="48" rx="4" ry="5.5" fill="#1E1B4B" />
            <ellipse cx="59" cy="48" rx="4" ry="5.5" fill="#1E1B4B" />
            <circle cx="42" cy="46" r="1.8" fill="#FFFFFF" className="animate-pulse" />
            <circle cx="60" cy="46" r="1.8" fill="#FFFFFF" className="animate-pulse" />
            <circle cx="39.5" cy="50" r="1" fill="#FFFFFF" />
            <circle cx="57.5" cy="50" r="1" fill="#FFFFFF" />
            <ellipse cx="37" cy="54" rx="4" ry="2" fill="#F43F5E" className="avatar-cloud" style={{animationDuration: '1.2s'}} />
            <ellipse cx="63" cy="54" rx="4" ry="2" fill="#F43F5E" className="avatar-cloud" style={{animationDuration: '1.2s'}} />
            <path d="M22,35 C30,30 40,38 50,28 C60,38 70,30 78,35 C82,50 80,72 80,72 C80,72 73,42 66,45 C56,48 50,38 50,38 C50,38 44,48 34,45 C27,42 20,72 20,72 C20,72 18,50 22,35 Z" fill="#7E22CE" />
            <path d="M47,59 Q50,62 53,59" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M35,82 Q50,71 65,82 L75,100 L25,100 Z" fill="#EC4899" />
            <circle cx="50" cy="85" r="4" fill="#FEE2E2" className="animate-ping" style={{animationDuration: '2.5s'}} />
            <circle cx="50" cy="85" r="3" fill="#FACC15" />
          </svg>
        </div>
      );

    case 'cyberpunk-anime':
      return (
        <div className={`relative ${className} ${hoverClass} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-fuchsia-600/35 to-cyan-500/25 border border-fuchsia-500/20`}>
          {styles}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(236,72,153,0.15)" strokeWidth="0.8" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(6,182,212,0.15)" strokeWidth="0.8" />
            <path d="M12,45 L25,12 L38,25 L50,5 L62,25 L75,12 L88,45 L78,58 L22,58 Z" fill="#111827" />
            <path d="M18,32 L25,18 L34,28 L50,12 L66,28 L75,18 L82,32" fill="none" stroke="#EC4899" strokeWidth="1.5" className="avatar-visor" />
            <path d="M30,42 Q30,69 50,72 Q70,69 70,42 Z" fill="#FEE2E2" />
            <path d="M26,38 L74,38 L68,52 L32,52 Z" fill="#F43F5E" className="avatar-visor" />
            <line x1="26" y1="45" x2="74" y2="45" stroke="#FFFFFF" strokeWidth="2.5" className="avatar-visor" style={{animationDuration: '0.8s'}} />
            <line x1="28" y1="42" x2="72" y2="42" stroke="#22D3EE" strokeWidth="1" className="avatar-visor" style={{animationDuration: '2s'}} />
            <rect x="33" y="58" width="6" height="1.5" fill="#06B6D4" />
            <rect x="61" y="58" width="6" height="1.5" fill="#06B6D4" />
            <path d="M26,79 L74,79 L82,100 L18,100 Z" fill="#1F2937" stroke="#06B6D4" strokeWidth="2" />
            <rect x="42" y="85" width="16" height="5" rx="2" fill="#E11D48" className="animate-pulse" />
          </svg>
        </div>
      );

    case 'pixel-character':
      return (
        <div className={`relative ${className} ${hoverClass} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-amber-500/25 to-orange-600/30 border border-amber-400/25`}>
          {styles}
          <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect x="0" y="0" width="16" height="16" fill="rgba(245,158,11,0.08)" />
            <rect x="3" y="1" width="10" height="6" fill="#1C1917" />
            <rect x="2" y="3" width="12" height="4" fill="#1C1917" />
            <rect x="4" y="4" width="8" height="8" fill="#FFEDD5" />
            <rect x="3" y="6" width="10" height="4" fill="#FFEDD5" />
            <rect x="3" y="5" width="1" height="3" fill="#1C1917" />
            <rect x="12" y="5" width="1" height="3" fill="#1C1917" />
            <rect x="5" y="6" width="2" height="2" fill="#2563EB" className="avatar-pixel-eye" />
            <rect x="9" y="6" width="2" height="2" fill="#2563EB" className="avatar-pixel-eye" />
            <rect x="4" y="8" width="1" height="1" fill="#EF4444" />
            <rect x="11" y="8" width="1" height="1" fill="#EF4444" />
            <rect x="7" y="9" width="2" height="1" fill="#78350F" />
            <rect x="4" y="11" width="8" height="3" fill="#DC2626" />
            <rect x="3" y="12" width="10" height="2" fill="#B91C1C" />
            <rect x="6" y="13" width="4" height="3" fill="#EF4444" className="avatar-slime" />
          </svg>
        </div>
      );

    case 'chibi-character':
      return (
        <div className={`relative ${className} ${hoverClass} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-purple-500/25 to-pink-500/25 border border-purple-400/20`}>
          {styles}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="2" strokeDasharray="4 8" />
            <circle cx="50" cy="46" r="32" fill="#F43F5E" />
            <circle cx="50" cy="55" r="23" fill="#FFEDD5" />
            <ellipse cx="42" cy="54" rx="4.5" ry="5.5" fill="#4C1D95" />
            <ellipse cx="58" cy="54" rx="4.5" ry="5.5" fill="#4C1D95" />
            <circle cx="43.5" cy="51.5" r="2" fill="#FFFFFF" />
            <circle cx="59.5" cy="51.5" r="2" fill="#FFFFFF" />
            <circle cx="41" cy="56" r="1.1" fill="#FFFFFF" />
            <circle cx="57" cy="56" r="1.1" fill="#FFFFFF" />
            <path d="M46,63 C46,63 50,68 54,63 Z" fill="#BE123C" stroke="#881337" strokeWidth="1" />
            <ellipse cx="36" cy="58.5" rx="3.5" ry="2" fill="#EC4899" className="animate-pulse" />
            <ellipse cx="64" cy="58.5" rx="3.5" ry="2" fill="#EC4899" className="animate-pulse" />
            <path d="M24,42 C30,34 40,40 50,30 C60,40 70,34 76,42 C78,48 77,54 77,54 C77,54 62,40 50,42 C38,40 23,54 23,54 C23,54 22,48 24,42 Z" fill="#E11D48" />
            <rect x="44" y="27" width="12" height="4" rx="1.5" fill="#FBBF24" className="avatar-slime" />
            <circle cx="50" cy="29" r="3.5" fill="#D97706" />
            <path d="M38,76 Q50,71 62,76 L66,100 L34,100 Z" fill="#C084FC" />
          </svg>
        </div>
      );

    case 'hacker-avatar':
      return (
        <div className={`relative ${className} ${hoverClass} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-zinc-900 to-black border border-emerald-500/25`}>
          {styles}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <g opacity="0.32" stroke="#10B981" strokeWidth="0.8" strokeLinecap="round">
              <line x1="20" y1="10" x2="20" y2="90" strokeDasharray="3 7" className="avatar-visor" style={{animationDuration: '3s'}} />
              <line x1="40" y1="20" x2="40" y2="80" strokeDasharray="1 5" className="avatar-visor" style={{animationDuration: '4.5s'}} />
              <line x1="60" y1="15" x2="60" y2="85" strokeDasharray="2 6" className="avatar-visor" style={{animationDuration: '3.5s'}} />
              <line x1="80" y1="25" x2="80" y2="75" strokeDasharray="4 8" className="avatar-visor" style={{animationDuration: '5.2s'}} />
            </g>
            <path d="M16,70 C16,30 30,10 50,10 C70,10 84,30 84,70 C84,85 75,100 75,100 L25,100 C25,100 16,85 16,70 Z" fill="#18181B" stroke="#10B981" strokeWidth="1.5" />
            <path d="M26,71 C26,41 34,22 50,22 C66,22 74,41 74,71 L70,100 L30,100 Z" fill="#09090B" />
            <g className="avatar-headphones" style={{animationDuration: '1.8s'}}>
              <ellipse cx="41" cy="51" rx="4" ry="5.5" fill="#34D399" />
              <ellipse cx="59" cy="51" rx="4" ry="5.5" fill="#34D399" />
              <circle cx="41" cy="51" r="1.5" fill="#FFFFFF" />
              <circle cx="59" cy="51" r="1.5" fill="#FFFFFF" />
              <polygon points="50,56 48,59 52,59" fill="#10B981" />
              <line x1="44" y1="64" x2="56" y2="64" stroke="#10B981" strokeWidth="2.1" />
              <line x1="47" y1="61" x2="47" y2="67" stroke="#10B981" strokeWidth="1.5" />
              <line x1="50" y1="61" x2="50" y2="67" stroke="#10B981" strokeWidth="1.5" />
              <line x1="53" y1="61" x2="53" y2="67" stroke="#10B981" strokeWidth="1.5" />
            </g>
            <path d="M30,86 L70,86 L76,100 L24,100 Z" fill="#27272A" />
            <line x1="50" y1="86" x2="50" y2="100" stroke="#10B981" strokeWidth="1.5" />
          </svg>
        </div>
      );

    case 'minimal-neon':
      return (
        <div className={`relative ${className} ${hoverClass} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-600/35 border border-cyan-400/20`}>
          {styles}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="41" fill="none" stroke="#22D3EE" strokeWidth="0.8" strokeDasharray="3 15" className="animate-spin" style={{animationDuration: '24s'}} />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="50 15" className="animate-spin" style={{animationDuration: '16s', animationDirection: 'reverse'}} />
            <circle cx="50" cy="50" r="16" fill="url(#neonCoreGrad)" className="avatar-headphones" style={{animationDuration: '3s'}} />
            <ellipse cx="50" cy="50" rx="26" ry="6" fill="none" stroke="#EC4899" strokeWidth="2.5" transform="rotate(-30 50 50)" className="avatar-slime" />
            <ellipse cx="50" cy="50" rx="26" ry="6" fill="none" stroke="#FFFFFF" strokeWidth="1" transform="rotate(-30 50 50)" className="avatar-slime" style={{animationDelay: '1s'}} />
            <circle cx="30" cy="38" r="2.5" fill="#22D3EE" className="avatar-visor" />
            <circle cx="70" cy="62" r="2.5" fill="#22D3EE" className="avatar-visor" />
            <circle cx="68" cy="32" r="1.5" fill="#EC4899" className="avatar-astronaut" />
            <defs>
              <radialGradient id="neonCoreGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#4F46E5" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      );

    case 'japanese-anime':
      return (
        <div className={`relative ${className} ${hoverClass} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-rose-500/15 to-orange-500/20 border border-orange-400/25`}>
          {styles}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="41" fill="#FEE2E2" />
            <path d="M50,9 L50,50 L30,12 Z" fill="#FECDD3" opacity="0.4" />
            <path d="M50,9 L50,50 L70,12 Z" fill="#FECDD3" opacity="0.4" />
            <path d="M9,50 L50,50 L12,30 Z" fill="#FECDD3" opacity="0.4" />
            <path d="M9,50 L50,50 L12,70 Z" fill="#FECDD3" opacity="0.4" />
            <path d="M91,50 L50,50 L88,30 Z" fill="#FECDD3" opacity="0.4" />
            <path d="M91,50 L50,50 L88,70 Z" fill="#FECDD3" opacity="0.4" />
            <circle cx="50" cy="50" r="26" fill="#EF4444" opacity="0.9" />
            <path d="M12,48 C16,42 26,45 30,48 C34,42 42,42 46,48 L46,55 L12,55 Z" fill="#FFFFFF" opacity="0.75" className="avatar-cloud" />
            <path d="M34,43 Q34,66 50,69 Q66,66 66,43 Z" fill="#FFFBEB" />
            <path d="M26,30 Q30,22 50,22 Q70,22 74,30 Q78,54 78,54 L22,54 Q22,54 22,30" fill="#292524" />
            <polygon points="26,24 16,36 34,31" fill="#D97706" className="avatar-slime" />
            <polygon points="74,24 84,36 66,31" fill="#D97706" className="avatar-slime" />
            <polygon points="24,27 19,33 30,31" fill="#FEE2E2" />
            <polygon points="76,27 81,33 70,31" fill="#FEE2E2" />
            <circle cx="42" cy="45" r="2" fill="#292524" />
            <circle cx="58" cy="45" r="2" fill="#292524" />
            <line x1="36" y1="49" x2="39" y2="52" stroke="#EF4444" strokeWidth="1.5" />
            <line x1="64" y1="49" x2="61" y2="52" stroke="#EF4444" strokeWidth="1.5" />
            <path d="M48,52 Q50,54 52,52" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M30,73 L70,73 L78,100 L22,100 Z" fill="#F59E0B" />
            <path d="M43,73 L50,86 L57,73 Z" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'cute-mascot':
      return (
        <div className={`relative ${className} ${hoverClass} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-yellow-300 to-amber-500/25 border border-yellow-400/20`}>
          {styles}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="22" cy="24" r="1.5" fill="#38BDF8" className="avatar-slime" />
            <rect x="76" y="20" width="3" height="3" fill="#6EE7B7" transform="rotate(45 76 20)" className="avatar-slime" style={{animationDelay: '1s'}} />
            <ellipse cx="50" cy="55" rx="30" ry="24" fill="#FBBF24" className="avatar-slime" />
            <ellipse cx="32" cy="59" rx="4" ry="2" fill="#F59E0B" opacity="0.7" />
            <ellipse cx="68" cy="59" rx="4" ry="2" fill="#F59E0B" opacity="0.7" />
            <ellipse cx="38" cy="52" rx="3" ry="4.5" fill="#1E1B4B" />
            <circle cx="39" cy="50" r="1.3" fill="#FFFFFF" />
            <path d="M58,54 Q63,48 68,54" fill="none" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" className="avatar-slime" style={{animationDuration: '1s'}} />
            <circle cx="50" cy="60" r="4.5" fill="#991B1B" />
            <path d="M47,59 Q50,56 53,59" fill="#F97316" />
            <path d="M18,52 C18,18 82,18 82,52" fill="none" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" className="avatar-slime" />
            <rect x="12" y="44" width="8" height="15" rx="3.5" fill="#DC2626" />
            <rect x="80" y="44" width="8" height="15" rx="3.5" fill="#DC2626" />
          </svg>
        </div>
      );

    case 'space-explorer':
    default:
      return (
        <div className={`relative ${className} ${hoverClass} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-violet-600/35 to-indigo-900/40 border border-violet-500/20`}>
          {styles}
          <svg viewBox="0 0 100 100" className="w-full h-full avatar-astronaut">
            <path d="M22,18 L24,18 M23,17 L23,19" stroke="#67E8F9" strokeWidth="1" className="twinkle-cosmic" />
            <path d="M78,24 L80,24 M79,23 L79,25" stroke="#F472B6" strokeWidth="1" className="twinkle-cosmic" style={{animationDelay: '1.2s'}} />
            <path d="M30,36 L31,36" stroke="#FFFFFF" strokeWidth="1" className="twinkle-cosmic" style={{animationDelay: '0.6s'}} />
            <path d="M72,12 L73,12" stroke="#FFFFFF" strokeWidth="1" className="twinkle-cosmic" style={{animationDelay: '1.8s'}} />
            <rect x="25" y="30" width="50" height="42" rx="20" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
            <rect x="30" y="34" width="40" height="28" rx="14" fill="#0F172A" stroke="#22D3EE" strokeWidth="2.5" />
            <circle cx="42" cy="42" r="1.5" fill="#A78BFA" className="animate-ping" style={{animationDuration: '3s'}} />
            <ellipse cx="58" cy="46" rx="6" ry="1.5" fill="#F43F5E" transform="rotate(-15 58 46)" />
            <ellipse cx="58" cy="46" rx="4" ry="1" fill="#FFFFFF" transform="rotate(-15 58 46)" />
            <path d="M34,42 Q40,36 50,38" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <circle cx="25" cy="51" r="4.5" fill="#64748B" />
            <circle cx="75" cy="51" r="4.5" fill="#64748B" />
            <circle cx="25" cy="51" r="2.5" fill="#22D3EE" className="animate-pulse" />
            <circle cx="75" cy="51" r="2.5" fill="#22D3EE" className="animate-pulse" />
            <path d="M22,76 L78,76 L86,101 L14,101 Z" fill="#F1F5F9" />
            <rect x="42" y="81" width="16" height="12" rx="2.5" fill="#EC4899" />
            <circle cx="46" cy="87" r="1.5" fill="#FFFFFF" />
            <circle cx="50" cy="87" r="1.5" fill="#22D3EE" />
            <circle cx="54" cy="87" r="1.5" fill="#FBBF24" />
          </svg>
        </div>
      );
  }
};
