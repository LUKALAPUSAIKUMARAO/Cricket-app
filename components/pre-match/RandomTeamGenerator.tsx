'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Check, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { PlayerInput } from './PlayerInput';
import { useMatchStore, Player } from '@/store/useMatchStore';

interface RandomTeamGeneratorProps {
  onComplete: () => void;
}

export function RandomTeamGenerator({ onComplete }: RandomTeamGeneratorProps) {
  const { setup, setSetup, setRecentPlayers } = useMatchStore();
  const [players, setPlayers] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);

  const generateTeams = () => {
    if (players.length < 4 || !setup) return;

    // Shuffle players
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    
    // Save to recent players
    setRecentPlayers(players);

    // Split teams
    const mid = Math.ceil(shuffled.length / 2);
    const teamAPlayers: Player[] = shuffled.slice(0, mid).map(name => ({
      id: Math.random().toString(36).substring(7),
      name
    }));
    const teamBPlayers: Player[] = shuffled.slice(mid).map(name => ({
      id: Math.random().toString(36).substring(7),
      name
    }));

    setSetup({
      ...setup,
      teamAPlayers,
      teamBPlayers
    });
    setGenerated(true);
  };

  const reshuffle = () => {
    setGenerated(false);
    setTimeout(generateTeams, 50);
  };

  if (!setup) return null;

  return (
    <div className="space-y-6 pt-4">
      {!generated ? (
        <div className="space-y-6">
          <PlayerInput players={players} setPlayers={setPlayers} />
          
          <Button
            onClick={generateTeams}
            disabled={players.length < 4}
            className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl transition-all active:scale-95"
          >
            <Shuffle className="w-5 h-5 mr-2" />
            Generate Teams
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TeamCard 
              name={setup.teamA} 
              color={setup.teamAColor} 
              players={setup.teamAPlayers} 
            />
            <TeamCard 
              name={setup.teamB} 
              color={setup.teamBColor} 
              players={setup.teamBPlayers} 
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={reshuffle}
              className="flex-1 h-14 rounded-2xl border-2 border-white/10 glass-panel hover:bg-white/5"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              Reshuffle
            </Button>
            <Button
              onClick={onComplete}
              className="flex-1 h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20"
            >
              Confirm Teams
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function TeamCard({ name, color, players }: { name: string, color: string, players: Player[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[2rem] overflow-hidden border border-white/10"
    >
      <div 
        className="px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: `${color}20`, borderBottom: `2px solid ${color}40` }}
      >
        <h3 className="font-black text-xl tracking-tight" style={{ color }}>{name}</h3>
        <span className="text-xs font-black px-2 py-1 rounded-md bg-white/10 text-muted-foreground uppercase">
          {players.length} Players
        </span>
      </div>
      <div className="p-6 space-y-2">
        {players.map((p, i) => (
          <div key={p.id} className="flex items-center space-x-3 text-sm font-medium opacity-90">
            <span className="w-5 text-muted-foreground text-[10px] font-black">{i + 1}</span>
            <span>{p.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
