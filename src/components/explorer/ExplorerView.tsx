import React, { useMemo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { FilesystemEntry } from '../../types/filesystem';
import { Toolbar } from './Toolbar';
import { GridLayout } from './layouts/GridLayout';
import { CompactGridLayout } from './layouts/CompactGridLayout';
import { ListLayout } from './layouts/ListLayout';
import { GalleryLayout } from './layouts/GalleryLayout';
import { CinematicLayout } from './layouts/CinematicLayout';

interface ExplorerViewProps {
  onContextMenu: (e: React.MouseEvent, entry: FilesystemEntry) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({ onContextMenu }) => {
  const { state, refresh } = useExplorerStore();
  const {
    directoryData,
    searchResults,
    searchQuery,
    filterCategory,
    sortConfig,
    layoutMode,
    iconSize,
    isLoading,
  } = state;

  // Determine base entries: search results or directory entries
  const rawEntries = useMemo(() => {
    if (searchResults !== null) {
      return searchResults;
    }
    return directoryData?.entries || [];
  }, [searchResults, directoryData]);

  // Apply filtering and sorting
  const processedEntries = useMemo(() => {
    let list = [...rawEntries];

    // Filter
    if (filterCategory !== 'all') {
      if (filterCategory === 'folders') {
        list = list.filter((e) => e.isDirectory);
      } else {
        list = list.filter((e) => e.category === filterCategory);
      }
    }

    // Sort
    list.sort((a, b) => {
      if (sortConfig.foldersFirst) {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
      }

      let comp = 0;
      switch (sortConfig.field) {
        case 'name':
          comp = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
          break;
        case 'size':
          comp = a.size - b.size;
          break;
        case 'modified':
          comp = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
          break;
        case 'created':
          comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'type':
          comp = (a.extension || a.category).localeCompare(b.extension || b.category);
          break;
      }

      return sortConfig.direction === 'asc' ? comp : -comp;
    });

    return list;
  }, [rawEntries, filterCategory, sortConfig]);

  // Loading skeleton
  if (isLoading && !directoryData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-10 h-10 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-theme-muted">Scanning Sector...</span>
      </div>
    );
  }

  // Error state
  if (directoryData?.error && searchResults === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-theme-text uppercase font-mono">Unable to Access Folder</h3>
          <p className="text-xs text-theme-muted mt-1 max-w-md font-mono">{directoryData.error}</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-surface border border-theme-border text-xs text-theme-text hover:border-theme-accent hover:text-theme-accent transition-all font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Read</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent overflow-hidden">
      {/* Scope Toolbar */}
      <Toolbar />

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {processedEntries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-theme-surface/50 border border-theme-border flex items-center justify-center p-3 opacity-60">
              <img src="/api/resources/unknown.png" alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-theme-text font-bold">
                {searchQuery ? 'No Matching Files Found' : 'Sector Empty'}
              </h4>
              <p className="text-[11px] font-mono text-theme-muted mt-1">
                {searchQuery
                  ? `Zero items matched "${searchQuery}" in this scope.`
                  : 'This folder contains no accessible files or directories.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {layoutMode === 'grid' && (
              <GridLayout entries={processedEntries} iconSize={iconSize} onContextMenu={onContextMenu} />
            )}
            {layoutMode === 'compact' && (
              <CompactGridLayout entries={processedEntries} iconSize={iconSize} onContextMenu={onContextMenu} />
            )}
            {layoutMode === 'list' && (
              <ListLayout entries={processedEntries} onContextMenu={onContextMenu} />
            )}
            {layoutMode === 'gallery' && (
              <GalleryLayout entries={processedEntries} onContextMenu={onContextMenu} />
            )}
            {layoutMode === 'cinematic' && (
              <CinematicLayout entries={processedEntries} onContextMenu={onContextMenu} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
