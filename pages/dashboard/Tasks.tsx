import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Trash2, Calendar, Clock, Loader2, ListTodo, Flame, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Task, PriorityLevel, TaskChecklistItem } from '../../types';
import { taskService } from '../../services/taskService';
import { CustomDatePicker } from '../../components/CustomDatePicker';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddMode, setIsAddMode] = useState(false);
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('neonotex_theme') || 'minimal-white');

  // Add Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>('none');
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    if (isAddMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddMode]);

  useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(localStorage.getItem('neonotex_theme') || 'minimal-white');
    };
    window.addEventListener('neonotex_theme_changed', handleThemeChange);
    return () => window.removeEventListener('neonotex_theme_changed', handleThemeChange);
  }, []);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await taskService.getAll();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
    
    try {
      await taskService.update(id, { completed: !currentStatus });
    } catch(e) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: currentStatus } : t));
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await taskService.delete(id);
    } catch(e) {
      loadTasks(); // reload
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    setIsDeploying(true);
    try {
      const added = await taskService.create({
        title: newTaskTitle.trim(),
        dueDate: newTaskDueDate || undefined,
        priority: newTaskPriority,
        category: 'Personal'
      });
      setTasks([added, ...tasks]);
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setNewTaskPriority('none');
      setIsAddMode(false);
    } catch(e) {
      console.error(e);
    } finally {
      setIsDeploying(false);
    }
  };

  // Grouping logic
  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
  
  // Categorize exactly as requested
  const groups = {
    today: tasks.filter(t => t.dueDate && t.dueDate.startsWith(todayDateStr)),
    tomorrow: tasks.filter(t => t.dueDate && t.dueDate.startsWith(tomorrowDateStr)),
    upcoming: tasks.filter(t => t.dueDate && t.dueDate > tomorrowDateStr),
    someday: tasks.filter(t => !t.dueDate)
  };

  const completedTodayCount = tasks.filter(t => t.completed && t.updatedAt.startsWith(todayDateStr)).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const renderTask = (task: Task) => {
    const isDark = activeTheme === 'midnight-black';
    
    return (
      <motion.div
        key={task.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`group relative flex flex-col p-4 rounded-2xl mb-2 transition-all duration-300 border ${
          task.completed ? (isDark ? 'bg-[#111111]/50 border-transparent opacity-60' : 'bg-slate-50 border-transparent opacity-60') :
          isDark ? 'bg-[#1A1A1A] border-white/5 hover:bg-[#222]' : 'bg-white border-slate-200 hover:shadow-subtle'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 w-full min-w-0">
            {/* Checkbox */}
            <button
              onClick={(e) => handleToggleTask(task.id, task.completed, e)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
                task.completed 
                  ? `${activeTheme === 'sakura-pink' ? 'bg-[#D81B60] border-[#D81B60]' : isDark ? 'bg-[#F7C948] border-[#F7C948]' : 'bg-black border-black'}` 
                  : `${isDark ? 'border-white/20 hover:border-white/50' : 'border-slate-300 hover:border-black'}`
              }`}
            >
              {task.completed && <Check size={14} className={isDark && activeTheme !== 'sakura-pink' ? 'text-black' : 'text-white'} />}
            </button>
            
            <div className={`flex flex-col min-w-0 flex-1 transition-all duration-300 ${task.completed ? 'line-through' : ''}`}>
              <span className={`text-[15px] font-medium truncate flex items-center gap-2 ${
                task.completed ? 'text-slate-400' : isDark ? 'text-white' : 'text-zinc-900'
              }`}>
                {task.title}
              </span>
            </div>
          </div>

          {/* Priority & Delete */}
          <div className="flex items-center gap-3 shrink-0 ml-4">
            {task.priority !== 'none' && !task.completed && (
              <div className={`w-2 h-2 rounded-full ${
                task.priority === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' :
                task.priority === 'medium' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' :
                'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
              }`} />
            )}
            
            <button 
              onClick={(e) => handleDeleteTask(task.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all focus:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGroup = (title: string, groupTasks: Task[]) => {
    if (groupTasks.length === 0) return null;
    return (
      <div className="mb-0">
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}`}>
          {title} <span className="ml-1 opacity-60">({groupTasks.length})</span>
        </h3>
        <AnimatePresence>
          {groupTasks.map(t => renderTask(t))}
        </AnimatePresence>
      </div>
    );
  };

  const isDark = activeTheme === 'midnight-black';

  return (
    <div className={`max-w-4xl mx-auto pb-32 animate-in fade-in duration-500 font-sans`}>
      
      {/* Page Header */}
      <div className="mb-4 px-3 sm:px-2 lg:px-0 mt-0">
        
        {/* Title Block */}
        <div className="px-2 pt-2 pb-4 mb-1 flex items-center justify-between">
           <h1 className={`text-3xl font-extrabold tracking-tight font-sans flex items-center gap-1.5 ${isDark ? 'text-white' : activeTheme === 'sakura-pink' ? 'text-[#D81B60]' : 'text-[#1c1c1e]'}`}>
             Tasks
           </h1>
           <button 
             type="button"
             onClick={() => setIsAddMode(true)} 
             className={`relative z-50 w-[44px] h-[44px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ${
               activeTheme === 'sakura-pink'
                 ? 'bg-gradient-to-r from-[#FF5FA2] to-[#FF8FC7] text-white shadow-[0_4px_15px_rgba(255,95,162,0.4)] hover:shadow-[0_6px_20px_rgba(255,95,162,0.6)]'
                 : isDark 
                   ? 'bg-[#F7C948] text-black shadow-[0_4px_15px_rgba(247,201,72,0.3)] hover:brightness-110' 
                   : 'bg-black text-white hover:bg-slate-900 shadow-md shadow-black/10'
               }`}
           >
             <Plus size={24} strokeWidth={2.5} />
           </button>
        </div>

        {/* Global Progress */}
        <div className={`p-4 md:p-5 rounded-[24px] border ${isDark ? 'bg-[#111111] border-white/5' : activeTheme === 'sakura-pink' ? 'bg-[#FFF5F8] border-[#FFE1EB]' : 'bg-slate-50 border-slate-200'}`}>
           <div className="flex items-center justify-between mb-3">
             <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Progress</span>
             <span className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{completedCount} / {totalCount} Tasks</span>
           </div>
           <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-[#222]' : 'bg-slate-200/60'}`}>
             <motion.div 
               className={`h-full rounded-full transition-all duration-1000 ${
                 activeTheme === 'sakura-pink' ? 'bg-[#D81B60]' : 
                 isDark ? 'bg-gradient-to-r from-[#F7C948] to-[#D4A017]' : 'bg-zinc-900'
               }`}
               initial={{ width: 0 }}
               animate={{ width: `${progressPercent}%` }}
             />
           </div>
        </div>
      </div>

      <div className="px-3 sm:px-2 lg:px-0">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {renderGroup('Today', groups.today)}
            {renderGroup('Tomorrow', groups.tomorrow)}
            {renderGroup('Upcoming', groups.upcoming)}
            {renderGroup('Someday', groups.someday)}
          </div>
        )}
      </div>

      {/* Floating Add Task Modal */}
      {createPortal(
        <AnimatePresence>
          {isAddMode && (
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-6 sm:pt-20">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsAddMode(false)}
                className="absolute inset-0 bg-black/45 backdrop-blur-[12px]"
              />
              <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`relative w-full max-w-lg max-h-[90dvh] sm:max-h-[85vh] flex flex-col overflow-hidden rounded-[28px] shadow-[0_24px_50px_rgba(0,0,0,0.2)] border ${
                isDark ? 'bg-[#111111] border-white/10' : 'bg-white border-slate-200/60'
              }`}
            >
                <form onSubmit={handleAddTask} className="flex flex-col h-full overflow-hidden">
                  <div className="p-6 md:p-8 md:pb-6 overflow-y-auto">
                    <input 
                      autoFocus
                      type="text" 
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onFocus={(e) => {
                        // Smoothly scroll into center when keyboard opens
                        setTimeout(() => {
                           e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                      }}
                      placeholder="What needs to be done?"
                      className={`w-full text-2xl md:text-3xl font-extrabold bg-transparent border-none outline-none placeholder:text-slate-300/60 focus:ring-0 mb-6 ${
                        isDark ? 'text-white placeholder:text-white/20' : 'text-zinc-900'
                      }`}
                    />
                    
                    <div className="mb-2 flex items-center gap-3">
                      <div className={`flex-1 p-3 px-4 rounded-xl flex items-center justify-between border transition-colors ${isDark ? 'bg-[#1A1A1A] border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/50'}`}>
                        <div className={`flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Calendar size={14} /> Due
                        </div>
                        <CustomDatePicker 
                          date={newTaskDueDate} 
                          onChange={setNewTaskDueDate} 
                          isDark={isDark} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`flex gap-3 justify-end p-5 md:p-6 mt-auto shrink-0 ${isDark ? 'bg-[#161616]' : 'bg-slate-50/50'}`}>
                    <button 
                      type="button" 
                      onClick={() => setIsAddMode(false)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-200'
                      }`}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={!newTaskTitle.trim() || isDeploying}
                      className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
                        activeTheme === 'sakura-pink' ? 'bg-[#D81B60] text-white hover:brightness-110 shadow-[0_4px_15px_rgba(216,27,96,0.2)]' :
                        isDark ? 'bg-[#F7C948] text-black hover:brightness-110 shadow-[0_4px_15px_rgba(247,201,72,0.2)]' : 'bg-zinc-900 text-white hover:bg-black shadow-md'
                      }`}
                    >
                      {isDeploying ? <Loader2 size={16} className="animate-spin" /> : 'Create Task'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
