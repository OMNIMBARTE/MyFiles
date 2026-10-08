import React from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  FolderTree,
  Zap,
  AlertTriangle,
  RefreshCw,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import { useExplorerStore } from '../../store/useExplorerStore';
import { HeroLocationCard } from './HeroLocationCard';
import { APP_LINKS, openAppLink } from '../../config/appLinks';

export const HomeScreen: React.FC = () => {
  const { state, navigateTo, initDiscovery } = useExplorerStore();
  const { discoveryData, isLoading, discoveryError } = state;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-theme-accent/30 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-t-theme-accent border-r-transparent border-b-theme-accent border-l-transparent animate-spin" />
        </div>
        <div>
          <h2 className="text-sm font-mono font-bold tracking-wider text-theme-text uppercase">
            Synchronizing Filesystem
          </h2>
          <p className="text-xs text-theme-muted mt-1 font-mono">
            {state.statusMessage || 'Resolving kernel sector mount points...'}
          </p>
        </div>
      </div>
    );
  }

  if (discoveryError || !discoveryData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-sm font-mono font-bold tracking-wider text-theme-text uppercase">
            Cannot Reach Filesystem Backend
          </h2>
          <p className="text-xs text-theme-muted mt-2 max-w-md font-mono leading-relaxed">
            {discoveryError
              ? `Network error: ${discoveryError}`
              : 'The filesystem service returned no data.'}
          </p>
          <p className="text-[11px] text-theme-muted mt-3 max-w-sm mx-auto leading-relaxed">
            This app needs the local backend server running. Make sure you started it with{' '}
            <code className="px-1.5 py-0.5 rounded bg-theme-base/80 border border-theme-border text-theme-accent">npm run dev</code>{' '}
            and are accessing it through the same server (not a separate frontend-only port).
          </p>
        </div>
        <button
          onClick={() => initDiscovery()}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-theme-surface border border-theme-border text-xs text-theme-text hover:border-theme-accent hover:text-theme-accent transition-all font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const { primaryLocations, standardLocations, os } = discoveryData;

  const totalPrimaryItems =
    (primaryLocations.desktop?.itemCount || 0) +
    (primaryLocations.parallelWorld?.itemCount || 0) +
    (primaryLocations.secondWorld?.itemCount || 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full no-scrollbar">
      {/* Top Banner & Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-theme-border bg-gradient-to-r from-theme-surface/90 via-theme-card/70 to-theme-surface/90 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-theme-accent-glow rounded-full blur-3xl opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase bg-theme-accent-subtle border border-theme-accent/40 text-theme-accent shadow-glow-sm">
                <Zap className="w-3.5 h-3.5" />
                Filesystem Active
              </span>
              <span className="text-xs font-mono text-theme-muted">
                Host: {os.hostname} • {os.platform.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-theme-text font-sans">
              Nexus Filesystem Explorer
            </h1>

            <p className="text-xs md:text-sm text-theme-text-secondary max-w-2xl leading-relaxed">
              Autonomous neural-styled directory visualizer. Connected to real physical and mounted volumes across your operating system.
            </p>
          </div>

          {/* Quick Stats Pill Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-theme-base/80 p-3.5 rounded-2xl border border-theme-border/80 shrink-0">
            <div className="px-3 py-2 rounded-xl bg-theme-surface/60 border border-theme-border/50">
              <div className="text-[10px] font-mono text-theme-muted uppercase">Primary Items</div>
              <div className="text-lg font-mono font-bold text-theme-accent">{totalPrimaryItems}</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-theme-surface/60 border border-theme-border/50">
              <div className="text-[10px] font-mono text-theme-muted uppercase">Sectors</div>
              <div className="text-lg font-mono font-bold text-theme-text">3 Core</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-theme-surface/60 border border-theme-border/50 col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono text-theme-muted uppercase">Icon Assets</div>
              <div className="text-lg font-mono font-bold text-emerald-400">28 Visuals</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Primary Sectors (Desktop, Parallel World, 2nd World) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-theme-accent" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-theme-text">
              Primary Navigation Sectors
            </h2>
          </div>
          <span className="text-[11px] font-mono text-theme-muted">3 Physical Locations Discovered</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {primaryLocations.desktop && (
            <HeroLocationCard
              location={primaryLocations.desktop}
              accentColor="indigo"
              glowClass="hover:border-indigo-500/50"
              badge="Active Workspace"
              index={0}
            />
          )}

          {primaryLocations.parallelWorld && (
            <HeroLocationCard
              location={primaryLocations.parallelWorld}
              accentColor="cyan"
              glowClass="hover:border-cyan-500/50"
              badge="Creative Hub"
              index={1}
            />
          )}

          {primaryLocations.secondWorld && (
            <HeroLocationCard
              location={primaryLocations.secondWorld}
              accentColor="purple"
              glowClass="hover:border-purple-500/50"
              badge="Deep Storage"
              index={2}
            />
          )}
        </div>
      </section>

      {/* Standard Storage Sectors Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-theme-accent" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-theme-text">
              User Media & Storage Sectors
            </h2>
          </div>
          <span className="text-[11px] font-mono text-theme-muted">Home Directory Folders</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {standardLocations.map((loc, idx) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
              whileHover={{ y: -3, scale: 1.02 }}
              onClick={() => navigateTo(loc.path)}
              className="group flex flex-col items-center text-center p-4 rounded-xl border border-theme-border bg-theme-card/60 hover:bg-theme-card hover:border-theme-accent/40 backdrop-blur-md cursor-pointer transition-all shadow-md"
            >
              <div className="w-12 h-12 rounded-lg bg-theme-base/80 border border-theme-border flex items-center justify-center p-2 mb-3 group-hover:scale-110 transition-transform">
                <img src={loc.resourceIcon} alt={loc.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-semibold text-theme-text group-hover:text-theme-accent transition-colors truncate w-full">
                {loc.name}
              </span>
              <span className="text-[10px] font-mono text-theme-muted mt-0.5">
                {loc.itemCount} items
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick External Links */}
      {APP_LINKS.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-theme-accent" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-theme-text">
                Quick Links
              </h2>
            </div>
            <span className="text-[11px] font-mono text-theme-muted">External Resources</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {APP_LINKS.map((link, idx) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                onClick={() => openAppLink(link)}
                className="group relative overflow-hidden rounded-2xl border border-theme-border bg-theme-card/70 hover:border-theme-accent/40 backdrop-blur-xl p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-theme-accent-glow blur-3xl opacity-15 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-theme-base/90 border border-theme-border flex items-center justify-center mb-4 shadow-md group-hover:scale-110 group-hover:border-theme-accent/50 transition-transform">
                    <GraduationCap className={`w-6 h-6 ${link.accent}`} />
                  </div>
                  <h3 className="text-base font-bold text-theme-text group-hover:text-theme-accent transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-xs text-theme-text-secondary mt-1 line-clamp-2 leading-relaxed">
                    {link.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-4 text-[11px] font-mono text-theme-accent">
                    <span>Open External Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
