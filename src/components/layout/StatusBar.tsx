import React from 'react';
import { Palette } from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { useTheme } from '../../themes/ThemeContext';

export const StatusBar: React.FC = () => {
  const { state, setThemeSelectorOpen } = useExplorerStore();

  const { currentTheme } = useTheme();
  const { directoryData, selectedItem, searchResults, searchQuery } = state;

  const totalItems = searchResults !== null ? searchResults.length : (directoryData?.totalItems ?? 0);
  const totalSize = directoryData?.formattedTotalSize || '0 B';

  return (
    <footer className="h-7 border-t border-theme-border bg-theme-surface/80 backdrop-blur-xl px-4 flex items-center justify-between text-[11px] font-mono text-theme-muted select-none z-30">
      {/* Left: Item counts & Selected Info */}
      <div className="flex items-center gap-4 truncate">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-theme-text-secondary font-medium">
            {searchQuery ? `Search: ${totalItems} found` : `${totalItems} items`}
          </span>
          {directoryData && !searchQuery && (
            <span>• {totalSize}</span>
          )}
        </div>

        {selectedItem && (
          <div className="hidden sm:flex items-center gap-1.5 text-theme-accent truncate">
            <span>Selected:</span>
            <span className="font-semibold truncate max-w-xs">{selectedItem.name}</span>
            <span>({selectedItem.formattedSize})</span>
          </div>
        )}
      </div>

      {/* Right: Theme pill & Shortcut hints */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-2 text-[10px]">
          <span>Ctrl+K Palette</span>
          <span>•</span>
          <span>Ctrl+F Search</span>
        </div>

        <button
          onClick={() => setThemeSelectorOpen(true)}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-base/60 border border-theme-border/60 hover:border-theme-accent/50 text-theme-text-secondary hover:text-theme-accent transition-colors"
          title="Click to switch theme"
        >
          <Palette className="w-3 h-3 text-theme-accent" />
          <span className="font-medium text-[10px]">{currentTheme.name}</span>
        </button>
      </div>
    </footer>
  );
};
