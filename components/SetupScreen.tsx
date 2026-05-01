'use client';
import { useState } from 'react';
import { useMatchStore } from '@/store/useMatchStore';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function SetupScreen() {
  const setSetup = useMatchStore((state) => state.setSetup);
  const [matchName, setMatchName] = useState('');
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [overs, setOvers] = useState('');
  const [teamAColor, setTeamAColor] = useState('#3b82f6');
  const [teamBColor, setTeamBColor] = useState('#ef4444');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA || !teamB || !overs) return;
    setSetup({
      matchName: matchName || 'Friendly Match',
      teamA,
      teamB,
      totalOvers: Number(overs),
      teamAColor,
      teamBColor,
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-sm space-y-6 glass-panel p-8 rounded-[2rem] shadow-2xl relative z-10 border border-white/20">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-md">New Match</h1>
          <p className="text-muted-foreground text-sm font-medium">Enter match details to begin scoring</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <Input
              placeholder="Match Name (Optional)"
              value={matchName}
              onChange={(e) => setMatchName(e.target.value)}
              className="h-14 text-lg bg-background/50 backdrop-blur-sm border-2 focus-visible:ring-offset-0 focus-visible:ring-primary/50 rounded-xl"
            />

            {/* Team A */}
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={teamAColor}
                onChange={(e) => setTeamAColor(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent shrink-0 appearance-none p-0"
                style={{ WebkitAppearance: 'none' }}
                title="Pick Team A color"
              />
              <Input
                required
                placeholder="Team A"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                className="h-14 text-lg bg-background/50 backdrop-blur-sm border-2 focus-visible:ring-offset-0 focus-visible:ring-primary/50 rounded-xl"
              />
            </div>

            {/* Team B */}
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={teamBColor}
                onChange={(e) => setTeamBColor(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent shrink-0 appearance-none p-0"
                style={{ WebkitAppearance: 'none' }}
                title="Pick Team B color"
              />
              <Input
                required
                placeholder="Team B"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                className="h-14 text-lg bg-background/50 backdrop-blur-sm border-2 focus-visible:ring-offset-0 focus-visible:ring-primary/50 rounded-xl"
              />
            </div>

            <Input
              required
              type="number"
              min="1"
              placeholder="Total Overs"
              value={overs}
              onChange={(e) => setOvers(e.target.value)}
              className="h-14 text-lg bg-background/50 backdrop-blur-sm border-2 focus-visible:ring-offset-0 focus-visible:ring-primary/50 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform"
          >
            Start Match 🏏
          </Button>
        </form>
      </div>
    </div>
  );
}
