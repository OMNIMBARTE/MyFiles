import React from 'react';
import {
  Home,
  Star,
  Clock,
  Cpu,
  Folder,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { APP_LINKS, openAppLink } from '../../config/appLinks';

export const Sidebar: React.FC = () => {
  const { state, navigateTo, selectItem } = useExplorerStore();
  const { currentPath, discoveryData, favorites, recentItems } = state;

  const primary = discoveryData?.primaryLocations;
  const standard = discoveryData?.standardLocations || [];

  return (
    <aside className="w-60 border-r border-theme-border bg-theme-surface/60 backdrop-blur-xl flex flex-col justify-between shrink-0 select-none overflow-y-auto no-scrollbar">
      <div className="p-3 space-y-5">
        {/* Quick External Links */}
        {APP_LINKS.length > 0 && (
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-theme-muted font-semibold">
              <span>Quick Links</span>
            </div>
            <div className="space-y-0.5">
              {APP_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => openAppLink(link)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-theme-text-secondary hover:text-theme-text hover:bg-theme-hover group"
                  title={`Open ${link.label} (${link.url})`}
                >
                  {link.icon === 'graduation' ? (
                    <GraduationCap className={`w-4 h-4 ${link.accent} shrink-0`} />
                  ) : (
                    <Folder className="w-4 h-4 text-theme-accent shrink-0" />
                  )}
                  <span className="truncate flex-1">{link.label}</span>
                  <ExternalLink className="w-3 h-3 text-theme-muted group-hover:text-theme-accent shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Nexus Navigation */}
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-theme-muted font-semibold flex items-center justify-between">
            <span>Core Sectors</span>
          </div>

          <div className="space-y-0.5">
            {/* Home */}
            <button
              onClick={() => navigateTo(null)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentPath === null
                  ? 'bg-theme-accent-subtle text-theme-accent border border-theme-accent/30 shadow-glow-sm'
                  : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-hover'
              }`}
            >
              <Home className="w-4 h-4 text-theme-accent" />
              <span>Nexus Home</span>
            </button>

            {/* Desktop */}
            {primary?.desktop && (
              <button
                onClick={() => navigateTo(primary.desktop.path)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPath === primary.desktop.path || currentPath === primary.desktop.realPath
                    ? 'bg-theme-accent-subtle text-theme-accent border border-theme-accent/30 shadow-glow-sm'
                    : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-hover'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img src="/api/resources/system.png" alt="Desktop" className="w-4 h-4 object-contain" />
                  <span className="truncate">Desktop</span>
                </div>
                <span className="text-[10px] font-mono text-theme-muted bg-theme-base/60 px-1.5 py-0.5 rounded">
                  {primary.desktop.itemCount}
                </span>
              </button>
            )}

            {/* Parallel World */}
            {primary?.parallelWorld && (
              <button
                onClick={() => navigateTo(primary.parallelWorld.path)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPath === primary.parallelWorld.path || currentPath === primary.parallelWorld.realPath
                    ? 'bg-theme-accent-subtle text-theme-accent border border-theme-accent/30 shadow-glow-sm'
                    : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-hover'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img src="/api/resources/cloud.png" alt="Parallel World" className="w-4 h-4 object-contain" />
                  <span className="truncate">Parallel World</span>
                </div>
                <span className="text-[10px] font-mono text-theme-muted bg-theme-base/60 px-1.5 py-0.5 rounded">
                  {primary.parallelWorld.itemCount}
                </span>
              </button>
            )}

            {/* 2nd World */}
            {primary?.secondWorld && (
              <button
                onClick={() => navigateTo(primary.secondWorld.path)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPath === primary.secondWorld.path || currentPath === primary.secondWorld.realPath
                    ? 'bg-theme-accent-subtle text-theme-accent border border-theme-accent/30 shadow-glow-sm'
                    : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-hover'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img src="/api/resources/database.png" alt="2nd World" className="w-4 h-4 object-contain" />
                  <span className="truncate">2nd World</span>
                </div>
                <span className="text-[10px] font-mono text-theme-muted bg-theme-base/60 px-1.5 py-0.5 rounded">
                  {primary.secondWorld.itemCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Standard Folders */}
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-theme-muted font-semibold">
            <span>Storage Sectors</span>
          </div>
          <div className="space-y-0.5">
            {standard.map((loc) => (
              <button
                key={loc.id}
                onClick={() => navigateTo(loc.path)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPath === loc.path || currentPath === loc.realPath
                    ? 'bg-theme-accent-subtle text-theme-accent border border-theme-accent/30 shadow-glow-sm'
                    : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-hover'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img src={loc.resourceIcon} alt={loc.name} className="w-4 h-4 object-contain" />
                  <span className="truncate">{loc.name}</span>
                </div>
                <span className="text-[10px] font-mono text-theme-muted">
                  {loc.itemCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-theme-muted font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Pinned Favorites</span>
            </div>
            <div className="space-y-0.5">
              {favorites.map((fav) => {
                const parts = fav.split('/');
                const name = parts[parts.length - 1] || fav;
                return (
                  <button
                    key={fav}
                    onClick={() => navigateTo(fav)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-theme-text-secondary hover:text-theme-text hover:bg-theme-hover transition-all truncate"
                    title={fav}
                  >
                    <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Items */}
        {recentItems.length > 0 && (
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-theme-muted font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Recent Files</span>
            </div>
            <div className="space-y-0.5">
              {recentItems.slice(0, 5).map((rec) => (
                <button
                  key={rec.path}
                  onClick={() => selectItem(rec)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-theme-text-secondary hover:text-theme-text hover:bg-theme-hover transition-all truncate group"
                  title={rec.path}
                >
                  <img
                    src={rec.resourceIcon || '/api/resources/unknown.png'}
                    alt=""
                    className="w-3.5 h-3.5 object-contain shrink-0"
                  />
                  <span className="truncate text-[11px] group-hover:text-theme-accent">{rec.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom System Telemetry Widget */}
      {discoveryData && (
        <div className="p-3 border-t border-theme-border bg-theme-base/40">
          <div className="flex items-center gap-2 mb-1.5">
            <Cpu className="w-3.5 h-3.5 text-theme-accent" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-theme-text font-bold">
              SYSTEM HOST
            </span>
          </div>
          <div className="space-y-0.5 text-[10px] font-mono text-theme-muted">
            <div className="flex justify-between truncate">
              <span>OS:</span>
              <span className="text-theme-text-secondary truncate">{discoveryData.os.platform} ({discoveryData.os.arch})</span>
            </div>
            <div className="flex justify-between truncate">
              <span>Kernel:</span>
              <span className="text-theme-text-secondary truncate">{discoveryData.os.release.split('-')[0]}</span>
            </div>
            <div className="flex justify-between truncate">
              <span>Node:</span>
              <span className="text-theme-accent">Online</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
