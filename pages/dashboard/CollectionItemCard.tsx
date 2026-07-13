import React from 'react';
import { Trash2, Star, Pin, ExternalLink, Image as ImageIcon, Link as LinkIcon, Youtube, FileText, BookOpen, Box, Lightbulb, Pencil } from 'lucide-react';
import { CollectionItem } from '../../types';
import { StorageImage } from '../../components/ui/StorageImage';

interface CollectionItemCardProps {
  item: CollectionItem;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onEdit: (item: CollectionItem, e: React.MouseEvent) => void;
  onToggleFavorite: (item: CollectionItem, e: React.MouseEvent) => void;
  onTogglePin: (item: CollectionItem, e: React.MouseEvent) => void;
  activeTheme?: string;
}

export const CollectionItemCard: React.FC<CollectionItemCardProps> = ({ item, onDelete, onEdit, onToggleFavorite, onTogglePin, activeTheme = 'minimal-white' }) => {
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

  const getThumbnailSrc = () => {
    if (item.type === 'youtube' && item.url) {
      const match = item.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
      }
    }
    if ((item.type === 'image' || item.type === 'pdf') && item.metadata?.fileData) {
      return item.metadata.fileData;
    }
    if (item.type === 'book' && item.metadata?.coverImage) {
      return item.metadata.coverImage;
    }
    return null;
  };

  const handleCardClick = async () => {
    if (item.url) {
      window.open(item.url, '_blank');
    } else if (item.metadata?.fileData) {
      let fileUrl = item.metadata.fileData;
      if (!fileUrl.startsWith('http') && !fileUrl.startsWith('data:')) {
        // Needs signed URL
        const { storageService } = await import('../../services/storageService');
        fileUrl = await storageService.getSignedUrl(fileUrl);
      }
      const newWindow = window.open();
      if (newWindow) {
        const html = `<html><body style="margin:0; display:flex; justify-content:center; align-items:center; background:#0f172a;"><${item.type === 'image' ? 'img' : 'iframe'} src="${fileUrl}" style="max-width:100%; max-height:100vh; ${item.type === 'pdf' ? 'width:100vw; height:100vh; border:none;' : ''}" /></body></html>`;
        newWindow.document.write(html);
      }
    }
  };

  const thumbUrl = getThumbnailSrc();

  return (
    <div 
      onClick={handleCardClick}
      className={`rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col relative cursor-pointer border ${activeTheme === 'midnight-black' ? 'bg-[#161616] border-white/5' : 'bg-white border-[#ECECEC]'} ${item.isPinned ? (activeTheme === 'midnight-black' ? 'border-[#F7C948] shadow-md ring-1 ring-[#F7C948]' : 'border-blue-400 shadow-md ring-1 ring-blue-400') : ''}`}
    >
      
      {/* Top right actions overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={(e) => onToggleFavorite(item, e)} className={`p-1.5 backdrop-blur-sm rounded-lg shadow-sm border cursor-pointer transition-colors ${activeTheme === 'midnight-black' ? 'bg-[#111111]/80 border-white/10 hover:bg-[#1C1C1E] text-white' : 'bg-white/90 border-slate-200 hover:bg-slate-100 text-slate-700'}`}>
          <Star size={14} className={item.isFavorite ? (activeTheme === 'midnight-black' ? 'fill-[#F7C948] text-[#F7C948]' : 'fill-yellow-400 text-yellow-400') : ''} />
        </button>
        <button onClick={(e) => onTogglePin(item, e)} className={`p-1.5 backdrop-blur-sm rounded-lg shadow-sm border cursor-pointer transition-colors ${activeTheme === 'midnight-black' ? 'bg-[#111111]/80 border-white/10 hover:bg-[#1C1C1E] text-white' : 'bg-white/90 border-slate-200 hover:bg-slate-100 text-slate-700'}`}>
          <Pin size={14} className={item.isPinned ? (activeTheme === 'midnight-black' ? 'fill-[#F7C948] text-[#F7C948]' : 'fill-blue-500 text-blue-500') : ''} />
        </button>
      </div>

      {thumbUrl && (
        <div className={`w-full h-40 overflow-hidden relative ${activeTheme === 'midnight-black' ? 'bg-[#111111]' : 'bg-slate-100'}`}>
          {thumbUrl.startsWith('data:') || thumbUrl.startsWith('http') ? (
            <img src={thumbUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <StorageImage path={thumbUrl} alt={item.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col pt-4">
        <div className="flex items-center gap-3 mb-3">
          {!thumbUrl && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${activeTheme === 'midnight-black' ? 'bg-[#111111] border-white/5' : 'bg-slate-50 border-[#ECECEC]'}`}>
              {getTypeIcon(item.type)}
            </div>
          )}
          {thumbUrl && (
             <div className="flex items-center justify-center">
               {getTypeIcon(item.type)}
             </div>
          )}
          <div className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md ${activeTheme === 'midnight-black' ? 'text-slate-400 bg-[#111111]' : 'text-slate-400 bg-slate-50'}`}>
            {item.type}
          </div>
          {item.metadata?.price && (
            <div className="text-[10px] font-bold tracking-widest text-emerald-600 px-2 py-1 bg-emerald-50 rounded-md">
              {item.metadata.price}
            </div>
          )}
          {item.metadata?.rating && (
            <div className="text-[10px] font-bold tracking-widest text-amber-600 px-2 py-1 bg-amber-50 rounded-md">
               ★ {item.metadata.rating}
            </div>
          )}
          {item.metadata?.priority && (
            <div className="text-[10px] font-bold tracking-widest text-red-500 px-2 py-1 bg-red-50 border border-red-100 rounded-md">
              {item.metadata.priority.toUpperCase()}
            </div>
          )}
        </div>
        
        <h4 className={`font-bold text-base leading-snug mb-2 line-clamp-2 pr-4 ${activeTheme === 'midnight-black' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
        
        {(item.notes || item.metadata?.description) && (
          <p className={`text-xs line-clamp-2 mt-1 mb-3 ${activeTheme === 'midnight-black' ? 'text-[#8E8E93]' : 'text-slate-500'}`}>
            {item.notes || item.metadata?.description}
          </p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.tags.map((tag: string, i: number) => (
              <span key={i} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto"></div>
        {item.url && (
           <a href={item.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 line-clamp-1 break-all mt-3 self-start">
             <ExternalLink size={12} /> {item.metadata?.websiteName || item.metadata?.platform || new URL(item.url).hostname || item.url}
           </a>
        )}
      </div>

      <div className={`px-5 py-3 flex items-center justify-between border-t ${activeTheme === 'midnight-black' ? 'bg-[#1C1C1E] border-white/5' : 'bg-slate-50/50 border-[#ECECEC]'}`}>
        <span className={`text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 ${activeTheme === 'midnight-black' ? 'text-slate-500' : 'text-slate-400'}`}>
          {item.isPinned && <Pin size={10} className={activeTheme === 'midnight-black' ? 'text-[#F7C948] fill-[#F7C948]' : 'text-blue-500 fill-blue-500'} />}
          {item.isFavorite && <Star size={10} className={activeTheme === 'midnight-black' ? 'text-[#F7C948] fill-[#F7C948]' : 'text-yellow-400 fill-yellow-400'} />}
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
             onClick={(e) => onEdit(item, e)}
             className={`transition-all cursor-pointer p-1 ${activeTheme === 'midnight-black' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-blue-600'}`}
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={(e) => onDelete(item.id, e)}
            className={`transition-all cursor-pointer p-1 ${activeTheme === 'midnight-black' ? 'text-slate-500 hover:text-rose-400' : 'text-slate-400 hover:text-rose-500'}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
