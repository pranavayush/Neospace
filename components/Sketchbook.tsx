import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, Trash2, Check, X, Grip, Sparkles } from 'lucide-react';

interface SketchbookProps {
  onSave: (file: File) => void;
  onClose: () => void;
}

export const Sketchbook: React.FC<SketchbookProps> = ({ onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#1c1c1e'); // iOS default ink (slate-dark)
  const [lineWidth, setLineWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const colors = [
    { value: '#1c1c1e', name: 'Charcoal' },
    { value: '#78716c', name: 'Stone Grey' },
    { value: '#3a86f0', name: 'Sky Blue' },
    { value: '#22c55e', name: 'Forest Green' },
    { value: '#ef4444', name: 'Coral Red' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Line drawing preferences
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
  }, [color, lineWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getEventCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent scrolling or bouncing on touch devices
    if (e.cancelable) e.preventDefault();

    const coords = getEventCoords(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getEventCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for X
    const scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
    
    // Support touch
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    // Convert canvas to Blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create an official File object
        const file = new File([blob], `sketch-${Date.now()}.png`, { type: 'image/png' });
        onSave(file);
      }
    }, 'image/png');
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl rounded-[32px] border border-white/80 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header toolbar */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0 pr-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl border border-yellow-100 shadow-sm shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-950 text-[15px] sm:text-base leading-none truncate">Neonotex Drawing Board</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">Illustrate concepts, diagrams, or sketch your ideas</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Ink Controllers */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-4 bg-white shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Palette size={13} /> Ink CoLoR:
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all cursor-pointer relative flex items-center justify-center shrink-0 ${
                    color === c.value ? 'scale-110 shadow-md' : 'scale-100 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value, borderColor: color === c.value ? '#e2e8f0' : 'transparent' }}
                  title={c.name}
                >
                  {color === c.value && (
                    <span className={`w-2 h-2 rounded-full ${c.value === '#1c1c1e' ? 'bg-white' : 'bg-slate-900/30'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-between w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Line Width:</span>
              <input
                type="range"
                min="2"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-20 sm:w-24 accent-black cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
              />
              <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                {lineWidth}px
              </span>
            </div>

            <button
              onClick={clearCanvas}
              disabled={!hasDrawn}
              className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-500 hover:text-rose-600 p-1.5 sm:p-2 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0"
            >
              <Trash2 size={14} />
              Clear Grid
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-50/50 p-2 sm:p-6 flex items-center justify-center overflow-hidden min-h-[300px] touch-none">
          <canvas
            ref={canvasRef}
            width={650}
            height={380}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="bg-white border border-slate-200 shadow-inner rounded-xl sm:rounded-2xl cursor-crosshair touch-none"
            style={{ width: '100%', maxWidth: '650px', height: 'auto', touchAction: 'none' }}
          />
        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {hasDrawn ? '🎨 Sketch contains active strokes' : '💡 Draw something with your cursor or touch'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasDrawn}
              className="rounded-full bg-black hover:bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={16} strokeWidth={2.5} />
              Insert Drawing
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
