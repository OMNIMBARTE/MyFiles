import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, FilePlus, X } from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import * as api from '../../services/api';

export const NewItemModal: React.FC = () => {
  const { state, closeModal, refresh } = useExplorerStore();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isFolder = state.activeModal === 'new-folder';
  const isFile = state.activeModal === 'new-file';
  const isOpen = isFolder || isFile;
  const currentPath = state.currentPath;

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !currentPath) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name');
      return;
    }

    try {
      const res = isFolder
        ? await api.createNewFolder(currentPath, name.trim())
        : await api.createNewFile(currentPath, name.trim());
      if (res.success) {
        refresh();
        closeModal();
        setName('');
        setError(null);
      } else {
        setError(res.error || 'Failed to create');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl border border-theme-border bg-theme-surface/95 backdrop-blur-2xl shadow-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-theme-border/60">
            <div className="flex items-center gap-2 text-theme-accent">
              {isFolder ? (
                <FolderPlus className="w-5 h-5" />
              ) : (
                <FilePlus className="w-5 h-5" />
              )}
              <h3 className="text-base font-semibold text-theme-text">
                {isFolder ? 'Create New Folder' : 'Create New File'}
              </h3>
            </div>
            <button onClick={closeModal} className="p-1 rounded text-theme-muted hover:text-theme-text">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-theme-muted mb-1.5">
                {isFolder ? 'Folder Name' : 'File Name'}
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder={isFolder ? 'e.g. Projects, Wallpapers...' : 'e.g. notes.txt, script.ts...'}
                className="w-full px-4 py-2.5 rounded-xl bg-theme-base/90 border-2 border-theme-border text-base text-theme-text placeholder-theme-muted focus:outline-none focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20 transition-all"
              />
              {error && <p className="text-sm text-rose-400 mt-1.5">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme-border/60">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl bg-theme-card border border-theme-border text-sm text-theme-text hover:bg-theme-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-theme-accent text-white font-medium text-sm hover:bg-theme-accent/90 shadow-glow-sm transition-all"
              >
                {isFolder ? 'Create Folder' : 'Create File'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
