import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import * as api from '../../services/api';

export const ConfirmModal: React.FC = () => {
  const { state, closeModal, refresh, selectItem } = useExplorerStore();
  const isOpen = state.activeModal === 'confirm-delete';
  const target = state.modalTargetItem;

  if (!isOpen || !target) return null;

  const handleConfirm = async () => {
    try {
      const res = await api.deleteItem(target.path);
      if (res.success) {
        if (state.selectedItem?.path === target.path) {
          selectItem(null);
        }
        refresh();
        closeModal();
      } else {
        alert(`Delete failed: ${res.error}`);
      }
    } catch (err: unknown) {
      alert(`Error deleting item: ${err instanceof Error ? err.message : String(err)}`);
    }
  };


  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-theme-surface/95 backdrop-blur-2xl shadow-2xl p-6 space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-theme-text uppercase font-mono">
                Confirm Sector Deletion
              </h3>
              <p className="text-xs text-theme-text-secondary mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-rose-400 font-semibold break-all">{target.name}</strong>? This action directly removes the file or folder from your disk.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme-border/60">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-xl bg-theme-card border border-theme-border text-xs text-theme-text hover:bg-theme-hover transition-colors font-mono"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg transition-all font-mono"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Permanently</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
