import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager
} from '@floating-ui/react';

interface ColorPickerPopoverProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
  theme: any;
  isDark: boolean;
  showAdvanced?: boolean;
}

const PRESET_COLORS = [
  { hex: '#000000', name: 'Black' },
  { hex: '#ffffff', name: 'White' },
  { hex: '#FFD700', name: 'Gold' },
  { hex: '#007AFF', name: 'Blue' },
  { hex: '#AF52DE', name: 'Purple' },
  { hex: '#FF2D55', name: 'Pink' },
  { hex: '#34C759', name: 'Green' },
  { hex: '#FF3B30', name: 'Red' }
];

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  color,
  onChange,
  label,
  theme,
  isDark,
  showAdvanced = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('neonotex_recent_colors');
    if (saved) {
      try { setRecentColors(JSON.parse(saved)); } catch (e) {}
    }
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { refs, context, x, y, strategy } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [
      offset(16),
      flip({ fallbackAxisSideDirection: 'start' }),
      shift({ padding: 16 })
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' });
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role
  ]);

  const handleColorChange = (newColor: string) => {
    onChange(newColor);
  };
  
  const handleApply = () => {
    if (!recentColors.includes(color)) {
      const updated = [color, ...recentColors].slice(0, 8);
      setRecentColors(updated);
      localStorage.setItem('neonotex_recent_colors', JSON.stringify(updated));
    }
    setIsOpen(false);
  };

  const getColorName = (hex: string) => {
    const preset = PRESET_COLORS.find(p => p.hex.toLowerCase() === hex.toLowerCase());
    if (preset) return preset.name;
    return 'Custom Color';
  };

  const popoverContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
          )}
          
          <motion.div
            ref={refs.setFloating}
            style={isMobile ? {} : {
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: 'max-content'
            }}
            {...getFloatingProps()}
            initial={isMobile ? { opacity: 0, y: 100 } : { opacity: 0, scale: 0.95 }}
            animate={isMobile ? { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } } : { opacity: 1, scale: 1, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } }}
            exit={isMobile ? { opacity: 0, y: 100, transition: { duration: 0.15, ease: "easeOut" } } : { opacity: 0, scale: 1, transition: { duration: 0.15, ease: "easeOut" } }}
            className={`
              ${isMobile 
                 ? 'fixed bottom-0 left-0 right-0 z-[110] rounded-t-[2rem] max-h-[85vh] overflow-y-auto' 
                 : 'z-[110] w-[320px] rounded-[20px]'
              }
              shadow-2xl border 
              ${isDark ? 'bg-[#1C1C1E]/95 border-white/10' : 'bg-white/95 border-slate-200'} 
              backdrop-blur-2xl
            `}
          >
            {isMobile && (
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-4 mb-2" />
            )}
            
            <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <h5 className={`font-black text-lg tracking-tight ${theme.text}`}>{label}</h5>
              <button onClick={() => setIsOpen(false)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 space-y-6">
              <div className="space-y-3">
                <p className={`text-[11px] font-bold uppercase tracking-wider ${theme.subtext}`}>Quick Colors</p>
                <div className="flex gap-3 flex-wrap">
                  {PRESET_COLORS.map(p => (
                    <button 
                      key={p.hex}
                      onClick={() => handleColorChange(p.hex)}
                      title={p.name}
                      className={`w-7 h-7 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${isDark ? 'border-white/10' : 'border-slate-200'} ${color.toLowerCase() === p.hex.toLowerCase() ? 'ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-[#1C1C1E]' : ''}`}
                      style={{ backgroundColor: p.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className={`p-5 border-t flex justify-end gap-3 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <button onClick={() => setIsOpen(false)} className={`px-5 py-2.5 text-sm font-semibold rounded-xl ${isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`}>
                Cancel
              </button>
              <button onClick={handleApply} className="px-5 py-2.5 text-sm font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 transition-colors">
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative flex-1">
      <div 
        ref={refs.setReference}
        {...getReferenceProps()}
        className={`flex items-center gap-4 cursor-pointer group`}
      >
        <div className={`relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 ${theme.inputBorder} shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${isOpen ? 'ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-[#1C1C1E]' : ''}`}>
          <div className="absolute inset-0" style={{ backgroundColor: color }} />
        </div>
        
        {showAdvanced ? (
          <div className="flex-1 max-w-[120px]">
            <input 
              type="text" 
              value={color} 
              onChange={(e) => onChange(e.target.value)}
              className={`w-full bg-transparent border-b-2 ${theme.inputBorder} focus:border-purple-500 outline-none uppercase font-mono text-sm py-1 ${theme.text}`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <div className="flex-1">
             <p className={`text-sm font-semibold ${theme.text}`}>{getColorName(color)}</p>
             <p className={`text-xs mt-0.5 ${theme.subtext}`}>Click to change</p>
          </div>
        )}
      </div>

      <FloatingPortal>
        {isOpen && (
          <FloatingFocusManager context={context} modal={isMobile}>
            {popoverContent}
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </div>
  );
};
