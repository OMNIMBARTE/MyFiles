import React from 'react';
import { FilesystemEntry, IconSize } from '../../../types/filesystem';
import { useExplorerStore } from '../../../store/useExplorerStore';
import * as api from '../../../services/api';

interface CompactGridLayoutProps {
  entries: FilesystemEntry[];
  iconSize: IconSize;
  onContextMenu: (e: React.MouseEvent, entry: FilesystemEntry) => void;
}

export const CompactGridLayout: React.FC<CompactGridLayoutProps> = ({
  entries,
  onContextMenu,
}) => {
  const { state, selectItem, navigateTo } = useExplorerStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 p-6">
      {entries.map((entry) => {
        const isSelected = state.selectedItem?.path === entry.path;
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
            className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${
              isSelected
                ? 'bg-theme-active border-theme-accent text-theme-accent shadow-glow-sm'
                : 'bg-theme-card/60 hover:bg-theme-card border-theme-border hover:border-theme-border-highlight text-theme-text'
            }`}
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center p-0.5">
              <img
                src={entry.resourceIcon || '/api/resources/unknown.png'}
                alt=""
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-medium truncate" title={entry.name}>
                {entry.name}
              </span>
              <span className="block text-[10px] font-mono text-theme-muted truncate">
                {entry.formattedSize}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
