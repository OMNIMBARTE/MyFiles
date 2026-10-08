import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import { FilesystemEntry, IconSize } from '../../../types/filesystem';
import { useExplorerStore } from '../../../store/useExplorerStore';
import * as api from '../../../services/api';

interface FileCardProps {
  entry: FilesystemEntry;
  iconSize: IconSize;
  onContextMenu: (e: React.MouseEvent, entry: FilesystemEntry) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ entry, iconSize, onContextMenu }) => {
  const { state, selectItem } = useExplorerStore();
  const [imgError, setImgError] = useState(false);
  const isSelected = state.selectedItem?.path === entry.path;

  const isImage = entry.category === 'image' && !imgError;
  const isVideo = entry.category === 'video';
  const isCode = entry.category === 'code';

  const sizeClasses: Record<IconSize, { card: string; icon: string; text: string }> = {
    tiny: { card: 'p-2.5', icon: 'w-12 h-12', text: 'text-[11px]' },
    small: { card: 'p-3.5', icon: 'w-16 h-16', text: 'text-xs' },
    medium: { card: 'p-5', icon: 'w-20 h-20', text: 'text-sm' },
    large: { card: 'p-6', icon: 'w-28 h-28', text: 'text-base' },
    huge: { card: 'p-8', icon: 'w-36 h-36', text: 'text-lg font-medium' },
  };

  const currentSize = sizeClasses[iconSize] || sizeClasses.medium;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ path: entry.path, type: 'file' }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDoubleClick = () => {
    api.openItemInOS(entry.path);
  };

  const rawUrl = api.getFileRawUrl(entry.path);

  return (
    <motion.div
      draggable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onDragStart={handleDragStart as any}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => selectItem(entry)}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => onContextMenu(e, entry)}
      className={`group relative flex flex-col items-center justify-between rounded-xl border cursor-pointer select-none transition-all duration-200 text-center ${
        currentSize.card
      } ${
        isSelected
          ? 'bg-theme-active border-theme-accent shadow-glow ring-1 ring-theme-accent/50'
          : 'bg-theme-card/60 hover:bg-theme-card/90 border-theme-border hover:border-theme-border-highlight'
      }`}
    >
      {/* File Visual or Image Thumbnail */}
      <div className="relative my-auto flex items-center justify-center w-full">
        {isImage ? (
          <div className="w-full h-24 sm:h-28 rounded-lg overflow-hidden bg-theme-base/80 border border-theme-border/60 flex items-center justify-center relative shadow-inner">
            <img
              src={rawUrl}
              alt={entry.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white/90 uppercase">
              {entry.extension.replace('.', '') || 'IMG'}
            </span>
          </div>
        ) : (
          <div className={`${currentSize.icon} transition-transform duration-300 group-hover:scale-110 filter drop-shadow-[0_0_12px_var(--color-glow)] relative`}>
            <img
              src={entry.resourceIcon || '/api/resources/unknown.png'}
              alt={entry.name}
              className="w-full h-full object-contain pointer-events-none"
              loading="lazy"
            />
            {isCode && (
              <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-theme-accent text-[8px] font-mono text-white font-bold uppercase shadow-sm">
                {entry.extension.replace('.', '') || 'CODE'}
              </span>
            )}
            {isVideo && (
              <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-rose-500 text-[8px] font-mono text-white font-bold uppercase shadow-sm">
                VID
              </span>
            )}
          </div>
        )}
      </div>

      {/* File Details */}
      <div className="w-full mt-2 space-y-0.5">
        <span
          className={`block font-medium text-theme-text group-hover:text-theme-accent transition-colors truncate ${currentSize.text}`}
          title={entry.name}
        >
          {entry.name}
        </span>
        <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-theme-muted">
          <span>{entry.formattedSize}</span>
          <span>•</span>
          <span className="uppercase">{entry.extension.replace('.', '') || 'FILE'}</span>
        </div>
      </div>

      {/* Quick context action indicator */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(e, entry);
        }}
        className="absolute top-1.5 right-1.5 p-1 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-hover opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
