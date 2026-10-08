import React from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { FilesystemEntry } from '../../../types/filesystem';
import { useExplorerStore } from '../../../store/useExplorerStore';
import * as api from '../../../services/api';

interface CinematicLayoutProps {
  entries: FilesystemEntry[];
  onContextMenu: (e: React.MouseEvent, entry: FilesystemEntry) => void;
}

export const CinematicLayout: React.FC<CinematicLayoutProps> = ({ entries, onContextMenu }) => {
  const { state, selectItem, navigateTo } = useExplorerStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-6">
      {entries.map((entry) => {
        const isSelected = state.selectedItem?.path === entry.path;
        const isImage = entry.category === 'image';
        const isVideo = entry.category === 'video';
        const rawUrl = api.getFileRawUrl(entry.path);

        const dateStr = new Date(entry.modifiedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });

        return (
          <div
            key={entry.id}
            onClick={() => selectItem(entry)}
            onDoubleClick={() => {
              if (entry.isDirectory) {
                navigateTo(entry.path);
              } else {
                api.openItemInOS(entry.path);
              }
            }}
            onContextMenu={(e) => onContextMenu(e, entry)}
            className={`group rounded-2xl border overflow-hidden cursor-pointer select-none transition-all duration-300 flex flex-col relative ${
              isSelected
                ? 'bg-theme-active border-theme-accent shadow-glow'
                : 'bg-theme-card/70 hover:bg-theme-card border-theme-border hover:border-theme-border-highlight'
            }`}
          >
            {/* Cinematic Hero Canvas */}
            <div className="w-full h-44 bg-gradient-to-b from-theme-base/60 to-theme-surface/90 flex items-center justify-center overflow-hidden relative">
              {isImage ? (
                <img
                  src={rawUrl}
                  alt={entry.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center">
                  <img
                    src={entry.resourceIcon || '/api/resources/unknown.png'}
                    alt=""
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform filter drop-shadow-lg"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Media play badge for videos */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-glow">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              )}

              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white/90 uppercase">
                {entry.isDirectory ? 'FOLDER' : entry.extension || 'FILE'}
              </div>
            </div>

            {/* Cinematic Card Footer */}
            <div className="p-4 border-t border-theme-border/50 bg-theme-surface/80 flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <span className="block text-sm font-semibold text-theme-text group-hover:text-theme-accent truncate" title={entry.name}>
                  {entry.name}
                </span>
                <div className="flex items-center gap-3 text-[11px] font-mono text-theme-muted mt-1">
                  <span>{entry.formattedSize}</span>
                  <span>•</span>
                  <span>{dateStr}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (entry.isDirectory) {
                    navigateTo(entry.path);
                  } else {
                    api.openItemInOS(entry.path);
                  }
                }}
                className="w-8 h-8 rounded-lg bg-theme-base/80 border border-theme-border flex items-center justify-center text-theme-muted hover:text-theme-text hover:border-theme-accent/50 transition-all shrink-0"
                title="Open"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
