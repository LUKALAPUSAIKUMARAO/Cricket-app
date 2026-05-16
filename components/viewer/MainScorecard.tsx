'use client';
import { useMatchStore } from '@/store/useMatchStore';

export function MainScorecard() {
  const { setup, currentInnings, firstInnings, secondInnings, target } = useMatchStore();

  if (!setup) return null;

  const currentStats = currentInnings === 1 ? firstInnings : secondInnings!;
  
  const currentRunRate = currentStats.overs > 0 
    ? (currentStats.score / currentStats.overs) 
    : 0;

  let requiredRunRate = 0;
  let runsNeeded = 0;
  let ballsRemaining = 0;

  if (currentInnings === 2 && target) {
    runsNeeded = target - currentStats.score;
    ballsRemaining = setup.totalOvers * 6 - currentStats.totalBalls;
    if (ballsRemaining > 0) {
      requiredRunRate = runsNeeded / (ballsRemaining / 6);
    }
  }

  const teamAColor = setup.teamAColor || '#3b82f6';
  const teamBColor = setup.teamBColor || '#ef4444';
  const currentTeamColor = currentInnings === 1 ? teamAColor : teamBColor;

  return (
    <div className="mx-4 mt-4 relative overflow-hidden rounded-[2rem] glass-card p-6 border border-black/10 dark:border-white/10 shadow-2xl">
      {/* Background Glow */}
      <div 
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-30"
        style={{ backgroundColor: currentTeamColor }}
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <h2 
          className="text-[12px] font-black uppercase tracking-[0.2em] mb-2"
          style={{ color: currentTeamColor }}
        >
          {currentInnings === 1 ? setup.teamA : setup.teamB} INNINGS
        </h2>
        
        <div className="flex items-baseline justify-center space-x-1 mb-1">
          <span className="text-7xl font-black tracking-tighter leading-none" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            {currentStats.score}
          </span>
          <span className="text-4xl font-bold text-foreground/70">
            /{currentStats.wickets}
          </span>
        </div>
        
        <div className="text-sm font-black text-foreground/70 uppercase tracking-widest mb-6">
          Overs <span className="text-foreground text-lg">{currentStats.overs.toFixed(1)}</span>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-4 border-t border-black/5 dark:border-white/5 pt-5">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase text-foreground/70 tracking-widest mb-1">CRR</span>
            <span className="text-xl font-bold font-mono text-foreground">{currentRunRate.toFixed(2)}</span>
          </div>
          
          {currentInnings === 2 && target ? (
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-foreground/70 tracking-widest mb-1">RRR</span>
              <span className="text-xl font-bold font-mono text-foreground">{requiredRunRate > 0 ? requiredRunRate.toFixed(2) : '–'}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-foreground/70 tracking-widest mb-1">Proj. Score</span>
              <span className="text-xl font-bold font-mono text-foreground/70">
                {Math.round(currentRunRate * setup.totalOvers)}
              </span>
            </div>
          )}
        </div>

        {/* Target Message */}
        {currentInnings === 2 && target && (
          <div className="w-full mt-4 text-center bg-primary/10 border border-primary/20 rounded-xl py-3 px-4">
            <p className="text-xs font-black tracking-widest uppercase text-primary">
              Need {Math.max(0, runsNeeded)} runs from {Math.max(0, ballsRemaining)} balls
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
