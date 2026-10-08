import React, { useRef, useState } from 'react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { useTheme } from '../../themes/ThemeContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useFilesystemWatcher } from '../../hooks/useFilesystemWatcher';
import { TopNavigation } from './TopNavigation';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { HomeScreen } from '../home/HomeScreen';
import { ExplorerView } from '../explorer/ExplorerView';
import { DetailsDrawer } from '../preview/DetailsDrawer';
import { ThemeSelectorModal } from '../modals/ThemeSelectorModal';
import { CommandPalette } from '../modals/CommandPalette';
import { ConfirmModal } from '../modals/ConfirmModal';
import { NewItemModal } from '../modals/NewItemModal';
import { RenameModal } from '../modals/RenameModal';
import { ContextMenu } from '../contextmenu/ContextMenu';
import { FilesystemEntry } from '../../types/filesystem';

export const Shell: React.FC = () => {
  const { state } = useExplorerStore();
  const { currentTheme } = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Hook integrations
  useKeyboardShortcuts(searchInputRef);
  useFilesystemWatcher();

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: FilesystemEntry | null;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, item: FilesystemEntry) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-theme-base text-theme-text font-sans relative">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {currentTheme.backgroundStyle === 'mesh' && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_var(--color-accent-glow)_0%,_transparent_40%),radial-gradient(circle_at_80%_80%,_var(--color-glow)_0%,_transparent_50%)] opacity-25" />
        )}
        {currentTheme.backgroundStyle === 'cyber-grid' && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(250,204,21,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,204,21,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
        )}
        {currentTheme.backgroundStyle === 'aurora' && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_var(--color-accent-glow)_0%,_transparent_60%)] opacity-35" />
        )}
        {currentTheme.backgroundStyle === 'glass' && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.06)_0%,_transparent_70%)]" />
        )}

        {/* Animated Ambient Lighting Orbs */}
        <div className="animate-orb-drift absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-theme-accent-glow blur-[120px] opacity-20 pointer-events-none" />
        <div className="animate-orb-drift-2 absolute bottom-[-10rem] right-[-8rem] w-[550px] h-[550px] rounded-full bg-theme-glow blur-[140px] opacity-15 pointer-events-none" />
        <div className="animate-orb-drift-3 absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-theme-accent-glow blur-[120px] opacity-10 pointer-events-none" />
      </div>

      {/* Top Navigation */}
      <TopNavigation searchInputRef={searchInputRef} />

      {/* Main Workspace Body */}
      <div className="flex-1 flex min-h-0 relative z-10 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Canvas */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
          {state.currentPath === null ? (
            <HomeScreen />
          ) : (
            <ExplorerView onContextMenu={handleContextMenu} />
          )}
        </main>

        {/* Right Details Panel */}
        <DetailsDrawer />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Modals & Overlays */}
      <ThemeSelectorModal />
      <CommandPalette />
      <ConfirmModal />
      <NewItemModal />
      <RenameModal />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};
