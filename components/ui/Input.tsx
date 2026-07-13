import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  rightElement?: React.ReactNode;
  theme?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, icon: Icon, rightElement, className = '', theme, ...props }) => {
  const isDark = theme === 'midnight-black';

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className={`ml-1 block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500/80'}`}>
          {label}
        </label>
      )}
      <div className="relative group transition-transform duration-300 ease-out focus-within:scale-[1.01] focus-within:-translate-y-0.5">
        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 pointer-events-none ${isDark ? 'text-slate-500 group-focus-within:text-white' : 'text-slate-400 group-focus-within:text-slate-900'}`}>
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
        <input
          className={`w-full rounded-2xl border px-5 py-4 text-[15px] font-medium shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-xl focus:outline-none focus:ring-4 ${
            isDark 
              ? 'bg-[#1C1C1E] border-white/10 text-white placeholder:text-slate-500 hover:bg-[#2C2C2E] hover:border-white/20 focus:border-white/30 focus:bg-[#2C2C2E] focus:ring-white/10' 
              : 'bg-white/50 border-slate-200/60 text-slate-900 placeholder:text-slate-400/80 hover:bg-white/80 hover:border-slate-300/60 hover:shadow-md focus:border-slate-800/30 focus:bg-white focus:ring-slate-900/10'
          } ${Icon ? 'pl-11' : ''} ${rightElement ? 'pr-12' : ''} ${error ? (isDark ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : 'border-red-500 focus:border-red-500 focus:ring-red-500/20') : ''} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center">
            {rightElement}
          </div>
        )}
        {/* Inner shadow/highlight for depth */}
        <div className={`absolute inset-0 rounded-2xl ring-1 ring-inset pointer-events-none ${isDark ? 'ring-white/5' : 'ring-black/5'}`} />
      </div>
      {error && <p className={`mt-1.5 text-xs font-medium ml-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>{error}</p>}
    </div>
  );
};