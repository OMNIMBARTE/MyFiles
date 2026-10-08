import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, X } from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import * as api from '../../services/api';

export const RenameModal: React.FC = () => {
  const { state, closeModal, refresh, selectItem } = useExplorerStore();
  const isOpen = state.activeModal === 'rename';
  const target = state.modalTargetItem;

  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (target) {
      setNewName(target.name);
      setError(null);
    }
  }, [target]);

  if (!isOpen || !target) return null;

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName.trim() === target.name) {
      closeModal();
      return;
    }

    try {
      const res = await api.renameItem(target.path, newName.trim());
      if (res.success) {
        if (state.selectedItem?.path === target.path && res.newPath) {
          selectItem({ ...target, name: newName.trim(), path: res.newPath });
        }
        refresh();
        closeModal();
      } else {
        setError(res.error || 'Failed to rename');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error renaming item');
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
              <Edit3 className="w-5 h-5" />
              <h3 className="text-base font-semibold text-theme-text">
                Rename Item
              </h3>
            </div>
            <button onClick={closeModal} className="p-1 rounded text-theme-muted hover:text-theme-text">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleRename} className="space-y-4">
            <div>
              <label className="block text-sm text-theme-muted mb-1.5">
                New Name
              </label>
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError(null);
                }}
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
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
