import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Link as LinkIcon, Search, Trash2, Image as ImageIcon, FileText, Youtube, BookOpen, Lightbulb, Box } from 'lucide-react';
import { CollectionItem } from '../../types';
import { collectionService } from '../../services/collectionService';
import { storageService } from '../../services/storageService';
import { supabase } from '../../supabaseClient';
import { Button } from '../../components/ui/Button';

import { CollectionForm } from './CollectionForm';
import { CollectionItemCard } from './CollectionItemCard';

export const Collections: React.FC = () => {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<CollectionItem | null>(null);

  useEffect(() => {
    if (showAddItem || itemToEdit || itemToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddItem, itemToEdit, itemToDelete]);

  const fetchItems = async () => {
    const data = await collectionService.getAllItems();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();

    const fetchUserAndSubscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const channel = supabase
        .channel(`collections_changes_${Date.now()}_${Math.random()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${user.id}` },
          (payload) => {
            fetchItems();
          }
        )
        .subscribe();
        
      return channel;
    };
    
    let subChannel: any = null;
    fetchUserAndSubscribe().then(ch => { subChannel = ch; });

    return () => {
      if (subChannel) {
        supabase.removeChannel(subChannel);
      }
    };
  }, []);

  const [isUploading, setIsUploading] = useState(false);

  const handleAddItem = async (formData: any, type: string) => {
    // Determine title based on type
    let title = formData.title || '';
    if (type === 'youtube' && !title) title = formData.url || 'Unknown Video';
    if (type === 'website') title = formData.title || formData.url || 'Unknown Website';
    if (type === 'product') title = formData.title || formData.url || 'Unknown Product';
    if (type === 'book') title = formData.title || 'Unknown Book';
    if (type === 'course') title = formData.title || 'Unknown Course';
    if (type === 'idea') title = formData.title || 'New Idea';
    if (type === 'image' || type === 'pdf') title = formData.title || (formData.fileData instanceof File ? formData.fileData.name : 'Untitled File');

    if (!title.trim() && !formData.url && !formData.fileData) return;

    setIsUploading(true);
    let finalFileData = formData.fileData;

    try {
      if (formData.fileData instanceof File) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const uploadedPath = await storageService.uploadFile(formData.fileData, user.id, 'collections');
          finalFileData = uploadedPath;
        }
      }

      const tags = formData.tags ? (typeof formData.tags === 'string' ? formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : formData.tags) : [];
      
      const requestData = {
        title,
        url: formData.url,
        type: type,
        notes: formData.notes,
        tags,
        metadata: { ...formData, fileData: finalFileData }
      };

      if (itemToEdit) {
        await collectionService.updateItem(itemToEdit.id, requestData);
        setItemToEdit(null);
      } else {
        await collectionService.createItem({
          collectionId: 'default',
          ...requestData
        });
        setShowAddItem(false);
      }
      
      fetchItems();
    } catch (error) {
      console.error('Error saving collection item:', error);
      alert('Failed to save item. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const startEditItem = (item: CollectionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToEdit(item);
  };

  const handleDeleteItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItemToDelete(id);
  };

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      await collectionService.deleteItem(itemToDelete);
      fetchItems();
      setItemToDelete(null);
    }
  };

  const handleToggleFavorite = async (item: CollectionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await collectionService.updateItem(item.id, { isFavorite: !item.isFavorite });
    fetchItems();
  };

  const handleTogglePin = async (item: CollectionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await collectionService.updateItem(item.id, { isPinned: !item.isPinned });
    fetchItems();
  };

  const filteredItems = items.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          i.url?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Youtube size={16} className="text-red-500" />;
      case 'website': return <LinkIcon size={16} className="text-blue-500" />;
      case 'image': return <ImageIcon size={16} className="text-purple-500" />;
      case 'pdf': return <FileText size={16} className="text-rose-500" />;
      case 'book': return <BookOpen size={16} className="text-amber-500" />;
      case 'product': return <Box size={16} className="text-emerald-500" />;
      case 'course': return <BookOpen size={16} className="text-indigo-500" />;
      case 'idea': return <Lightbulb size={16} className="text-yellow-500" />;
      default: return <LinkIcon size={16} />;
    }
  };

  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('neonotex_theme') || 'minimal-white';
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(localStorage.getItem('neonotex_theme') || 'minimal-white');
    };
    window.addEventListener('neonotex_theme_changed', handleThemeChange);
    return () => window.removeEventListener('neonotex_theme_changed', handleThemeChange);
  }, []);

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4 mb-8 mt-4">
        <div>
          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>
            Your Collections
          </h1>
        </div>
        <button 
           type="button"
           onClick={() => setShowAddItem(true)}
           className={`relative z-50 w-[44px] h-[44px] shrink-0 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ${
             activeTheme === 'sakura-pink'
               ? 'bg-gradient-to-r from-[#FF5FA2] to-[#FF8FC7] text-white shadow-[0_4px_15px_rgba(255,95,162,0.4)] hover:shadow-[0_6px_20px_rgba(255,95,162,0.6)]'
               : activeTheme === 'midnight-black'
                  ? 'bg-[#F7C948] text-black shadow-[0_4px_15px_rgba(247,201,72,0.3)] hover:brightness-110'
                  : 'bg-black text-white hover:bg-slate-900 shadow-md shadow-black/10'
             }`}
         >
           <Plus size={24} strokeWidth={2.5} />
         </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className={`flex-1 flex items-center border rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 transition-all ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5 focus-within:ring-white/10' : 'bg-white border-[#ECECEC] ring-black/5'}`}>
            <Search size={18} className="text-slate-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 outline-none text-sm font-medium bg-transparent ${activeTheme === 'midnight-black' ? 'text-white placeholder:text-slate-500' : 'text-slate-900'}`}
            />
          </div>
        </div>

        {/* Items View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {filteredItems.map(item => (
            <CollectionItemCard 
              key={item.id} 
              item={item} 
              onDelete={handleDeleteItem} 
              onEdit={startEditItem}
              onToggleFavorite={handleToggleFavorite}
              onTogglePin={handleTogglePin}
              activeTheme={activeTheme}
            />
          ))}
          
          {filteredItems.length === 0 && (
             <div className={`col-span-full py-20 text-center border border-dashed rounded-[20px] ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E]/40 border-white/10' : 'bg-white/40 border-[#ECECEC]'}`}>
                <p className={`text-sm font-bold ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>Library is empty</p>
                <p className={`text-[11px] font-semibold mt-1 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>Add items to get started.</p>
             </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddItem && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <CollectionForm onAdd={handleAddItem} onCancel={() => setShowAddItem(false)} activeTheme={activeTheme} />
        </div>,
        document.body
      )}

      {/* Edit Item Modal */}
      {itemToEdit && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <CollectionForm onAdd={handleAddItem} onCancel={() => setItemToEdit(null)} initialData={itemToEdit} activeTheme={activeTheme} />
        </div>,
        document.body
      )}

      {/* Delete Item Modal */}
      {itemToDelete && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className={`rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 border ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/5' : 'bg-white border-[#ECECEC]'}`}>
            <h3 className={`text-xl font-extrabold mb-2 ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>Delete Item</h3>
            <p className={`text-sm font-semibold mb-6 ${activeTheme === 'midnight-black' ? 'text-slate-400' : 'text-slate-500'}`}>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={() => setItemToDelete(null)} variant="outline" className={`flex-1 rounded-xl py-3 ${activeTheme === 'midnight-black' ? 'border-white/10 hover:bg-[#111111] hover:text-white text-slate-300' : 'border-[#ECECEC]'}`}>Cancel</Button>
              <Button onClick={confirmDeleteItem} className={`flex-1 rounded-xl py-3 text-white border-0 shadow-md ${activeTheme === 'midnight-black' ? 'bg-red-500 hover:bg-red-600 text-black' : 'bg-red-600 hover:bg-red-700'}`}>Delete</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
