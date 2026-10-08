import React from 'react';
import { FilesystemEntry } from '../../../types/filesystem';
import { useExplorerStore } from '../../../store/useExplorerStore';
import * as api from '../../../services/api';

interface GalleryLayoutProps {
  entries: FilesystemEntry[];
  onContextMenu: (e: React.MouseEvent, entry: FilesystemEntry) => void;
}

export const GalleryLayout: React.FC<GalleryLayoutProps> = ({ entries, onContextMenu }) => {
  const { state, selectItem, navigateTo } = useExplorerStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
      {entries.map((entry) => {
        const isSelected = state.selectedItem?.path === entry.path;
        const isImage = entry.category === 'image';
        const rawUrl = api.getFileRawUrl(entry.path);

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
            className={`group rounded-xl border overflow-hidden cursor-pointer select-none transition-all flex flex-col ${
              isSelected
                ? 'bg-theme-active border-theme-accent shadow-glow'
                : 'bg-theme-card/60 hover:bg-theme-card border-theme-border hover:border-theme-border-highlight'
            }`}
          >
            {/* Media Canvas */}
            <div className="w-full h-36 bg-theme-base/80 flex items-center justify-center overflow-hidden relative">
              {isImage ? (
                <img
                  src={rawUrl}
                  alt={entry.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center">
                  <img
                    src={entry.resourceIcon || '/api/resources/unknown.png'}
                    alt=""
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                    loading="lazy"
                  />
                </div>
              )}
              {entry.isDirectory && (
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white">
                  FOLDER
                </span>
              )}
            </div>

            {/* Caption */}
            <div className="p-3 border-t border-theme-border/40">
              <span className="block text-xs font-medium text-theme-text group-hover:text-theme-accent truncate" title={entry.name}>
                {entry.name}
              </span>
              <span className="block text-[10px] font-mono text-theme-muted mt-0.5">
                {entry.formattedSize}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
