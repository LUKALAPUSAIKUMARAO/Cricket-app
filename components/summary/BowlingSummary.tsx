'use client';

import { motion } from 'framer-motion';
import { BowlerStats } from '@/lib/matchStats';

interface BowlingSummaryProps {
  stats: BowlerStats[];
  teamColor: string;
}

export function BowlingSummary({ stats, teamColor }: BowlingSummaryProps) {
  if (stats.length === 0) return null;

  const bestBowler = stats[0];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Bowling</h3>
        <div className="flex space-x-3 text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">
          <span className="w-8 text-right">O</span>
          <span className="w-6 text-center">M</span>
          <span className="w-8 text-right">R</span>
          <span className="w-6 text-center">W</span>
          <span className="w-10 text-right">Eco</span>
          <span className="w-8 text-right">Dots</span>
        </div>
      </div>

      {/* Bowler rows */}
      <div className="space-y-1">
        {stats.map((bowler, i) => {
          const isBest = i === 0 && bowler.wickets > 0;

          return (
            <motion.div
              key={bowler.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative rounded-xl overflow-hidden"
            >
              <div className={`relative flex items-center justify-between px-3 py-2.5 ${isBest ? 'bg-white/[0.03]' : ''}`}>
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {isBest && (
                    <div
                      className="w-1 h-6 rounded-full shrink-0"
                      style={{ backgroundColor: teamColor }}
                    />
                  )}
                  <div className="min-w-0">
                    <span className={`text-sm font-bold truncate block ${isBest ? 'text-foreground' : 'text-foreground/80'}`}>
                      {bowler.name}
                    </span>
                    {isBest && (
                      <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: teamColor }}>
                        Best Spell
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 items-center shrink-0">
                  <span className="w-8 text-right text-xs font-bold text-foreground/80">
                    {bowler.overs}
                  </span>
                  <span className="w-6 text-center text-xs font-bold text-muted-foreground">
                    {bowler.maidens}
                  </span>
                  <span className="w-8 text-right text-xs font-bold text-foreground/80">
                    {bowler.runs}
                  </span>
                  <span className={`w-6 text-center text-sm font-black ${bowler.wickets >= 3 ? 'text-green-400' : bowler.wickets > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {bowler.wickets}
                  </span>
                  <span className={`w-10 text-right text-xs font-bold ${bowler.economy < 6 ? 'text-green-500' : bowler.economy > 10 ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {bowler.economy.toFixed(1)}
                  </span>
                  <span className="w-8 text-right text-xs font-bold text-muted-foreground">
                    {bowler.dots}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
