'use client';
import { useState } from 'react';
import { useMatchStore } from '@/store/useMatchStore';
import { useMatchTimer } from '@/hooks/useMatchTimer';
import { OverScorecardPanel } from './OverScorecardPanel';
import { ShareScoreModal } from './ShareScoreModal';
import { ListOrdered, Share2, Clock } from 'lucide-react';

export function Scoreboard() {
  const { setup, currentInnings, firstInnings, secondInnings, target, matchStartTime } = useMatchStore();
  const elapsed = useMatchTimer(matchStartTime ?? null);
  const [showScorecard, setShowScorecard] = useState(false);
  const [showShare, setShowShare] = useState(false);

  if (!setup) return null;

  const currentStats = currentInnings === 1 ? firstInnings : secondInnings!;

  // Required Run Rate
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

  // Current Run Rate
  const currentRunRate =
    currentStats.overs > 0
      ? currentStats.score / currentStats.overs
      : 0;

  const recentBalls = [...currentStats.balls].slice(-6);

  const teamAColor = setup.teamAColor || '#3b82f6';
  const teamBColor = setup.teamBColor || '#ef4444';
  const currentTeamColor = currentInnings === 1 ? teamAColor : teamBColor;

  return (
    <>
      <div className="w-full glass-panel border-x-0 rounded-b-3xl sticky top-0 z-10 overflow-hidden shadow-xl">
        <div className="p-4 max-w-md mx-auto space-y-3">
          {/* Top Row: Absolute Centered Teams, Buttons on Left */}
          <div className="relative flex items-center justify-between min-h-[40px]">
            {/* Left Actions */}
            <div className="flex items-center space-x-2 z-10">
              <button
                onClick={() => setShowShare(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-primary/5 hover:bg-primary/10 transition-colors border border-white/5 shadow-sm"
                title="Share Score"
              >
                <Share2 className="w-4.5 h-4.5 text-primary" />
              </button>
              <button
                onClick={() => setShowScorecard(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-primary/5 hover:bg-primary/10 transition-colors border border-white/5 shadow-sm"
                title="Over Scorecard"
              >
                <ListOrdered className="w-4.5 h-4.5 text-primary" />
              </button>
            </div>

            {/* Centered Teams */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center space-x-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-background/30 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm shadow-inner">
                <span style={{ color: teamAColor }}>{setup.teamA}</span>
                <span className="opacity-20 font-bold italic">vs</span>
                <span style={{ color: teamBColor }}>{setup.teamB}</span>
              </div>
            </div>

            {/* Empty space for TopBar buttons on the right */}
            <div className="w-24 md:w-0" aria-hidden="true" />
          </div>

          {/* Score + Timer + Innings Row */}
          <div className="flex justify-between items-center bg-background/20 rounded-2xl p-3 border border-white/5 shadow-inner">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 mb-1">
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter"
                  style={{ backgroundColor: `${currentTeamColor}20`, color: currentTeamColor }}
                >
                  Innings {currentInnings}
                </span>
                <span className="flex items-center text-[9px] font-bold text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                  <Clock className="w-2.5 h-2.5 mr-1 opacity-60" />
                  {elapsed}
                </span>
              </div>
              <div className="flex items-baseline space-x-1">
                <h1
                  className="text-5xl font-black tracking-tighter score-pop leading-none"
                  style={{ color: currentTeamColor }}
                >
                  {currentStats.score}
                  <span className="text-3xl font-medium text-muted-foreground/50 ml-1">/{currentStats.wickets}</span>
                </h1>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-0.5">Overs</p>
              <p className="text-3xl font-black font-mono leading-none">
                {currentStats.overs.toFixed(1)}
                <span className="text-sm text-muted-foreground/40 font-bold">/{setup.totalOvers}</span>
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="flex justify-between items-center px-1 text-[11px] font-bold border-t border-white/5 pt-2">
            {currentInnings === 2 && target ? (
              <>
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase text-muted-foreground tracking-tighter mb-0.5">Target</span>
                  <span className="text-foreground leading-none">{target}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] uppercase text-muted-foreground tracking-tighter mb-0.5">To Win</span>
                  <span className="text-foreground leading-none">
                    {Math.max(0, runsNeeded)} <span className="opacity-40 font-medium">in</span> {Math.max(0, ballsRemaining)}b
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] uppercase text-muted-foreground tracking-tighter mb-0.5">RRR</span>
                  <span className="text-foreground leading-none">{requiredRunRate > 0 ? requiredRunRate.toFixed(2) : '–'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase text-muted-foreground tracking-tighter mb-0.5">Run Rate</span>
                  <span className="text-foreground leading-none">{currentRunRate > 0 ? currentRunRate.toFixed(2) : '–'}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] uppercase text-muted-foreground tracking-tighter mb-0.5">Total Balls</span>
                  <span className="text-foreground leading-none">{currentStats.totalBalls}</span>
                </div>
              </>
            )}
          </div>

          {/* Recent Balls */}
          <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pt-1">
            {recentBalls.length > 0 ? (
              recentBalls.map((ball) => {
                let label = ball.runs.toString();
                let bgColor = 'bg-secondary/40 text-secondary-foreground';
                if (ball.isWicket) { label = 'W'; bgColor = 'bg-destructive text-destructive-foreground wicket-shake'; }
                else if (ball.isBoundary && ball.runs === 4) { label = '4'; bgColor = 'bg-blue-500 text-white'; }
                else if (ball.isSix && ball.runs === 6) { label = '6'; bgColor = 'bg-purple-600 text-white'; }
                else if (ball.extras.type !== 'none') {
                  const type = ball.extras.type === 'wide' ? 'wd' : ball.extras.type === 'no-ball' ? 'nb' : 'lb';
                  label = `${ball.runs + ball.extras.runs}${type}`; bgColor = 'bg-amber-500 text-white';
                }
                return (
                  <div key={ball.id} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${bgColor} border border-white/5`}>
                    {label}
                  </div>
                );
              })
            ) : (
              <span className="text-[10px] text-muted-foreground italic opacity-40">Ready to start over...</span>
            )}
          </div>
        </div>
      </div>

      <OverScorecardPanel isOpen={showScorecard} onClose={() => setShowScorecard(false)} />
      <ShareScoreModal isOpen={showShare} onClose={() => setShowShare(false)} />
    </>
  );
}
