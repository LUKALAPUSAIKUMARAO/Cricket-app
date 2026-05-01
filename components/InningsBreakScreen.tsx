'use client';
import { useMatchStore } from '@/store/useMatchStore';
import { Button } from './ui/button';
import { Trophy } from 'lucide-react';

export function InningsBreakScreen() {
  const { setup, firstInnings, setInnings } = useMatchStore();

  if (!setup) return null;

  // Target = 1st innings score + 1 (to beat, not tie)
  const target = firstInnings.score + 1;

  const handleStart = () => {
    setInnings(2, target);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-sm space-y-6 glass-panel p-8 rounded-[2rem] shadow-2xl relative z-10 border border-white/20">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground drop-shadow-md">
            Innings Break!
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            1st Innings Complete
          </p>
        </div>

        {/* 1st Innings Summary */}
        <div className="bg-background/40 rounded-2xl p-5 border border-border/50 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {setup.teamA}
            </span>
            <span className="text-sm text-muted-foreground">1st Innings</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <span
                className="text-5xl font-black"
                style={{ color: setup.teamAColor || '#3b82f6' }}
              >
                {firstInnings.score}
              </span>
              <span className="text-2xl font-bold text-muted-foreground">
                /{firstInnings.wickets}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-0.5">Overs</p>
              <p className="text-xl font-bold font-mono">
                {firstInnings.overs.toFixed(1)}
                <span className="text-sm text-muted-foreground">/{setup.totalOvers}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Target Banner */}
        <div
          className="rounded-2xl p-4 text-center"
          style={{ backgroundColor: `${setup.teamBColor || '#ef4444'}15`, border: `1px solid ${setup.teamBColor || '#ef4444'}30` }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            {setup.teamB} needs
          </p>
          <p className="text-4xl font-black" style={{ color: setup.teamBColor || '#ef4444' }}>
            {target}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            runs in {setup.totalOvers} overs to win
          </p>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStart}
          className="w-full h-14 text-lg font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform"
        >
          Start 2nd Innings 🏏
        </Button>
      </div>
    </div>
  );
}
