import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCw,
  Search,
  X,
  LayoutGrid,
  Grid3X3,
  List,
  Image as ImageIcon,
  Film,
  Sliders,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { BreadcrumbNav } from '../explorer/BreadcrumbNav';
import { LayoutMode, IconSize } from '../../types/filesystem';

interface TopNavigationProps {
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ searchInputRef }) => {
  const {
    state,
    navigateBack,
    navigateForward,
    navigateUp,
    refresh,
    setLayoutMode,
    setIconSize,
    setSearchQuery,
    togglePreview,
  } = useExplorerStore();

  const canGoBack = state.historyIndex > 0;
  const canGoForward = state.historyIndex < state.history.length - 1;
  const canGoUp = !!state.currentPath;

  const layoutIcons: { mode: LayoutMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'grid', icon: <LayoutGrid className="w-4 h-4" />, label: 'Grid' },
    { mode: 'compact', icon: <Grid3X3 className="w-4 h-4" />, label: 'Compact' },
    { mode: 'list', icon: <List className="w-4 h-4" />, label: 'List' },
    { mode: 'gallery', icon: <ImageIcon className="w-4 h-4" />, label: 'Gallery' },
    { mode: 'cinematic', icon: <Film className="w-4 h-4" />, label: 'Cinematic' },
  ];

  const sizeOptions: { size: IconSize; label: string }[] = [
    { size: 'tiny', label: 'XS' },
    { size: 'small', label: 'S' },
    { size: 'medium', label: 'M' },
    { size: 'large', label: 'L' },
    { size: 'huge', label: 'XL' },
  ];

  return (
    <header className="h-12 border-b border-theme-border bg-theme-surface/70 backdrop-blur-xl px-4 flex items-center justify-between gap-3 z-30 select-none">
      {/* Left: Brand & Navigation controls */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 rounded-lg bg-theme-accent-subtle border border-theme-accent/30 flex items-center justify-center shadow-glow-sm">
            <span className="w-2.5 h-2.5 rounded-sm bg-theme-accent animate-pulse" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-[11px] font-mono font-bold tracking-wider text-theme-text uppercase">
              AETHER<span className="text-theme-accent">.FS</span>
            </span>
          </div>
        </div>

        {/* History Arrows */}
        <div className="flex items-center gap-0.5 bg-theme-base/60 p-0.5 rounded-lg border border-theme-border">
          <button
            onClick={navigateBack}
            disabled={!canGoBack}
            className={`p-1.5 rounded transition-colors ${
              canGoBack
                ? 'text-theme-text hover:bg-theme-hover active:bg-theme-active'
                : 'text-theme-muted/40 cursor-not-allowed'
            }`}
            title="Back (Backspace)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={navigateForward}
            disabled={!canGoForward}
            className={`p-1.5 rounded transition-colors ${
              canGoForward
                ? 'text-theme-text hover:bg-theme-hover active:bg-theme-active'
                : 'text-theme-muted/40 cursor-not-allowed'
            }`}
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={navigateUp}
            disabled={!canGoUp}
            className={`p-1.5 rounded transition-colors ${
              canGoUp
                ? 'text-theme-text hover:bg-theme-hover active:bg-theme-active'
                : 'text-theme-muted/40 cursor-not-allowed'
            }`}
            title="Up One Level"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={refresh}
            className="p-1.5 rounded text-theme-text hover:bg-theme-hover active:bg-theme-active transition-colors"
            title="Refresh (Ctrl+R)"
          >
            <RotateCw className={`w-4 h-4 ${state.isLoading ? 'animate-spin text-theme-accent' : ''}`} />
          </button>
        </div>
      </div>

      {/* Middle: Breadcrumbs */}
      <div className="hidden lg:flex flex-1 items-center justify-start min-w-0">
        <BreadcrumbNav />
      </div>

      {/* Right: Search, Layout & Controls */}
      <div className="flex items-center gap-2">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <div className="absolute left-2.5 text-theme-muted pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={state.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-44 md:w-56 h-8 pl-8 pr-7 bg-theme-base/70 border border-theme-border rounded-lg text-xs text-theme-text placeholder-theme-muted focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent/50 transition-all"
          />
          {state.searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-theme-muted hover:text-theme-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Layout Switcher */}
        <div className="hidden sm:flex items-center bg-theme-base/60 p-0.5 rounded-lg border border-theme-border">
          {layoutIcons.map((item) => (
            <button
              key={item.mode}
              onClick={() => setLayoutMode(item.mode)}
              className={`p-1.5 rounded transition-all ${
                state.layoutMode === item.mode
                  ? 'bg-theme-accent-subtle text-theme-accent shadow-sm'
                  : 'text-theme-muted hover:text-theme-text hover:bg-theme-hover'
              }`}
              title={`${item.label} Layout`}
            >
              {item.icon}
            </button>
          ))}
        </div>

        {/* Icon Size Controller */}
        <div className="hidden xl:flex items-center gap-1 bg-theme-base/60 px-1.5 py-0.5 rounded-lg border border-theme-border">
          <Sliders className="w-3.5 h-3.5 text-theme-muted mr-1" />
          {sizeOptions.map((opt) => (
            <button
              key={opt.size}
              onClick={() => setIconSize(opt.size)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                state.iconSize === opt.size
                  ? 'bg-theme-accent text-white font-semibold'
                  : 'text-theme-muted hover:text-theme-text'
              }`}
              title={`Card Size: ${opt.label}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Toggle Details Panel */}
        <button
          onClick={() => togglePreview()}
          className={`p-1.5 rounded-lg border transition-all ${
            state.isPreviewOpen
              ? 'bg-theme-accent-subtle border-theme-accent/40 text-theme-accent'
              : 'bg-theme-base/60 border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-hover'
          }`}
          title={state.isPreviewOpen ? 'Hide Details Panel' : 'Show Details Panel'}
        >
          {state.isPreviewOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
