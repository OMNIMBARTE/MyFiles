import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Star,
} from 'lucide-react';

import { FilesystemEntry } from '../../types/filesystem';
import { useExplorerStore } from '../../store/useExplorerStore';
import * as api from '../../services/api';

interface ContextMenuProps {
  x: number;
  y: number;
  item: FilesystemEntry | null;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, item, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { navigateTo, openModal, selectItem, toggleFavorite, togglePreview, state } = useExplorerStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleScroll = () => onClose();

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  if (!item) return null;

  // Adjust positioning to stay within viewport
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 280);

  const handleOpen = () => {
    if (item.isDirectory) {
      navigateTo(item.path);
    } else {
      api.openItemInOS(item.path);
    }
    onClose();
  };

  const handlePreview = () => {
    selectItem(item);
    togglePreview(true);
    onClose();
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(item.path);
    onClose();
  };

  const isFavorite = state.favorites.includes(item.path);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ top: adjustedY, left: adjustedX }}
      className="fixed z-50 w-52 rounded-xl border border-theme-border bg-theme-surface/95 backdrop-blur-2xl shadow-2xl p-1.5 space-y-0.5 select-none font-mono text-xs text-theme-text"
    >
      <div className="px-2.5 py-1.5 border-b border-theme-border/60 text-[10px] text-theme-muted truncate">
        {item.name}
      </div>

      <button
        onClick={handleOpen}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-theme-text hover:bg-theme-hover hover:text-theme-accent transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5 text-theme-accent" />
        <span>{item.isDirectory ? 'Explore Folder' : 'Open with OS'}</span>
      </button>

      <button
        onClick={handlePreview}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-theme-text hover:bg-theme-hover hover:text-theme-accent transition-colors"
      >
        <Eye className="w-3.5 h-3.5 text-theme-muted" />
        <span>Inspector / Preview</span>
      </button>

      {item.isDirectory && (
        <button
          onClick={() => {
            toggleFavorite(item.path);
            onClose();
          }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-theme-text hover:bg-theme-hover transition-colors"
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-amber-400 fill-amber-400' : 'text-theme-muted'}`} />
          <span>{isFavorite ? 'Unpin Favorite' : 'Pin to Favorites'}</span>
        </button>
      )}

      <button
        onClick={handleCopyPath}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-theme-text hover:bg-theme-hover transition-colors"
      >
        <Copy className="w-3.5 h-3.5 text-theme-muted" />
        <span>Copy Path</span>
      </button>

      <div className="border-t border-theme-border/40 my-1" />

      <button
        onClick={() => {
          openModal('rename', item);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-theme-text hover:bg-theme-hover transition-colors"
      >
        <Edit3 className="w-3.5 h-3.5 text-theme-muted" />
        <span>Rename</span>
      </button>

      <button
        onClick={() => {
          openModal('confirm-delete', item);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
        <span>Delete</span>
      </button>
    </motion.div>
  );
};
