import { useEffect } from 'react';
import { useExplorerStore } from '../store/useExplorerStore';
import * as api from '../services/api';

export function useKeyboardShortcuts(searchInputRef: React.RefObject<HTMLInputElement | null>) {
  const {
    state,
    navigateBack,
    refresh,
    navigateTo,
    openModal,
    setCommandPaletteOpen,
    selectItem,
  } = useExplorerStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;

      // Command Palette: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!state.isCommandPaletteOpen);
        return;
      }

      // Search: Ctrl+F or Cmd+F
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      // Refresh: Ctrl+R or Cmd+R (when inside app)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        refresh();
        return;
      }

      // New Folder: Ctrl+Shift+N or Cmd+Shift+N
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (state.currentPath) {
          openModal('new-folder');
        }
        return;
      }

      // New File: Ctrl+Shift+F or Cmd+Shift+F
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (state.currentPath) {
          openModal('new-file');
        }
        return;
      }

      // Escape: clear selection or close modals
      if (e.key === 'Escape') {
        if (state.selectedItem) {
          selectItem(null);
        }
        return;
      }

      // If user is typing in an input field, do not trigger single-key actions
      if (isInput) return;

      // Backspace: Navigate back
      if (e.key === 'Backspace') {
        e.preventDefault();
        navigateBack();
        return;
      }

      // Enter: Open selected item
      if (e.key === 'Enter' && state.selectedItem) {
        e.preventDefault();
        if (state.selectedItem.isDirectory) {
          navigateTo(state.selectedItem.path);
        } else {
          api.openItemInOS(state.selectedItem.path);
        }
        return;
      }

      // Delete: Trigger delete modal
      if (e.key === 'Delete' && state.selectedItem) {
        e.preventDefault();
        openModal('confirm-delete', state.selectedItem);
        return;
      }

      // Copy Path: Ctrl+C or Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && state.selectedItem) {
        e.preventDefault();
        navigator.clipboard.writeText(state.selectedItem.path);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.isCommandPaletteOpen,
    state.selectedItem,
    state.currentPath,
    navigateBack,
    refresh,
    navigateTo,
    openModal,
    setCommandPaletteOpen,
    selectItem,
    searchInputRef,
  ]);
}
