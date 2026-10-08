import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import { FilesystemEntry, IconSize } from '../../../types/filesystem';
import { useExplorerStore } from '../../../store/useExplorerStore';
import * as api from '../../../services/api';

interface FolderCardProps {
  entry: FilesystemEntry;
  iconSize: IconSize;
  onContextMenu: (e: React.MouseEvent, entry: FilesystemEntry) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ entry, iconSize, onContextMenu }) => {
  const { state, navigateTo, selectItem, refresh } = useExplorerStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const isSelected = state.selectedItem?.path === entry.path;

  const sizeClasses: Record<IconSize, { card: string; icon: string; text: string }> = {
    tiny: { card: 'p-2.5', icon: 'w-12 h-12', text: 'text-[11px]' },
    small: { card: 'p-3.5', icon: 'w-16 h-16', text: 'text-xs' },
    medium: { card: 'p-5', icon: 'w-20 h-20', text: 'text-sm' },
    large: { card: 'p-6', icon: 'w-28 h-28', text: 'text-base' },
    huge: { card: 'p-8', icon: 'w-36 h-36', text: 'text-lg font-medium' },
  };

  const currentSize = sizeClasses[iconSize] || sizeClasses.medium;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ path: entry.path, type: 'folder' }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.path && data.path !== entry.path) {
        const result = await api.moveItem(data.path, entry.path);
        if (result.success) {
          refresh();
        } else {
          alert(`Move failed: ${result.error}`);
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <motion.div
      draggable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onDragStart={handleDragStart as any}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => selectItem(entry)}
      onDoubleClick={() => navigateTo(entry.path)}
      onContextMenu={(e) => onContextMenu(e, entry)}
      className={`group relative flex flex-col items-center justify-between rounded-xl border cursor-pointer select-none transition-all duration-200 text-center ${
        currentSize.card
      } ${
        isSelected
          ? 'bg-theme-active border-theme-accent shadow-glow ring-1 ring-theme-accent/50'
          : isDragOver
          ? 'bg-theme-accent-subtle/60 border-theme-accent ring-2 ring-theme-accent'
          : 'bg-theme-card/60 hover:bg-theme-card/90 border-theme-border hover:border-theme-border-highlight'
      }`}
    >
      {/* Folder Visual Icon */}
      <div className="relative my-auto flex items-center justify-center">
        <div className={`${currentSize.icon} transition-transform duration-300 group-hover:scale-110 filter drop-shadow-[0_0_12px_var(--color-glow)]`}>
          <img
            src={entry.resourceIcon || '/api/resources/unknown.png'}
            alt={entry.name}
            className="w-full h-full object-contain pointer-events-none"
            loading="lazy"
          />
        </div>
      </div>

      {/* Folder Info */}
      <div className="w-full mt-2.5 space-y-0.5">
        <span className={`block font-semibold text-theme-text group-hover:text-theme-accent transition-colors truncate ${currentSize.text}`} title={entry.name}>
          {entry.name}
        </span>
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-theme-muted">
          <span>{entry.childCount !== undefined ? `${entry.childCount} items` : 'Folder'}</span>
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
