import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  theme?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 40, theme = 'minimal-white' }) => {
  if (theme === 'sakura-pink') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} shrink-0 select-none drop-shadow-[0_4px_12px_rgba(255,95,162,0.35)]`}
      >
        <defs>
          <linearGradient id="petal-grad" x1="50" y1="46" x2="50" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF5FA2" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#FFD6E8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFC8DD" stopOpacity="1" />
          </linearGradient>

          <radialGradient id="pearl-grad" cx="44" cy="44" r="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFD6E8" />
            <stop offset="100%" stopColor="#FF5FA2" />
          </radialGradient>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          <path id="petal" d="M 50,46 C 25,30 35,-5 50,18 C 65,-5 75,30 50,46 Z" />
        </defs>

        {/* Ambient Flower Glow */}
        <circle cx="50" cy="50" r="38" fill="#FFD6E8" opacity="0.3" filter="url(#glow)" />

        <g transform="rotate(45 50 50)">
          {/* Petals Glow Shadows */}
          <use href="#petal" fill="#FF5FA2" opacity="0.25" filter="url(#glow)" transform="translate(0, 2)" />
          <use href="#petal" fill="#FF5FA2" opacity="0.25" filter="url(#glow)" transform="rotate(90 50 50) translate(0, 2)" />
          <use href="#petal" fill="#FF5FA2" opacity="0.25" filter="url(#glow)" transform="rotate(180 50 50) translate(0, 2)" />
          <use href="#petal" fill="#FF5FA2" opacity="0.25" filter="url(#glow)" transform="rotate(270 50 50) translate(0, 2)" />
          
          {/* Main Petals */}
          <use href="#petal" fill="url(#petal-grad)" stroke="#FFFFFF" strokeWidth="1.2" />
          <use href="#petal" fill="url(#petal-grad)" stroke="#FFFFFF" strokeWidth="1.2" transform="rotate(90 50 50)" />
          <use href="#petal" fill="url(#petal-grad)" stroke="#FFFFFF" strokeWidth="1.2" transform="rotate(180 50 50)" />
          <use href="#petal" fill="url(#petal-grad)" stroke="#FFFFFF" strokeWidth="1.2" transform="rotate(270 50 50)" />
          
          {/* Elegant Petal Veins */}
          <path d="M 50,46 L 50,28" stroke="#FF5FA2" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
          <path d="M 50,46 L 50,28" stroke="#FF5FA2" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" transform="rotate(90 50 50)" />
          <path d="M 50,46 L 50,28" stroke="#FF5FA2" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" transform="rotate(180 50 50)" />
          <path d="M 50,46 L 50,28" stroke="#FF5FA2" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" transform="rotate(270 50 50)" />
        </g>

        {/* Pearl Drop Shadow */}
        <circle cx="50" cy="52" r="13" fill="#FF5FA2" opacity="0.25" filter="url(#glow)" />
        
        {/* Center Pearl Glowing Orb */}
        <circle cx="50" cy="50" r="11" fill="url(#pearl-grad)" />
        <circle cx="50" cy="50" r="10.5" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
        
        {/* Tiny Sparkle Accent */}
        <g transform="translate(68, 25) scale(0.6)">
          <path d="M0,10 Q10,10 10,0 Q10,10 20,10 Q10,10 10,20 Q10,10 0,10 Z" fill="#FFFFFF" filter="url(#glow)" opacity="0.8"/>
          <path d="M0,10 Q10,10 10,0 Q10,10 20,10 Q10,10 10,20 Q10,10 0,10 Z" fill="#FFFFFF" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 select-none`}
    >
      {/* Black circle background */}
      <circle cx="50" cy="50" r="48" fill="#000000" />
      
      {/* Left segment of N: vertical stem curving right at top, then diagonal down */}
      <path
        d="M34 62V43C34 33.5 41 31.5 46.5 35.5L62 49.5"
        stroke="#FFFFFF"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Right segment of N: vertical stem curving left at bottom, then diagonal up */}
      <path
        d="M66 38V57C66 66.5 59 68.5 53.5 64.5L38 50.5"
        stroke="#FFFFFF"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
