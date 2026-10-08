import React from 'react';
import { ChevronRight, Home, HardDrive, Sparkles } from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';

export const BreadcrumbNav: React.FC = () => {
  const { state, navigateTo } = useExplorerStore();
  const { currentPath, directoryData } = state;


  if (!currentPath) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-surface/70 border border-theme-border text-xs text-theme-text font-medium">
        <Home className="w-3.5 h-3.5 text-theme-accent" />
        <span>Nexus Home</span>
        <ChevronRight className="w-3 h-3 text-theme-muted" />
        <span className="text-theme-accent flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> System Root
        </span>
      </div>
    );
  }

  const breadcrumbs = directoryData?.breadcrumbs || [];

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-theme-surface/80 border border-theme-border text-xs text-theme-text overflow-x-auto no-scrollbar max-w-xl">
      <button
        onClick={() => navigateTo(null)}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-theme-hover text-theme-muted hover:text-theme-text transition-colors shrink-0"
        title="Go to Nexus Home"
      >
        <Home className="w-3.5 h-3.5 text-theme-accent" />
        <span className="hidden sm:inline">Home</span>
      </button>

      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        // Check if crumb corresponds to a known location name for a nicer icon
        const isDesktop = crumb.name.toLowerCase() === 'desktop';
        const isParallel = crumb.name.toLowerCase().includes('parallel');
        const isSecond = crumb.name.toLowerCase().includes('2nd') || crumb.name.toLowerCase().includes('second');

        return (
          <React.Fragment key={crumb.path}>
            <ChevronRight className="w-3 h-3 text-theme-muted shrink-0" />
            <button
              onClick={() => navigateTo(crumb.path)}
              disabled={isLast}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all shrink-0 font-mono text-[11px] ${
                isLast
                  ? 'text-theme-accent font-semibold bg-theme-accent-subtle/50 cursor-default'
                  : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-hover'
              }`}
              title={crumb.path}
            >
              {idx === 0 && <HardDrive className="w-3 h-3 text-theme-muted" />}
              {isDesktop && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />}
              {isParallel && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />}
              {isSecond && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />}
              <span className="truncate max-w-[120px]">{crumb.name}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
