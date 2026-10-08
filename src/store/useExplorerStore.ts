import { useState, useEffect, useCallback } from 'react';
import {
  DirectoryContentResult,
  FilesystemEntry,
  FilterCategory,
  IconSize,
  LayoutMode,
  SortConfig,
  SystemDiscoveryResult,
} from '../types/filesystem';
import * as api from '../services/api';


const FAVORITES_KEY = 'aether_favorites_v1';
const RECENT_KEY = 'aether_recents_v1';
const LAYOUT_KEY = 'aether_layout_mode';
const ICON_SIZE_KEY = 'aether_icon_size';

export interface ExplorerState {
  currentPath: string | null; // null = Home screen
  history: (string | null)[];
  historyIndex: number;
  directoryData: DirectoryContentResult | null;
  discoveryData: SystemDiscoveryResult | null;
  selectedItem: FilesystemEntry | null;
  layoutMode: LayoutMode;
  iconSize: IconSize;
  sortConfig: SortConfig;
  filterCategory: FilterCategory;
  searchQuery: string;
  searchResults: FilesystemEntry[] | null;
  isLoading: boolean;
  statusMessage: string | null;
  discoveryError: string | null;
  favorites: string[];
  recentItems: FilesystemEntry[];
  isPreviewOpen: boolean;
  isCommandPaletteOpen: boolean;
  isThemeSelectorOpen: boolean;
  activeModal: 'new-folder' | 'rename' | 'confirm-delete' | 'new-file' | null;
  modalTargetItem: FilesystemEntry | null;
}

// Global shared state for React components
let state: ExplorerState = {
  currentPath: null, // Start at Home
  history: [null],
  historyIndex: 0,
  directoryData: null,
  discoveryData: null,
  selectedItem: null,
  layoutMode: (localStorage.getItem(LAYOUT_KEY) as LayoutMode) || 'grid',
  iconSize: (localStorage.getItem(ICON_SIZE_KEY) as IconSize) || 'medium',
  sortConfig: { field: 'name', direction: 'asc', foldersFirst: true },
  filterCategory: 'all',
  searchQuery: '',
  searchResults: null,
  isLoading: true,
  statusMessage: 'Initializing filesystem...',
  discoveryError: null,
  favorites: JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'),
  recentItems: JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'),
  isPreviewOpen: true,
  isCommandPaletteOpen: false,
  isThemeSelectorOpen: false,
  activeModal: null,
  modalTargetItem: null,
};

const listeners = new Set<(s: ExplorerState) => void>();

function updateState(updater: Partial<ExplorerState> | ((prev: ExplorerState) => Partial<ExplorerState>)) {
  const next = typeof updater === 'function' ? { ...state, ...updater(state) } : { ...state, ...updater };
  state = next;
  listeners.forEach((l) => l(state));
}

