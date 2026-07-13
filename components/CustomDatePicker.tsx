import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  date: string;
  onChange: (date: string) => void;
  isDark?: boolean;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ date, onChange, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [tempDate, setTempDate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOpen = () => {
    const initialView = date ? new Date(date) : new Date();
    setViewDate(initialView);
    setTempDate(date || '');
    setIsOpen(true);
  };

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

  const days = [];
  
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false, isPrevMonth: true });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  const remainingSlots = 42 - days.length;
  for (let i = 1; i <= remainingSlots; i++) {
    days.push({ day: i, isCurrentMonth: false, isNextMonth: true });
  }

  const navigateMonth = (direction: number) => {
    setViewDate(new Date(currentYear, currentMonth + direction, 1));
  };

  const handleDayClick = (d: { day: number, isCurrentMonth: boolean, isPrevMonth?: boolean, isNextMonth?: boolean }) => {
    let year = currentYear;
    let month = currentMonth;
    
    if (d.isPrevMonth) {
      if (month === 0) { month = 11; year--; } else month--;
    } else if (d.isNextMonth) {
      if (month === 11) { month = 0; year++; } else month++;
    }
    
    const yy = year;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d.day).padStart(2, '0');
    
    setTempDate(`${yy}-${mm}-${dd}`);
    if (d.isPrevMonth || d.isNextMonth) {
      setViewDate(new Date(year, month, 1));
    }
  };

  const tempDateObj = tempDate ? new Date(tempDate) : null;
  const isSelected = (dayDate: number, isCurr: boolean, isPrev?: boolean, isNext?: boolean) => {
    if (!tempDateObj) return false;
    let m = currentMonth;
    let y = currentYear;
    if (isPrev) { m--; if(m<0){m=11;y--;} }
    if (isNext) { m++; if(m>11){m=0;y++;} }
    return tempDateObj.getDate() === dayDate && tempDateObj.getMonth() === m && tempDateObj.getFullYear() === y;
  };
  
  const today = new Date();
  const isToday = (dayDate: number, isCurr: boolean) => {
    return isCurr && today.getDate() === dayDate && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`bg-transparent outline-none text-sm font-semibold flex justify-end items-center w-full text-right ${
          !date ? (isDark ? 'text-slate-500' : 'text-slate-400') : (isDark ? 'text-white' : 'text-zinc-900')
        }`}
      >
        {date ? new Date(date).toLocaleDateString('en-GB').replace(/\//g, '-') : 'dd-mm-yyyy'}
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              key="date-picker-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            >
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-[380px] bg-[#121212] border border-white/10 rounded-[24px] shadow-[0_20px_80px_rgba(0,0,0,0.6)] p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <button 
                    type="button"
                    onClick={() => navigateMonth(-1)} 
                    className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="text-lg font-bold text-white tracking-wide">
                    {MONTHS[currentMonth]} {currentYear}
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => navigateMonth(1)} 
                    className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 mb-3">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                  {days.map((d, i) => {
                    const selected = isSelected(d.day, d.isCurrentMonth, d.isPrevMonth, d.isNextMonth);
                    const currentDay = isToday(d.day, d.isCurrentMonth);
                    
                    return (
                      <div key={i} className="flex justify-center items-center aspect-square p-0.5">
                        <button
                          type="button"
                          onClick={() => handleDayClick(d)}
                          className={`w-full h-full max-w-[40px] max-h-[40px] flex items-center justify-center rounded-full text-[14px] font-medium transition-all ${
                            selected 
                              ? 'bg-[#F7C948] text-black shadow-[0_0_15px_rgba(247,201,72,0.4)] font-bold' 
                              : currentDay 
                              ? 'border-2 border-white/20 text-white'
                              : !d.isCurrentMonth 
                              ? 'text-slate-600' 
                              : 'text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {d.day}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-[#F7C948] text-black hover:brightness-110 shadow-[0_4px_15px_rgba(247,201,72,0.2)] transition-all"
                  >
                    Select Date
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
