'use client';

import { motion } from 'framer-motion';
import { Users, UserPlus } from 'lucide-react';

interface TeamSelectionProps {
  onSelectRandom: () => void;
  onSelectManual: () => void;
}

export function TeamSelection({ onSelectRandom, onSelectManual }: TeamSelectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSelectRandom}
        className="group relative overflow-hidden glass-panel p-8 rounded-[2rem] border border-white/20 text-left space-y-4 hover:border-primary/50 transition-colors"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Generate Random</h3>
          <p className="text-muted-foreground text-sm">Create balanced random teams instantly.</p>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Users className="w-24 h-24" />
        </div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSelectManual}
        className="group relative overflow-hidden glass-panel p-8 rounded-[2rem] border border-white/20 text-left space-y-4 hover:border-primary/50 transition-colors"
      >
        <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
          <UserPlus className="w-8 h-8 text-secondary-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Use Existing Teams</h3>
          <p className="text-muted-foreground text-sm">Manually add players to each team.</p>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <UserPlus className="w-24 h-24" />
        </div>
      </motion.button>
    </div>
  );
}
