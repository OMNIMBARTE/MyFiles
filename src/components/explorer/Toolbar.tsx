import React from 'react';
import {
  FolderPlus,
  FilePlus,
  ArrowUpDown,
  Folder,
  Image,
  Film,
  Music,
  FileCode,
  FileText,
  Archive,
  Layers,
} from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { FilterCategory, SortField } from '../../types/filesystem';

export const Toolbar: React.FC = () => {
  const { state, setFilterCategory, setSortConfig, openModal } = useExplorerStore();
  const { filterCategory, sortConfig } = state;


  const filters: { id: FilterCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: <Layers className="w-3 h-3" /> },
    { id: 'folders', label: 'Folders', icon: <Folder className="w-3 h-3" /> },
    { id: 'image', label: 'Images', icon: <Image className="w-3 h-3" /> },
    { id: 'video', label: 'Videos', icon: <Film className="w-3 h-3" /> },
    { id: 'code', label: 'Code', icon: <FileCode className="w-3 h-3" /> },
    { id: 'document', label: 'Docs', icon: <FileText className="w-3 h-3" /> },
    { id: 'audio', label: 'Audio', icon: <Music className="w-3 h-3" /> },
    { id: 'archive', label: 'Archives', icon: <Archive className="w-3 h-3" /> },
  ];

  const sortFields: { field: SortField; label: string }[] = [
    { field: 'name', label: 'Name' },
    { field: 'size', label: 'Size' },
    { field: 'modified', label: 'Modified' },
    { field: 'type', label: 'Type' },
  ];

  const toggleSort = (field: SortField) => {
    if (sortConfig.field === field) {
      setSortConfig({ direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ field, direction: 'asc' });
    }
  };

  return (
    <div className="px-6 py-2.5 border-b border-theme-border/60 bg-theme-surface/40 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Filter Pills */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] font-mono text-theme-muted uppercase tracking-wider mr-1 hidden sm:inline">
          Filter:
        </span>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterCategory(f.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all shrink-0 ${
              filterCategory === f.id
                ? 'bg-theme-accent text-white font-medium shadow-glow-sm'
                : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-hover bg-theme-base/60 border border-theme-border/60'
            }`}
          >
            {f.icon}
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Right Side: Sorting & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sort Options */}
        <div className="flex items-center gap-1 bg-theme-base/70 px-2 py-1 rounded-lg border border-theme-border text-xs">
          <ArrowUpDown className="w-3 h-3 text-theme-muted mr-1" />
          {sortFields.map((s) => (
            <button
              key={s.field}
              onClick={() => toggleSort(s.field)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                sortConfig.field === s.field
                  ? 'bg-theme-accent-subtle text-theme-accent font-semibold'
                  : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              {s.label}
              {sortConfig.field === s.field && (
                <span className="ml-0.5 text-[9px]">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
          <button
            onClick={() => setSortConfig({ foldersFirst: !sortConfig.foldersFirst })}
            className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
              sortConfig.foldersFirst
                ? 'border-theme-accent/50 text-theme-accent bg-theme-accent-subtle/40'
                : 'border-theme-border text-theme-muted hover:text-theme-text'
            }`}
            title="Keep folders at the top"
          >
            Folders 1st
          </button>
        </div>

        {/* New File Button */}
        <button
          onClick={() => openModal('new-file')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-theme-card border border-theme-border text-xs text-theme-text hover:border-theme-accent/50 hover:text-theme-accent transition-all"
          title="Create new file"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span>New File</span>
        </button>

        {/* New Folder Button */}
        <button
          onClick={() => openModal('new-folder')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-theme-accent text-white font-medium text-xs hover:bg-theme-accent/90 shadow-glow-sm transition-all"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>New Folder</span>
        </button>
      </div>
    </div>
  );
};
