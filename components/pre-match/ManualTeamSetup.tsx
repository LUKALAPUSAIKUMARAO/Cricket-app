'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { PlayerInput } from './PlayerInput';
import { useMatchStore, Player } from '@/store/useMatchStore';

interface ManualTeamSetupProps {
  onComplete: () => void;
}

export function ManualTeamSetup({ onComplete }: ManualTeamSetupProps) {
  const { setup, setSetup, setRecentPlayers } = useMatchStore();
  const [teamAPlayerNames, setTeamAPlayerNames] = useState<string[]>([]);
  const [teamBPlayerNames, setTeamBPlayerNames] = useState<string[]>([]);

  const handleComplete = () => {
    if (!setup || teamAPlayerNames.length === 0 || teamBPlayerNames.length === 0) return;

    // Save to recent players
    setRecentPlayers([...teamAPlayerNames, ...teamBPlayerNames]);

    const teamAPlayers: Player[] = teamAPlayerNames.map(name => ({
      id: Math.random().toString(36).substring(7),
      name
    }));
    const teamBPlayers: Player[] = teamBPlayerNames.map(name => ({
      id: Math.random().toString(36).substring(7),
      name
    }));

    setSetup({
      ...setup,
      teamAPlayers,
      teamBPlayers
    });

    onComplete();
  };

  if (!setup) return null;

  return (
    <div className="space-y-8 pt-4">
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1" style={{ color: setup.teamAColor }}>
            {setup.teamA} Players
          </label>
          <PlayerInput players={teamAPlayerNames} setPlayers={setTeamAPlayerNames} minPlayers={1} />
        </div>

        <div className="w-full h-px bg-white/10" />

        <div className="space-y-3">
          <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1" style={{ color: setup.teamBColor }}>
            {setup.teamB} Players
          </label>
          <PlayerInput players={teamBPlayerNames} setPlayers={setTeamBPlayerNames} minPlayers={1} />
        </div>
      </div>

      <Button
        onClick={handleComplete}
        disabled={teamAPlayerNames.length === 0 || teamBPlayerNames.length === 0}
        className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95"
      >
        Continue to Toss
        <ArrowRight className="w-6 h-6 ml-2" />
      </Button>
    </div>
  );
}
