'use client';

import { motion } from 'framer-motion';
import { BatsmanStats } from '@/lib/matchStats';

interface BattingSummaryProps {
  stats: BatsmanStats[];
  teamColor: string;
  teamName: string;
}

export function BattingSummary({ stats, teamColor, teamName }: BattingSummaryProps) {
  if (stats.length === 0) return null;

  const topScorer = stats[0];
  const maxRuns = topScorer.runs || 1;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Batting</h3>
        <div className="flex space-x-4 text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">
          <span className="w-8 text-right">R</span>
          <span className="w-8 text-right">B</span>
          <span className="w-10 text-right">SR</span>
          <span className="w-6 text-center">4s</span>
          <span className="w-6 text-center">6s</span>
        </div>
      </div>

      {/* Player rows */}
      <div className="space-y-1">
        {stats.map((player, i) => {
          const isTopScorer = i === 0 && player.runs > 0;
          
          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative rounded-xl overflow-hidden"
            >
              {/* Impact bar background */}
              <div
                className="absolute inset-y-0 left-0 rounded-xl opacity-[0.07]"
                style={{
                  width: `${(player.runs / maxRuns) * 100}%`,
                  backgroundColor: teamColor,
                }}
              />

              <div className={`relative flex items-center justify-between px-3 py-2.5 ${isTopScorer ? 'bg-white/[0.03]' : ''}`}>
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {isTopScorer && (
                    <div
                      className="w-1 h-6 rounded-full shrink-0"
                      style={{ backgroundColor: teamColor }}
                    />
                  )}
                  <div className="min-w-0">
                    <span className={`text-sm font-bold truncate block ${isTopScorer ? 'text-foreground' : 'text-foreground/80'}`}>
                      {player.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-medium">
                      {player.isOut ? 'out' : 'not out'}
                      {player.dotPercent > 0 && ` · ${Math.round(player.dotPercent)}% dots`}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-4 items-center shrink-0">
                  <span className={`w-8 text-right text-sm font-black ${isTopScorer ? '' : 'text-foreground/80'}`}
                    style={isTopScorer ? { color: teamColor } : {}}
                  >
                    {player.runs}
                  </span>
                  <span className="w-8 text-right text-xs text-muted-foreground font-bold">
                    {player.balls}
                  </span>
                  <span className={`w-10 text-right text-xs font-bold ${player.strikeRate > 150 ? 'text-green-500' : player.strikeRate < 80 ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {player.strikeRate.toFixed(0)}
                  </span>
                  <span className="w-6 text-center text-xs font-bold text-blue-400">
                    {player.fours || '-'}
                  </span>
                  <span className="w-6 text-center text-xs font-bold text-purple-400">
                    {player.sixes || '-'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Extras & Total */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-white/5 text-xs font-bold text-muted-foreground">
        <span>Extras included in team total</span>
      </div>
    </div>
  );
}
