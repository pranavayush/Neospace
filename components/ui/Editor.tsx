import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, X, Wand2, RefreshCw, Loader2, MessageSquare, Zap, SpellCheck, Briefcase, Smile, GraduationCap, Languages, AlignLeft, BookOpen } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

declare const Quill: any;

export const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder, className = '' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Selection state
  const [selectionBounds, setSelectionBounds] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [selectedRange, setSelectedRange] = useState<any>(null);

  // Assistant State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteMode, setRewriteMode] = useState<string | null>(null);
  const [autoCorrect, setAutoCorrect] = useState(false);
  const [aiComment, setAiComment] = useState<string | null>(null);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Start typing...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
            ['link', 'blockquote', 'code-block'],
            ['clean']
          ]
        }
      });

      let timeout: any;
      quillInstance.current.on('text-change', () => {
        const html = quillInstance.current.root.innerHTML;
        onChange(html === '<p><br></p>' ? '' : html);

        // Simple debounce for auto-correct or live analysis could go here
        if (autoCorrect) {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            // we could do a background check, but for now we'll just keep it manual for performance
          }, 2000);
        }
      });
      
      quillInstance.current.on('selection-change', (range: any) => {
        if (range && range.length > 0) {
          const text = quillInstance.current.getText(range.index, range.length);
          // Wait a tick for DOM to settle
          setTimeout(() => {
            if (quillInstance.current) {
               const bounds = quillInstance.current.getBounds(range.index, range.length);
               setSelectedText(text);
               setSelectedRange(range);
               setSelectionBounds(bounds);
            }
          }, 10);
        } else {
          setSelectionBounds(null);
          setSelectedText("");
          setSelectedRange(null);
          setRewriteMode(null);
        }
      });

      if (value) {
         quillInstance.current.root.innerHTML = value;
      }
    }
  }, []);

  const handleRewrite = async (mode: string) => {
    if (!selectedText || !selectedRange) return;
    setIsRewriting(true);
    setRewriteMode(mode);
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, mode })
      });
      const data = await res.json();
      if (data.text) {
        quillInstance.current.deleteText(selectedRange.index, selectedRange.length);
        quillInstance.current.insertText(selectedRange.index, data.text);
        quillInstance.current.setSelection(selectedRange.index, data.text.length);
        
        setAiComment("✨ Nice! I made your writing smoother and easier to understand.");
        setTimeout(() => setAiComment(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRewriting(false);
      setRewriteMode(null);
    }
  };

  const analyzeFullText = async () => {
    setIsAssistantOpen(true);
    setIsAnalyzing(true);
    try {
      const fullText = quillInstance.current.getText();
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText })
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: any) => {
      // Very basic approach: find text and replace it. 
      // In a real app we'd use indices from the backend.
      const fullText = quillInstance.current.getText();
      const idx = fullText.indexOf(suggestion.original);
      if (idx !== -1) {
          quillInstance.current.deleteText(idx, suggestion.original.length);
          quillInstance.current.insertText(idx, suggestion.replacement);
      }
      
      // Remove from list
      setAnalysisResult((prev: any) => ({
          ...prev,
          suggestions: prev.suggestions.filter((s: any) => s.id !== suggestion.id)
      }));
  };

  const rewriteActions = [
      { id: 'improve', icon: Sparkles, label: 'Improve Grammar' },
      { id: 'professional', icon: Briefcase, label: 'Professional' },
      { id: 'casual', icon: Smile, label: 'Casual' },
      { id: 'academic', icon: GraduationCap, label: 'Academic' },
      { id: 'genz', icon: Zap, label: 'Gen Z' },
      { id: 'shorter', icon: AlignLeft, label: 'Make Shorter' },
      { id: 'longer', icon: AlignLeft, label: 'Make Longer' },
      { id: 'simplify', icon: Wand2, label: 'Simplify' },
      { id: 'summarize', icon: BookOpen, label: 'Summarize' },
      { id: 'translate', icon: Languages, label: 'Translate' },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <div className={`prose prose-zinc max-w-none ${className}`}>
        <div ref={editorRef} className="min-h-[400px]" />
      </div>

      {/* Floating Toolbar for Selection */}
      <AnimatePresence>
        {selectionBounds && selectedRange && !isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl p-1.5 flex flex-col gap-1 w-max"
            style={{
               // position near selection, clamping to container width
               top: Math.max(0, selectionBounds.top - 60), 
               left: Math.max(0, Math.min(selectionBounds.left, (containerRef.current?.clientWidth || 500) - 300))
            }}
          >
             <div className="flex flex-wrap items-center gap-1.5 p-1 max-w-[400px]">
                <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center gap-1.5 text-white mr-1 shadow-sm shrink-0">
                   <Sparkles size={14} />
                   <span className="text-[11px] font-bold">NeoBot</span>
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1 shrink-0" />
                {rewriteActions.map(action => (
                    <button
                        key={action.id}
                        onClick={() => handleRewrite(action.id)}
                        disabled={isRewriting}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-slate-200 text-[11px] font-semibold cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                        {isRewriting && rewriteMode === action.id ? <Loader2 size={13} className="animate-spin" /> : <action.icon size={13} />}
                        {action.label}
                    </button>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating NeoBot Badge at Bottom Right */}
      <button
        onClick={analyzeFullText}
        className="absolute bottom-4 right-4 z-40 flex items-center gap-2 bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg px-4 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer group"
      >
         <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-inner">
             <Sparkles size={12} />
         </div>
         <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
            Analyze Writing
         </span>
      </button>

      {/* Assistant Side Panel / Overlay */}
      <AnimatePresence>
        {isAssistantOpen && (
           <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-0 right-0 bottom-0 w-80 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-2xl border-l border-slate-200 dark:border-white/10 shadow-2xl z-50 flex flex-col rounded-r-2xl overflow-hidden"
           >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-900/10">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-white">NeoBot</h3>
                        <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Writing Assistant</p>
                    </div>
                 </div>
                 <button onClick={() => setIsAssistantOpen(false)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400">
                    <X size={16} />
                 </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                 
                 {/* Auto Correct Toggle */}
                 <div className="flex items-center justify-between bg-purple-50/50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30">
                    <div className="flex items-center gap-2">
                        <Wand2 size={14} className="text-purple-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Auto Correct</span>
                    </div>
                    <button
                        onClick={() => setAutoCorrect(!autoCorrect)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 ease-in-out ${autoCorrect ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${autoCorrect ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                 </div>

                 {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500 dark:text-slate-400">
                        <Loader2 size={32} className="animate-spin text-purple-500" />
                        <p className="text-xs font-semibold animate-pulse">Analyzing your writing...</p>
                    </div>
                 ) : analysisResult ? (
                    <>
                       {/* Scores */}
                       <div className="grid grid-cols-2 gap-3">
                           <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                               <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{analysisResult.scores?.grammar || 100}</span>
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Grammar</span>
                           </div>
                           <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                               <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{analysisResult.scores?.spelling || 100}</span>
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Spelling</span>
                           </div>
                           <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                               <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{analysisResult.scores?.clarity || 100}</span>
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Clarity</span>
                           </div>
                           <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                               <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{analysisResult.scores?.readability || 100}</span>
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Readability</span>
                           </div>
                       </div>

                       {/* Suggestions */}
                       <div>
                           <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                               <Wand2 size={14} /> Smart Suggestions
                           </h4>
                           
                           {analysisResult.suggestions && analysisResult.suggestions.length > 0 ? (
                               <div className="space-y-3">
                                   {analysisResult.suggestions.map((s: any, idx: number) => (
                                       <div key={idx} className="bg-white dark:bg-[#161616] border border-purple-100 dark:border-purple-900/30 shadow-sm rounded-xl p-3 flex flex-col gap-2">
                                          <div className="flex items-start justify-between gap-2">
                                              <span className="text-xs font-semibold text-rose-500 line-through bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded">{s.original}</span>
                                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-full">{s.type}</span>
                                          </div>
                                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                              <Check size={14} /> {s.replacement}
                                          </div>
                                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                              {s.reason}
                                          </p>
                                          <button 
                                            onClick={() => applySuggestion(s)}
                                            className="mt-1 w-full bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 text-xs font-bold py-2 rounded-lg transition-colors shadow-sm"
                                          >
                                              Apply Fix
                                          </button>
                                       </div>
                                   ))}
                               </div>
                           ) : (
                               <div className="text-center py-8">
                                   <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
                                       <Check size={24} />
                                   </div>
                                   <p className="text-sm font-bold text-slate-800 dark:text-white">Looking good!</p>
                                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No major issues found in your text.</p>
                               </div>
                           )}
                       </div>
                    </>
                 ) : (
                    <div className="text-center py-10 flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-3xl rotate-3 flex items-center justify-center">
                            <BotIcon size={32} className="text-slate-400" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">Hi, I'm NeoBot.</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                            Drop your notes here and I'll help you write like a pro. ✨
                        </p>
                        <button onClick={analyzeFullText} className="mt-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95">
                            Analyze Note Now
                        </button>
                    </div>
                 )}
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* AI Comment Toast */}
      <AnimatePresence>
        {aiComment && (
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute bottom-16 right-4 z-50 bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 dark:border-white/20"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="text-white" />
                </div>
                <p className="text-xs font-bold leading-tight pr-2">
                    {aiComment}
                </p>
                <button onClick={() => setAiComment(null)} className="text-slate-400 hover:text-white dark:hover:text-black">
                    <X size={14} />
                </button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper for the empty state
function BotIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
