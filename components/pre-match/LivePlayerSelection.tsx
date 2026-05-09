'use client';

import { useMatchStore, Player } from '@/store/useMatchStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

export function LivePlayerSelection() {
  const { setup, currentInnings, firstInnings, secondInnings, setStriker, setNonStriker, setBowler } = useMatchStore();

  if (!setup) return null;

  const currentStats = currentInnings === 1 ? firstInnings : secondInnings;
  const battingTeamPlayers = currentInnings === 1 ? setup.teamAPlayers : setup.teamBPlayers;
  const bowlingTeamPlayers = currentInnings === 1 ? setup.teamBPlayers : setup.teamAPlayers;

  if (!currentStats) return null;

  // Find players who haven't been out yet (for batting)
  const outPlayerNames = currentStats.fallOfWickets?.map(f => f.batsman) || [];
  const availableBatsmen = battingTeamPlayers.filter(p => 
    !outPlayerNames.includes(p.name) && 
    p.id !== currentStats.strikerId && 
    p.id !== currentStats.nonStrikerId
  );

  const availableBowlers = bowlingTeamPlayers.filter(p => p.id !== currentStats.currentBowlerId);

  const needsStriker = !currentStats.strikerId;
  const needsNonStriker = !currentStats.nonStrikerId && currentStats.strikerId; // Only ask for non-striker after striker is selected
  const needsBowler = !currentStats.currentBowlerId && currentStats.strikerId && currentStats.nonStrikerId;

  // ALL-OUT FIX: If we need a batsman but nobody is available, the innings is over.
  // page.tsx will unmount us soon.
  const needsBatter = needsStriker || needsNonStriker;
  const isAllOut = needsBatter && availableBatsmen.length === 0;

  if (isAllOut) return null; // Don't render empty modal
  if (!needsStriker && !needsNonStriker && !needsBowler) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm glass-panel p-8 rounded-[2.5rem] border border-white/20 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight">
            {needsStriker && 'Select Striker'}
            {needsNonStriker && 'Select Non-Striker'}
            {needsBowler && 'Select Bowler'}
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            {needsStriker || needsNonStriker ? 'Who is coming to bat?' : 'Who will bowl this over?'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto no-scrollbar pr-1">
          {(needsStriker || needsNonStriker ? availableBatsmen : availableBowlers).map(player => (
            <Button
              key={player.id}
              variant="ghost"
              onClick={() => {
                if (needsStriker) setStriker(player.id);
                else if (needsNonStriker) setNonStriker(player.id);
                else if (needsBowler) setBowler(player.id);
              }}
              className="h-14 text-lg font-bold rounded-2xl border-2 border-white/10 hover:border-primary/50 transition-all"
            >
              {player.name}
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
