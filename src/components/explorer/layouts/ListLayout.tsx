import React from 'react';
import { ArrowUp, ArrowDown, MoreVertical } from 'lucide-react';
import { FilesystemEntry, SortField } from '../../../types/filesystem';
import { useExplorerStore } from '../../../store/useExplorerStore';
import * as api from '../../../services/api';

interface ListLayoutProps {
  entries: FilesystemEntry[];
  onContextMenu: (e: React.MouseEvent, entry: FilesystemEntry) => void;
}

export const ListLayout: React.FC<ListLayoutProps> = ({ entries, onContextMenu }) => {
  const { state, selectItem, navigateTo, setSortConfig } = useExplorerStore();
  const { sortConfig } = state;


  const handleSort = (field: SortField) => {
    if (sortConfig.field === field) {
      setSortConfig({ direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ field, direction: 'asc' });
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-theme-accent ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-theme-accent ml-1 inline" />
    );
  };

  return (
    <div className="p-6 overflow-x-auto select-none">
      <table className="w-full border-collapse text-left text-xs text-theme-text">
        <thead>
          <tr className="border-b border-theme-border/80 text-[11px] font-mono text-theme-muted uppercase tracking-wider">
            <th
              className="py-2.5 px-3 cursor-pointer hover:text-theme-text transition-colors"
              onClick={() => handleSort('name')}
            >
              Name {renderSortIndicator('name')}
            </th>
            <th
              className="py-2.5 px-3 cursor-pointer hover:text-theme-text transition-colors w-32 hidden md:table-cell"
              onClick={() => handleSort('type')}
            >
              Type {renderSortIndicator('type')}
            </th>
            <th
              className="py-2.5 px-3 cursor-pointer hover:text-theme-text transition-colors w-28"
              onClick={() => handleSort('size')}
            >
              Size {renderSortIndicator('size')}
            </th>
            <th
              className="py-2.5 px-3 cursor-pointer hover:text-theme-text transition-colors w-44 hidden sm:table-cell"
              onClick={() => handleSort('modified')}
            >
              Date Modified {renderSortIndicator('modified')}
            </th>
            <th className="py-2.5 px-3 w-16 text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-theme-border/40 font-mono">
          {entries.map((entry) => {
            const isSelected = state.selectedItem?.path === entry.path;
            const dateStr = new Date(entry.modifiedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <tr
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
                className={`cursor-pointer transition-colors group ${
                  isSelected
                    ? 'bg-theme-active text-theme-accent'
                    : 'hover:bg-theme-hover/60 text-theme-text-secondary hover:text-theme-text'
                }`}
              >
                {/* Name & Icon */}
                <td className="py-2.5 px-3 flex items-center gap-3 max-w-md truncate">
                  <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                    <img
                      src={entry.resourceIcon || '/api/resources/unknown.png'}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="truncate font-sans font-medium text-xs text-theme-text group-hover:text-theme-accent transition-colors">
                    {entry.name}
                  </span>
                </td>

                {/* Category / Type */}
                <td className="py-2 px-3 text-[11px] text-theme-muted uppercase hidden md:table-cell">
                  {entry.isDirectory ? 'Folder' : entry.category}
                </td>

                {/* Size */}
                <td className="py-2 px-3 text-[11px] text-theme-muted">
                  {entry.formattedSize}
                </td>

                {/* Date Modified */}
                <td className="py-2 px-3 text-[11px] text-theme-muted hidden sm:table-cell">
                  {dateStr}
                </td>

                {/* Actions */}
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onContextMenu(e, entry);
                    }}
                    className="p-1 rounded text-theme-muted hover:text-theme-text hover:bg-theme-hover opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
