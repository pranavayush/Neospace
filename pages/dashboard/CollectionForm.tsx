import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';

const CONTENT_TYPES = [
  { value: 'youtube', label: 'YouTube URL', icon: '🎥' },
  { value: 'website', label: 'Website URL', icon: '🌐' },
  { value: 'product', label: 'Product URL', icon: '🛍️' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'book', label: 'Book', icon: '📚' },
  { value: 'course', label: 'Course', icon: '🎓' },
  { value: 'idea', label: 'Idea', icon: '💡' },
];

interface CollectionFormProps {
  onAdd: (data: any, type: string) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  activeTheme?: string;
}

interface FormFieldProps {
  label: string;
  field: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  value: any;
  onChange: (field: string, value: any) => void;
  activeTheme?: string;
}

export const ThemeContext = React.createContext('minimal-white');

const Input: React.FC<FormFieldProps> = ({ label, field, type = "text", required = false, placeholder = "", value, onChange, activeTheme: propTheme }) => {
  const activeTheme = propTheme || React.useContext(ThemeContext);
  return (
  <div className="flex flex-col">
    <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
    <input 
      type={type} 
      required={required}
      value={value || ''}
      onChange={(e) => onChange(field, e.target.value)}
      className={`w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/10 text-white focus:border-white/20' : 'bg-slate-50/50 border-slate-200 text-slate-900 focus:border-slate-400 focus:bg-white'}`}
      placeholder={placeholder}
    />
  </div>
)};

interface FileInputProps {
  label: string;
  field: string;
  accept: string;
  required?: boolean;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  activeTheme?: string;
}

const FileInput: React.FC<FileInputProps> = ({ label, field, accept, required = false, value, onChange, activeTheme: propTheme }) => {
  const activeTheme = propTheme || React.useContext(ThemeContext);
  return (
  <div className="flex flex-col">
    <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
    <input 
      type="file" 
      required={required && !value}
      accept={accept}
      onChange={(e) => onChange(e, field)}
      className={`w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/10 text-white file:bg-white/10 file:text-white hover:file:bg-white/20' : 'bg-slate-50/50 border-slate-200 text-slate-900 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200'}`}
    />
  </div>
)};

const Textarea: React.FC<FormFieldProps> = ({ label, field, placeholder = "", className = "", value, onChange, activeTheme: propTheme }) => {
  const activeTheme = propTheme || React.useContext(ThemeContext);
  return (
  <div className={`flex flex-col ${className}`}>
    <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
    <textarea 
      value={value || ''}
      onChange={(e) => onChange(field, e.target.value)}
      className={`w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all min-h-[120px] shadow-sm resize-y ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/10 text-white focus:border-white/20' : 'bg-slate-50/50 border-slate-200 text-slate-900 focus:border-slate-400 focus:bg-white'}`}
      placeholder={placeholder}
    />
  </div>
)};

