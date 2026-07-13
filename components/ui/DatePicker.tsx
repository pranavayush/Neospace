import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  theme?: string;
  label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, theme, label, className = '', ...props }) => {
  const isDark = theme === 'midnight-black' || theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  
  const initialDate = value ? new Date(value + 'T12:00:00') : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? initialDate : null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T12:00:00');
      setSelectedDate(d);
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [value]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    const yr = newDate.getFullYear();
    const mo = String(newDate.getMonth() + 1).padStart(2, '0');
    const da = String(newDate.getDate()).padStart(2, '0');
    onChange(`${yr}-${mo}-${da}`);
    setIsOpen(false);
  };

  const handleSubmit = () => {
    if (selectedDate) {
      const yr = selectedDate.getFullYear();
      const mo = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const da = String(selectedDate.getDate()).padStart(2, '0');
      onChange(`${yr}-${mo}-${da}`);
    }
    setIsOpen(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const displayDateStr = selectedDate 
    ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
    : 'Select date';

  return (
    <div className={`w-full space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className={`ml-1 block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500/80'}`}>
          {label}
        </label>
      )}
      
      <div 
        className="relative group transition-transform duration-300 ease-out focus-within:scale-[1.01] focus-within:-translate-y-0.5 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 pointer-events-none ${isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>
          <CalendarIcon size={18} strokeWidth={2} />
        </div>
        
        <div className={`w-full rounded-2xl border px-5 py-4 pl-11 text-[15px] font-medium shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 ${
          isDark 
            ? 'bg-[#1C1C1E] border-white/10 text-white placeholder:text-slate-500 hover:bg-[#2C2C2E] hover:border-white/20' 
            : 'bg-white/50 border-slate-200/60 text-slate-900 placeholder:text-slate-400/80 hover:bg-white/80 hover:border-slate-300/60 hover:shadow-md'
        } ${isOpen ? (isDark ? 'border-white/30 bg-[#2C2C2E] ring-4 ring-white/10' : 'border-slate-800/30 bg-white ring-4 ring-slate-900/10') : ''}`}>
          {displayDateStr}
        </div>
        
        {/* Inner shadow/highlight for depth */}
        <div className={`absolute inset-0 rounded-2xl ring-1 ring-inset pointer-events-none ${isDark ? 'ring-white/5' : 'ring-black/5'}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`absolute inset-0 backdrop-blur-md ${isDark ? 'bg-black/40' : 'bg-slate-900/20'}`}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`relative z-10 p-5 rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border ${
                isDark 
                  ? 'bg-[#121212] border-white/10' 
                  : 'bg-white border-slate-100'
              } w-[340px] max-w-full`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={handlePrevMonth}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className={`text-lg flex items-center justify-center transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <div className="relative group mx-0.5">
                    <select
                      value={currentMonth.getMonth()}
                      onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))}
                      className={`appearance-none bg-transparent font-bold cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 rounded pl-2 pr-5 py-1 ${isDark ? '[color-scheme:dark]' : ''} relative z-10`}
                    >
                      {monthNames.map((m, i) => <option key={i} value={i} className={isDark ? 'bg-[#1C1C1E] text-white' : 'bg-white text-slate-900'}>{m}</option>)}
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                  </div>
                  
                  <div className="relative group mx-0.5">
                    <select
                      value={currentMonth.getFullYear()}
                      onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))}
                      className={`appearance-none bg-transparent font-medium opacity-90 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 rounded pl-2 pr-5 py-1 ${isDark ? '[color-scheme:dark]' : ''} relative z-10`}
                    >
                      {Array.from({ length: 120 }).map((_, i) => {
                        const year = new Date().getFullYear() - 100 + i;
                        return <option key={year} value={year} className={isDark ? 'bg-[#1C1C1E] text-white' : 'bg-white text-slate-900'}>{year}</option>;
                      })}
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                  </div>
                </div>

                <button 
                  onClick={handleNextMonth}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Days of week */}
              <div className={`grid grid-cols-7 gap-1 mb-2 text-center text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {weekDays.map(day => <div key={day}>{day}</div>)}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-[42px] h-[42px]" />
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
                  const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth() && selectedDate?.getFullYear() === currentMonth.getFullYear();
                  return (
                    <div key={`day-${day}`} className="relative flex flex-col items-center justify-start h-[46px]">
                      <button
                        onClick={() => handleDateClick(day)}
                        className={`w-[42px] h-[42px] rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          isSelected 
                            ? (theme === 'sakura-pink' ? 'bg-[#FF5FA2] text-white shadow-md' : 'bg-indigo-500 text-white shadow-md')
                            : isToday
                              ? (isDark ? 'bg-[#1C1C1E] border border-white/20 text-indigo-400' : 'bg-slate-50 border border-slate-200 text-indigo-600')
                              : (isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100')
                        }`}
                      >
                        {day}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className={`mt-6 pt-4 border-t flex items-center justify-between ${
                isDark ? 'border-white/10' : 'border-slate-100'
              }`}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
                    isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
                    theme === 'sakura-pink' ? 'text-[#FF5FA2] hover:bg-[#FF5FA2]/10' : 'text-indigo-500 hover:bg-indigo-500/10'
                  }`}
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
