import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Palette, Sparkles } from 'lucide-react';
import { useTheme } from '../../themes/ThemeContext';
import { useExplorerStore } from '../../store/useExplorerStore';
import { ThemeId } from '../../types/theme';

export const ThemeSelectorModal: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const { state, setThemeSelectorOpen } = useExplorerStore();

  if (!state.isThemeSelectorOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl rounded-2xl border border-theme-border bg-theme-surface/95 backdrop-blur-2xl shadow-2xl p-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-theme-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-theme-accent-subtle border border-theme-accent/40 flex items-center justify-center text-theme-accent">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-theme-text">
                  Theme Architecture Selector
                </h3>
                <p className="text-[11px] font-mono text-theme-muted">
                  Choose a visual identity system for the filesystem
                </p>
              </div>
            </div>
            <button
              onClick={() => setThemeSelectorOpen(false)}
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
            {availableThemes.map((theme) => {
              const isActive = currentTheme.id === theme.id;
              const [c1, c2, c3, c4] = theme.previewPalette;

              return (
                <div
                  key={theme.id}
                  onClick={() => setTheme(theme.id as ThemeId)}
                  className={`group relative p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-200 flex flex-col justify-between ${
                    isActive
                      ? 'bg-theme-card border-theme-accent shadow-glow-sm ring-1 ring-theme-accent/50'
                      : 'bg-theme-base/60 hover:bg-theme-card/80 border-theme-border hover:border-theme-border-highlight'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-theme-text font-mono group-hover:text-theme-accent transition-colors flex items-center gap-1.5">
                        {theme.name}
                        {isActive && <Sparkles className="w-3 h-3 text-theme-accent" />}
                      </h4>
                      <p className="text-[10px] text-theme-muted mt-0.5 line-clamp-1 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>
                    {isActive && (
                      <span className="w-4 h-4 rounded-full bg-theme-accent flex items-center justify-center text-white shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Swatch Palette Bar */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-theme-border/40">
                    <span className="text-[9px] font-mono text-theme-muted uppercase mr-1">Tokens:</span>
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: c1 }} title="Base" />
                      <span className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: c2 }} title="Surface" />
                      <span className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: c3 }} title="Accent" />
                      <span className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: c4 }} title="Highlight" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-5 pt-3 border-t border-theme-border flex items-center justify-between text-[11px] font-mono text-theme-muted">
            <span>Theme settings persist across reloads</span>
            <button
              onClick={() => setThemeSelectorOpen(false)}
              className="px-4 py-1.5 rounded-lg bg-theme-accent text-white font-medium hover:bg-theme-accent/90 transition-all text-xs"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