export const CollectionForm: React.FC<CollectionFormProps> = ({ onAdd, onCancel, initialData, activeTheme = 'minimal-white' }) => {
  const [type, setType] = useState(initialData?.type || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if ((event.target as Element).closest('.mobile-content-portal')) {
          return;
        }
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [formData, setFormData] = useState<Record<string, any>>(initialData ? {
    title: initialData.title,
    url: initialData.url,
    notes: initialData.notes,
    tags: initialData.tags?.join(', '),
    ...initialData.metadata
  } : {});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange(field, file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;
    await onAdd(formData, type);
  };

  return (
    <ThemeContext.Provider value={activeTheme}>
    <div className={`rounded-2xl md:rounded-[24px] w-full max-w-3xl flex flex-col max-h-full md:max-h-[85vh] shadow-2xl animate-in fade-in zoom-in-95 duration-300 pointer-events-auto border overflow-hidden ${activeTheme === 'midnight-black' ? 'bg-[#161616] border-white/5' : 'bg-white border-slate-100'}`}>
      <div className={`flex justify-between items-center p-5 md:p-8 border-b shrink-0 ${activeTheme === 'midnight-black' ? 'border-white/5' : 'border-slate-100'}`}>
        <h3 className={`text-xl md:text-2xl font-extrabold tracking-tight ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>{initialData ? 'Edit Resource' : 'Add Library Resource'}</h3>
        <button type="button" onClick={onCancel} className={`transition-colors p-2 -mr-2 rounded-full ${activeTheme === 'midnight-black' ? 'text-slate-400 hover:text-white hover:bg-[#111111]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div className="overflow-y-auto w-full shrink flex-1 min-h-0 p-5 md:p-8 custom-scrollbar">
        <form id="resource-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col">
            <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>Content Type</label>
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => !initialData && setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full border-2 rounded-xl px-4 py-3.5 text-sm font-bold flex justify-between items-center transition-all shadow-sm ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} ${isDropdownOpen ? (activeTheme === 'midnight-black' ? 'border-white/30' : 'border-slate-400') : ''} ${initialData ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-2">
                  {type ? (
                    <>
                      <span>{CONTENT_TYPES.find(t => t.value === type)?.icon}</span>
                      <span>{CONTENT_TYPES.find(t => t.value === type)?.label}</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Select Content Type</span>
                  )}
                </div>
                <div className={`transition-transform duration-200 text-slate-500 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              
              <AnimatePresence>
                {isDropdownOpen && !initialData && (
                  <>
                    {/* Desktop Dropdown */}
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`hidden md:block absolute z-50 mt-2 w-full rounded-[16px] border p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-slate-100'}`}
                    >
                      <div className="flex flex-col">
                        {CONTENT_TYPES.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => {
                              setType(option.value);
                              setFormData({});
                              setIsDropdownOpen(false);
                            }}
                            className={`flex items-center gap-3 px-3 py-3 rounded-[12px] cursor-pointer font-medium text-[15px] transition-colors ${type === option.value ? (activeTheme === 'midnight-black' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900') : (activeTheme === 'midnight-black' ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}`}
                          >
                            <span className="text-xl">{option.icon}</span>
                            <span>{option.label}</span>
                            {type === option.value && (
                              <div className="ml-auto text-indigo-500">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Mobile Bottom Sheet */}
                    {<div className="md:hidden mobile-content-portal">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`fixed inset-0 z-[10000] ${activeTheme === 'midnight-black' ? 'bg-black/60' : 'bg-slate-900/40'} backdrop-blur-sm`}
                        />
                        <motion.div
                          initial={{ y: '100%' }}
                          animate={{ y: 0 }}
                          exit={{ y: '100%' }}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                          className={`fixed bottom-0 left-0 right-0 z-[10001] rounded-t-[24px] p-6 shadow-[0_-20px_60px_rgba(0,0,0,0.15)] pb-10 ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-t border-white/10' : 'bg-white border-t border-slate-100'}`}
                        >
                          <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 ${activeTheme === 'midnight-black' ? 'bg-white/20' : 'bg-slate-200'}`} />
                          <h4 className={`text-xl font-bold mb-5 px-1 ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>Choose Content Type</h4>
                          <div className="flex flex-col gap-1 overflow-y-auto max-h-[60vh] custom-scrollbar px-1 pb-2">
                            {CONTENT_TYPES.map((option) => (
                              <div
                                key={option.value}
                                onClick={() => {
                                  setType(option.value);
                                  setFormData({});
                                  setIsDropdownOpen(false);
                                }}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-[16px] cursor-pointer font-semibold text-[16px] transition-colors ${type === option.value ? (activeTheme === 'midnight-black' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900') : (activeTheme === 'midnight-black' ? 'text-slate-300 hover:bg-white/5 active:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100 hover:text-slate-900')}`}
                              >
                                <span className="text-2xl">{option.icon}</span>
                                <span>{option.label}</span>
                                {type === option.value && (
                                  <div className="ml-auto text-indigo-500">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </div>}
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {!type && (
            <div className={`min-h-[350px] py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed transition-all duration-300 hover:bg-opacity-50 ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E]/40 border-white/10 hover:bg-[#1C1C1E]/60' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'}`}>
              <div className="relative w-16 h-16 mb-6 group cursor-default">
                <div className={`absolute top-0 right-0 w-10 h-10 rounded-xl shadow-lg transition-transform duration-500 group-hover:rotate-12 group-hover:translate-x-2 group-hover:-translate-y-2 ${activeTheme === 'midnight-black' ? 'bg-indigo-500/80' : 'bg-indigo-500'}`}></div>
                <div className={`absolute bottom-0 left-4 w-10 h-10 rounded-xl shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:-translate-x-2 group-hover:translate-y-2 ${activeTheme === 'midnight-black' ? 'bg-rose-500/80' : 'bg-rose-500'}`}></div>
                <div className={`absolute top-2 left-0 w-10 h-10 rounded-xl shadow-lg transition-transform duration-500 group-hover:-rotate-12 group-hover:-translate-x-4 ${activeTheme === 'midnight-black' ? 'bg-emerald-500/80' : 'bg-emerald-500'} backdrop-blur-sm mix-blend-multiply`}></div>
              </div>
              <h4 className={`text-lg font-bold mb-2 ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>Choose a collection type to continue.</h4>
              <p className={`text-sm font-medium max-w-md ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>Select what kind of resource you want to add to your library to reveal the appropriate fields.</p>
            </div>
          )}

          {type && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className={`p-6 rounded-2xl border shadow-sm mb-8 ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/5' : 'bg-white border-slate-100 shadow-slate-200/20'}`}>
                
                {type === 'youtube' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                       <Input label="YouTube URL *" field="url" type="url" required placeholder="https://youtube.com/watch?v=..." value={formData["url"]} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2">
                      <Input label="Title" field="title" placeholder="Video Title" value={formData["title"]} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2">
                      <Input label="Tags" field="tags" placeholder="tutorial, design, code (comma separated)" value={formData["tags"]} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2">
                      <Textarea label="Personal Notes" field="notes" placeholder="What were your key takeaways from this video?" value={formData["notes"]} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {type === 'website' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input label="Website URL *" field="url" type="url" required placeholder="https://..." value={formData["url"]} onChange={handleChange} />
                    </div>
                    <Input label="Website Name" field="title" placeholder="Site Name" value={formData["title"]} onChange={handleChange} />
                    <Input label="Tags" field="tags" placeholder="comma separated" value={formData["tags"]} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <Textarea label="Description" field="description" placeholder="Brief description of the website" value={formData["description"]} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2">
                      <Textarea label="Personal Notes" field="notes" placeholder="Why did you save this?" value={formData["notes"]} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {type === 'product' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input label="Product URL *" field="url" type="url" required placeholder="https://..." value={formData["url"]} onChange={handleChange} />
                    </div>
                    <Input label="Product Name" field="title" placeholder="Name of the product" value={formData["title"]} onChange={handleChange} />
                    <Input label="Price" field="price" placeholder="$0.00" value={formData["price"]} onChange={handleChange} />
                    <Input label="Wishlist Status" field="wishlistStatus" placeholder="e.g. Planning to Buy, Purchased" value={formData["wishlistStatus"]} onChange={handleChange} />
                    <Input label="Tags" field="tags" placeholder="comma separated" value={formData["tags"]} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <Textarea label="Personal Notes" field="notes" placeholder="Thoughts on this product..." value={formData["notes"]} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {type === 'image' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <FileInput label="Image Upload *" field="fileData" accept="image/*" required value={formData["fileData"]} onChange={handleFileChange} />
                    </div>
                    <div className="md:col-span-2">
                      <Input label="Title" field="title" placeholder="Image Title" value={formData["title"]} onChange={handleChange} />
                    </div>
                    <Input label="Tags" field="tags" placeholder="comma separated" value={formData["tags"]} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <Textarea label="Description" field="description" placeholder="What is this image about?" value={formData["description"]} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {type === 'pdf' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <FileInput label="PDF Upload *" field="fileData" accept="application/pdf" required value={formData["fileData"]} onChange={handleFileChange} />
                    </div>
                    <div className="md:col-span-2">
                      <Input label="Title" field="title" placeholder="Document Title" value={formData["title"]} onChange={handleChange} />
                    </div>
                    <Input label="Tags" field="tags" placeholder="comma separated" value={formData["tags"]} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <Textarea label="Description" field="description" placeholder="Document abstract or description" value={formData["description"]} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {type === 'book' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input label="Book Name *" field="title" required placeholder="Title of the book" value={formData["title"]} onChange={handleChange} />
                    </div>
                    <Input label="Author" field="author" placeholder="Book author" value={formData["author"]} onChange={handleChange} />
                    <Input label="Cover Image URL" field="coverImage" placeholder="https://..." value={formData["coverImage"]} onChange={handleChange} />
                    <Input label="Reading Status" field="status" placeholder="Reading, Finished, To Read" value={formData["status"]} onChange={handleChange} />
                    <Input label="Rating" field="rating" placeholder="1-5" value={formData["rating"]} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <Textarea label="Personal Notes" field="notes" placeholder="Your review or thoughts..." value={formData["notes"]} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {type === 'course' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input label="Course Name *" field="title" required placeholder="Name of the course" value={formData["title"]} onChange={handleChange} />
                    </div>
                    <Input label="Platform" field="platform" placeholder="Coursera, Udemy, etc." value={formData["platform"]} onChange={handleChange} />
                    <Input label="Course URL" field="url" type="url" placeholder="https://..." value={formData["url"]} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <Input label="Progress Percentage" field="progress" placeholder="e.g. 50%" value={formData["progress"]} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2">
                      <Textarea label="Notes" field="notes" placeholder="Course notes..." value={formData["notes"]} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {type === 'idea' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input label="Idea Title *" field="title" required placeholder="What is your idea?" value={formData["title"]} onChange={handleChange} />
                    </div>
                    <Input label="Category" field="category" placeholder="e.g. Business, App, Writing" value={formData["category"]} onChange={handleChange} />
                    <Input label="Priority" field="priority" placeholder="High, Medium, Low" value={formData["priority"]} onChange={handleChange} />
                    <Input label="Tags" field="tags" placeholder="comma separated" value={formData["tags"]} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <Textarea label="Description" field="description" placeholder="Flesh out the details of your idea here..." value={formData["description"]} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2">
                      <Textarea label="Notes" field="notes" placeholder="Next steps or additional thoughts" value={formData["notes"]} onChange={handleChange} />
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </form>
      </div>

      {type && (
        <div className={`p-5 md:p-8 pt-4 border-t shrink-0 flex items-center justify-end gap-3 z-10 w-full transition-all safe-area-bottom ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E]/50 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
           <Button type="button" variant="outline" className={`flex-1 md:flex-none md:w-32 rounded-xl py-3 font-bold transition-colors ${activeTheme === 'midnight-black' ? 'border-white/10 hover:bg-[#111111] hover:text-white text-slate-300' : 'border-[#ECECEC] text-slate-700 hover:bg-slate-100'}`} onClick={onCancel}>Cancel</Button>
           <Button type="submit" form="resource-form" className={`flex-1 md:flex-none md:w-44 rounded-xl py-3 font-bold border-0 shadow-md hover:shadow-lg transition-all ${activeTheme === 'midnight-black' ? 'bg-[#F7C948] text-white hover:bg-[#D4A017]' : 'bg-slate-900 hover:bg-black text-white'}`} disabled={!type}>{initialData ? 'Save Changes' : 'Add Resource'}</Button>
        </div>
      )}
    </div>
    </ThemeContext.Provider>
  );
};

