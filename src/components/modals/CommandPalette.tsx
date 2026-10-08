import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  Monitor,
  Globe2,
  Database,
  LayoutGrid,
  Grid3X3,
  List,
  Image,
  Film,
  Palette,
  RotateCw,
  FolderPlus,
  FilePlus,
  Sliders,
  PanelRight,
} from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { useTheme } from '../../themes/ThemeContext';
import { ThemeId } from '../../types/theme';


export const CommandPalette: React.FC = () => {
  const {
    state,
    setCommandPaletteOpen,
    navigateTo,
    setLayoutMode,
    setIconSize,
    refresh,
    openModal,
    togglePreview,
    setThemeSelectorOpen,
  } = useExplorerStore();

  const { setTheme, availableThemes } = useTheme();
  const [query, setQuery] = useState('');

  const primary = state.discoveryData?.primaryLocations;

  const actions = useMemo(() => {
    return [
      // Navigation
      {
        id: 'go-home',
        category: 'Navigation',
        title: 'Navigate: Nexus Home',
        icon: <Home className="w-4 h-4 text-theme-accent" />,
        run: () => navigateTo(null),
      },
      ...(primary?.desktop
        ? [
            {
              id: 'go-desktop',
              category: 'Navigation',
              title: 'Navigate: Desktop',
              icon: <Monitor className="w-4 h-4 text-indigo-400" />,
              run: () => navigateTo(primary.desktop.path),
            },
          ]
        : []),
      ...(primary?.parallelWorld
        ? [
            {
              id: 'go-parallel',
              category: 'Navigation',
              title: 'Navigate: Parallel World',
              icon: <Globe2 className="w-4 h-4 text-cyan-400" />,
              run: () => navigateTo(primary.parallelWorld.path),
            },
          ]
        : []),
      ...(primary?.secondWorld
        ? [
            {
              id: 'go-second',
              category: 'Navigation',
              title: 'Navigate: 2nd World',
              icon: <Database className="w-4 h-4 text-purple-400" />,
              run: () => navigateTo(primary.secondWorld.path),
            },
          ]
        : []),

      // Layouts
      {
        id: 'layout-grid',
        category: 'Layout',
        title: 'View: Grid Layout',
        icon: <LayoutGrid className="w-4 h-4" />,
        run: () => setLayoutMode('grid'),
      },
      {
        id: 'layout-compact',
        category: 'Layout',
        title: 'View: Compact Grid Layout',
        icon: <Grid3X3 className="w-4 h-4" />,
        run: () => setLayoutMode('compact'),
      },
      {
        id: 'layout-list',
        category: 'Layout',
        title: 'View: List Layout',
        icon: <List className="w-4 h-4" />,
        run: () => setLayoutMode('list'),
      },
      {
        id: 'layout-gallery',
        category: 'Layout',
        title: 'View: Media Gallery Layout',
        icon: <Image className="w-4 h-4" />,
        run: () => setLayoutMode('gallery'),
      },
      {
        id: 'layout-cinematic',
        category: 'Layout',
        title: 'View: Cinematic Media Layout',
        icon: <Film className="w-4 h-4" />,
        run: () => setLayoutMode('cinematic'),
      },

      // Card Sizes
      {
        id: 'size-tiny',
        category: 'Appearance',
        title: 'Icon Size: Extra Small (Tiny)',
        icon: <Sliders className="w-4 h-4" />,
        run: () => setIconSize('tiny'),
      },
      {
        id: 'size-medium',
        category: 'Appearance',
        title: 'Icon Size: Medium',
        icon: <Sliders className="w-4 h-4" />,
        run: () => setIconSize('medium'),
      },
      {
        id: 'size-huge',
        category: 'Appearance',
        title: 'Icon Size: Extra Large (Huge)',
        icon: <Sliders className="w-4 h-4" />,
        run: () => setIconSize('huge'),
      },

      // Themes
      ...availableThemes.map((t) => ({
        id: `theme-${t.id}`,
        category: 'Themes',
        title: `Set Theme: ${t.name}`,
        icon: <Palette className="w-4 h-4 text-theme-accent" />,
        run: () => setTheme(t.id as ThemeId),
      })),

      // Filesystem Operations
      {
        id: 'op-refresh',
        category: 'Operations',
        title: 'Filesystem: Refresh Active Directory',
        icon: <RotateCw className="w-4 h-4" />,
        run: () => refresh(),
      },
      {
        id: 'op-new-folder',
        category: 'Operations',
        title: 'Filesystem: Create New Folder',
        icon: <FolderPlus className="w-4 h-4" />,
        run: () => openModal('new-folder'),
      },
      {
        id: 'op-new-file',
        category: 'Operations',
        title: 'Filesystem: Create New File',
        icon: <FilePlus className="w-4 h-4" />,
        run: () => openModal('new-file'),
      },
      {
        id: 'op-toggle-panel',
        category: 'View',
        title: 'Toggle Inspector Drawer',
        icon: <PanelRight className="w-4 h-4" />,
        run: () => togglePreview(),
      },
      {
        id: 'op-open-theme-picker',
        category: 'Themes',
        title: 'Open Visual Theme Palette',
        icon: <Palette className="w-4 h-4 text-theme-accent" />,
        run: () => setThemeSelectorOpen(true),
      },
    ];
  }, [primary, availableThemes, navigateTo, setLayoutMode, setIconSize, refresh, openModal, togglePreview, setTheme, setThemeSelectorOpen]);

  const filtered = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter((a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  }, [actions, query]);

  if (!state.isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-xl rounded-2xl border border-theme-border bg-theme-surface/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
        >
          {/* Search Box */}
          <div className="flex items-center px-4 py-3 border-b border-theme-border">
            <Search className="w-4 h-4 text-theme-muted mr-3 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or jump to sector..."
              className="w-full bg-transparent border-none text-sm text-theme-text placeholder-theme-muted focus:outline-none font-mono"
            />
            <span className="text-[10px] font-mono text-theme-muted bg-theme-base/80 px-2 py-0.5 rounded border border-theme-border">
              ESC to close
            </span>
          </div>

          {/* Command list */}
          <div className="max-h-80 overflow-y-auto p-2 no-scrollbar space-y-0.5">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-theme-muted font-mono">
                No matching commands found
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.run();
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-mono text-theme-text-secondary hover:text-theme-text hover:bg-theme-hover transition-colors group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="p-1.5 rounded-lg bg-theme-base border border-theme-border/60 text-theme-muted group-hover:text-theme-accent">
                      {item.icon}
                    </span>
                    <span className="truncate group-hover:text-theme-text font-medium font-sans">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-theme-muted uppercase tracking-wider shrink-0 ml-2">
                    {item.category}
                  </span>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
