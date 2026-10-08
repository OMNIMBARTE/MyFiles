import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Edit3,
  Trash2,
  FolderOpen,
  Sparkles,
  Star,
} from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { CodePreview } from './CodePreview';
import * as api from '../../services/api';

export const DetailsDrawer: React.FC = () => {
  const {
    state,
    selectItem,
    navigateTo,
    openModal,
    toggleFavorite,
  } = useExplorerStore();


  const [copied, setCopied] = useState(false);
  const item = state.selectedItem;

  if (!state.isPreviewOpen || !item) {
    return null;
  }

  const isImage = item.category === 'image';
  const isVideo = item.category === 'video';
  const isAudio = item.category === 'audio';
  const isCode = item.category === 'code' || item.extension === '.txt' || item.extension === '.md';
  const isFolder = item.isDirectory;
  const isFavorite = state.favorites.includes(item.path);

  const rawUrl = api.getFileRawUrl(item.path);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(item.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenContaining = () => {
    const parent = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
    navigateTo(parent);
  };

  const formattedModified = new Date(item.modifiedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedCreated = new Date(item.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <aside className="w-80 border-l border-theme-border bg-theme-surface/80 backdrop-blur-2xl flex flex-col justify-between shrink-0 select-none overflow-y-auto no-scrollbar z-20 shadow-2xl">
      <div className="p-5 space-y-5">
        {/* Header: Title and Close */}
        <div className="flex items-center justify-between pb-3 border-b border-theme-border/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-theme-accent" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-theme-text">
              Inspector Matrix
            </h3>
          </div>
          <button
            onClick={() => selectItem(null)}
            className="p-1 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-hover transition-colors"
            title="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Preview Canvas */}
        <div className="rounded-2xl border border-theme-border/70 overflow-hidden bg-theme-base/70 shadow-inner">
          {isImage ? (
            <div className="w-full h-44 bg-black/40 flex items-center justify-center p-2">
              <img
                src={rawUrl}
                alt={item.name}
                className="max-h-full max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          ) : isVideo ? (
            <div className="w-full bg-black/60 p-2">
              <video
                src={rawUrl}
                controls
                className="w-full max-h-44 rounded-lg bg-black object-contain"
              />
            </div>
          ) : isAudio ? (
            <div className="p-4 space-y-3 bg-theme-card/60">
              <div className="w-16 h-16 mx-auto flex items-center justify-center">
                <img src="/api/resources/music.png" alt="" className="w-full h-full object-contain" />
              </div>
              <audio src={rawUrl} controls className="w-full h-8" />
            </div>
          ) : isCode ? (
            <div className="p-2 bg-theme-base">
              <CodePreview filePath={item.path} extension={item.extension} />
            </div>
          ) : (
            <div className="w-full h-36 flex flex-col items-center justify-center p-4 text-center space-y-2">
              <div className="w-16 h-16 flex items-center justify-center">
                <img
                  src={item.resourceIcon || '/api/resources/unknown.png'}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] font-mono text-theme-muted uppercase">
                {isFolder ? 'Folder Sector' : item.category}
              </span>
            </div>
          )}
        </div>

        {/* Item Title & Type Badge */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-bold text-theme-text break-all font-sans leading-tight">
              {item.name}
            </h4>
            {isFolder && (
              <button
                onClick={() => toggleFavorite(item.path)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isFavorite
                    ? 'border-amber-400/50 bg-amber-400/10 text-amber-400'
                    : 'border-theme-border text-theme-muted hover:text-theme-text'
                }`}
                title={isFavorite ? 'Remove Favorite' : 'Star Favorite'}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
              </button>
            )}
          </div>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-theme-accent-subtle text-theme-accent border border-theme-accent/30">
            {isFolder ? 'Directory' : item.extension || 'File'}
          </span>
        </div>

        {/* Metadata Grid */}
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-theme-border/40 text-theme-muted">
            <span>Size:</span>
            <span className="text-theme-text font-semibold">{item.formattedSize}</span>
          </div>

          {item.childCount !== undefined && (
            <div className="flex justify-between py-1 border-b border-theme-border/40 text-theme-muted">
              <span>Children:</span>
              <span className="text-theme-text font-semibold">{item.childCount} items</span>
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-theme-border/40 text-theme-muted">
            <span>Category:</span>
            <span className="text-theme-text capitalize">{item.category}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-theme-border/40 text-theme-muted">
            <span>Modified:</span>
            <span className="text-theme-text">{formattedModified}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-theme-border/40 text-theme-muted">
            <span>Created:</span>
            <span className="text-theme-text">{formattedCreated}</span>
          </div>

          <div className="pt-1">
            <span className="text-[10px] text-theme-muted uppercase tracking-wider block mb-1">
              Filesystem Path:
            </span>
            <div className="p-2 rounded-lg bg-theme-base/80 border border-theme-border/60 text-[11px] text-theme-text-secondary break-all font-mono">
              {item.path}
            </div>
          </div>
        </div>

        {/* Action Buttons Matrix */}
        <div className="space-y-2 pt-2">
          {/* Open Button */}
          <button
            onClick={() => {
              if (isFolder) {
                navigateTo(item.path);
              } else {
                api.openItemInOS(item.path);
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-theme-accent text-white font-medium text-xs hover:bg-theme-accent/90 shadow-glow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isFolder ? 'Explore Sector' : 'Open with OS App'}</span>
          </button>

          {/* Copy Path */}
          <button
            onClick={handleCopyPath}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-theme-card border border-theme-border text-xs text-theme-text hover:bg-theme-hover transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy System Path'}</span>
          </button>

          {/* Open containing folder */}
          {!isFolder && (
            <button
              onClick={handleOpenContaining}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-theme-card border border-theme-border text-xs text-theme-text hover:bg-theme-hover transition-all"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Go to Containing Folder</span>
            </button>
          )}

          {/* Rename & Delete */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => openModal('rename', item)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-theme-card border border-theme-border text-xs text-theme-text hover:bg-theme-hover transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Rename</span>
            </button>

            <button
              onClick={() => openModal('confirm-delete', item)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 hover:bg-rose-500/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