export function useExplorerStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  // Initialize discovery on startup
  const initDiscovery = useCallback(async () => {
    try {
      updateState({ isLoading: true, statusMessage: 'Discovering filesystem...', discoveryError: null });
      const discovery = await api.fetchDiscovery();
      updateState({
        discoveryData: discovery,
        isLoading: false,
        statusMessage: null,
        discoveryError: null,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      updateState({
        isLoading: false,
        discoveryError: msg,
        statusMessage: `Discovery error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }, []);

  // Navigate to path (or null for Home)
  const navigateTo = useCallback(async (targetPath: string | null, addToHistory = true) => {
    if (targetPath === state.currentPath && !state.searchQuery) return;

    let newHistory = state.history;
    let newIndex = state.historyIndex;

    if (addToHistory) {
      newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(targetPath);
      newIndex = newHistory.length - 1;
    }

    if (!targetPath) {
      // Navigating Home
      updateState({
        currentPath: null,
        history: newHistory,
        historyIndex: newIndex,
        selectedItem: null,
        searchQuery: '',
        searchResults: null,
        directoryData: null,
        isLoading: false,
      });
      return;
    }

    updateState({
      currentPath: targetPath,
      history: newHistory,
      historyIndex: newIndex,
      isLoading: true,
      statusMessage: `Loading ${targetPath}...`,
      selectedItem: null,
      searchQuery: '',
      searchResults: null,
    });

    try {
      const data = await api.browseDirectory(targetPath);
      updateState({
        directoryData: data,
        isLoading: false,
        statusMessage: null,
      });
    } catch (err: unknown) {
      updateState({
        isLoading: false,
        statusMessage: `Error loading directory: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }, []);

  const navigateBack = useCallback(() => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const target = state.history[newIndex];
      updateState({ historyIndex: newIndex });
      navigateTo(target, false);
    }
  }, [navigateTo]);

  const navigateForward = useCallback(() => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const target = state.history[newIndex];
      updateState({ historyIndex: newIndex });
      navigateTo(target, false);
    }
  }, [navigateTo]);

  const navigateUp = useCallback(() => {
    if (!state.currentPath) return;
    if (state.directoryData?.parentPath) {
      navigateTo(state.directoryData.parentPath);
    } else {
      navigateTo(null); // Go home if no parent
    }
  }, [navigateTo]);

  const refresh = useCallback(async () => {
    if (state.currentPath) {
      updateState({ isLoading: true, statusMessage: 'Refreshing...' });
      try {
        const data = await api.browseDirectory(state.currentPath);
        updateState({ directoryData: data, isLoading: false, statusMessage: null });
      } catch (err: unknown) {
        updateState({ isLoading: false, statusMessage: `Refresh failed: ${err instanceof Error ? err.message : String(err)}` });
      }
    } else {
      initDiscovery();
    }
  }, [initDiscovery]);


  const selectItem = useCallback((item: FilesystemEntry | null) => {
    updateState({ selectedItem: item });
    if (item && !item.isDirectory) {
      // Record to recent items
      const existing = state.recentItems.filter((r) => r.path !== item.path);
      const updated = [item, ...existing].slice(0, 20);
      updateState({ recentItems: updated });
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  }, []);

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    updateState({ layoutMode: mode });
    try {
      localStorage.setItem(LAYOUT_KEY, mode);
    } catch {
      // ignore
    }
  }, []);

  const setIconSize = useCallback((size: IconSize) => {
    updateState({ iconSize: size });
    try {
      localStorage.setItem(ICON_SIZE_KEY, size);
    } catch {
      // ignore
    }
  }, []);

  const setSortConfig = useCallback((sort: Partial<SortConfig>) => {
    updateState((prev) => ({
      sortConfig: { ...prev.sortConfig, ...sort },
    }));
  }, []);

  const setFilterCategory = useCallback((cat: FilterCategory) => {
    updateState({ filterCategory: cat });
  }, []);

  const setSearchQuery = useCallback(
    async (query: string) => {
      updateState({ searchQuery: query });
      if (!query.trim()) {
        updateState({ searchResults: null });
        return;
      }

      const scope = state.currentPath || state.discoveryData?.primaryLocations.desktop.path || '';
      if (!scope) return;

      try {
        const results = await api.searchFiles(scope, query, state.filterCategory);
        updateState({ searchResults: results });
      } catch {
        // ignore
      }
    },
    []
  );

  const toggleFavorite = useCallback((itemPath: string) => {
    const isFav = state.favorites.includes(itemPath);
    const updated = isFav ? state.favorites.filter((f) => f !== itemPath) : [...state.favorites, itemPath];
    updateState({ favorites: updated });
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, []);

  const togglePreview = useCallback((open?: boolean) => {
    updateState((prev) => ({
      isPreviewOpen: open !== undefined ? open : !prev.isPreviewOpen,
    }));
  }, []);

  const openModal = useCallback((modal: ExplorerState['activeModal'], targetItem?: FilesystemEntry | null) => {
    updateState({ activeModal: modal, modalTargetItem: targetItem || null });
  }, []);

  const closeModal = useCallback(() => {
    updateState({ activeModal: null, modalTargetItem: null });
  }, []);

  const setCommandPaletteOpen = useCallback((open: boolean) => {
    updateState({ isCommandPaletteOpen: open });
  }, []);

  const setThemeSelectorOpen = useCallback((open: boolean) => {
    updateState({ isThemeSelectorOpen: open });
  }, []);

  return {
    state,
    initDiscovery,
    navigateTo,
    navigateBack,
    navigateForward,
    navigateUp,
    refresh,
    selectItem,
    setLayoutMode,
    setIconSize,
    setSortConfig,
    setFilterCategory,
    setSearchQuery,
    toggleFavorite,
    togglePreview,
    openModal,
    closeModal,
    setCommandPaletteOpen,
    setThemeSelectorOpen,
  };
}
