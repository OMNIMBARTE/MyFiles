import React from 'react';
import { FilesystemEntry, IconSize } from '../../../types/filesystem';
import { FolderCard } from '../cards/FolderCard';
import { FileCard } from '../cards/FileCard';

interface GridLayoutProps {
  entries: FilesystemEntry[];
  iconSize: IconSize;
  onContextMenu: (e: React.MouseEvent, entry: FilesystemEntry) => void;
}

export const GridLayout: React.FC<GridLayoutProps> = ({ entries, iconSize, onContextMenu }) => {
  const gridClasses: Record<IconSize, string> = {
    tiny: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3',
    small: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
    medium: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5',
    large: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6',
    huge: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8',
  };

  return (
    <div className={`grid ${gridClasses[iconSize] || gridClasses.medium} p-6`}>
      {entries.map((entry) =>
        entry.isDirectory ? (
          <FolderCard key={entry.id} entry={entry} iconSize={iconSize} onContextMenu={onContextMenu} />
        ) : (
          <FileCard key={entry.id} entry={entry} iconSize={iconSize} onContextMenu={onContextMenu} />
        )
      )}
    </div>
  );
};
