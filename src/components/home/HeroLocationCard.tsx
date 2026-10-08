import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, HardDrive, Calendar, Sparkles } from 'lucide-react';
import { SystemLocation } from '../../types/filesystem';
import { useExplorerStore } from '../../store/useExplorerStore';

interface HeroLocationCardProps {
  location: SystemLocation;
  accentColor: string; // tailwind color or hex
  glowClass: string;
  badge: string;
  index: number;
}

export const HeroLocationCard: React.FC<HeroLocationCardProps> = ({
  location,
  glowClass,
  badge,
  index,
}) => {
  const { navigateTo } = useExplorerStore();

  const formattedDate = new Date(location.modifiedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => navigateTo(location.path)}
      className={`group relative overflow-hidden rounded-2xl border border-theme-border hover:border-theme-border-highlight bg-theme-card/70 backdrop-blur-xl p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl ${glowClass}`}
    >
      {/* Background Decorative Ambient Radial Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-theme-accent-glow blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />

      {/* Top Header: Badge and Quick Action */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider font-semibold uppercase bg-theme-base/80 border border-theme-border text-theme-accent flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3 h-3" />
          {badge}
        </span>
        <div className="w-8 h-8 rounded-full bg-theme-base/80 border border-theme-border flex items-center justify-center text-theme-muted group-hover:text-theme-text group-hover:border-theme-accent/50 group-hover:translate-x-0.5 transition-all">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Hero Visual Icon & Title */}
      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-theme-base/90 border border-theme-border/80 flex items-center justify-center p-2.5 shadow-md group-hover:scale-105 group-hover:border-theme-accent/60 transition-transform duration-300">
            <img
              src={location.resourceIcon}
              alt={location.name}
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-theme-accent"></span>
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-theme-text group-hover:text-theme-accent transition-colors truncate">
            {location.name}
          </h3>
          <p className="text-xs text-theme-text-secondary line-clamp-2 mt-0.5 leading-relaxed">
            {location.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-theme-muted">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              <strong className="text-theme-text font-semibold">{location.itemCount}</strong> items
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Children Preview Drawer */}
      <div className="mt-4 pt-4 border-t border-theme-border/60 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-theme-muted font-medium">
            Active Contents
          </span>
          <span className="text-[10px] font-mono text-theme-accent group-hover:underline">
            Explore Sector →
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {location.previewChildren.length > 0 ? (
            location.previewChildren.slice(0, 3).map((child) => (
              <div
                key={child.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-theme-base/60 border border-theme-border/50 text-[11px] text-theme-text group-hover:border-theme-border transition-colors truncate"
              >
                <img
                  src={child.resourceIcon || '/api/resources/unknown.png'}
                  alt=""
                  className="w-4 h-4 object-contain shrink-0"
                />
                <span className="truncate">{child.name}</span>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-2 text-center text-xs text-theme-muted italic">
              Empty sector
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
