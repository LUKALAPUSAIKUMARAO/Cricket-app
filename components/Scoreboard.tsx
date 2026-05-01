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
          
          {/* Top Row: Utility Spacing */}
          <div className="flex justify-between items-center h-9">
            <div className="flex items-center space-x-2">
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
            <div className="w-40 md:w-0" aria-hidden="true" />
          </div>

          {/* Centered Identity Row: Perfect Symmetry */}
          <div className="flex justify-center -mt-1">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-background/40 px-5 py-2 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg ring-1 ring-white/5 min-w-[240px]">
              <span 
                className="text-right text-[11px] font-black uppercase tracking-widest truncate drop-shadow-sm"
                style={{ color: teamAColor }}
              >
                {setup.teamA}
              </span>
              <span className="text-[9px] font-black italic lowercase text-muted-foreground opacity-30 px-1">vs</span>
              <span 
                className="text-left text-[11px] font-black uppercase tracking-widest truncate drop-shadow-sm"
                style={{ color: teamBColor }}
              >
                {setup.teamB}
              </span>
            </div>
          </div>

          {/* Main Score Area */}
          <div className="flex justify-between items-center bg-background/20 rounded-2xl p-4 border border-white/5 shadow-inner mt-2">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 mb-1.5">
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter"
                  style={{ backgroundColor: `${currentTeamColor}20`, color: currentTeamColor }}
                >
                  Innings {currentInnings}
                </span>
                <span className="flex items-center text-[10px] font-bold text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  <Clock className="w-3 h-3 mr-1 opacity-60" />
                  {elapsed}
                </span>
              </div>
              <div className="flex items-baseline space-x-1">
                <h1
                  className="text-5xl font-black tracking-tighter score-pop leading-none"
                  style={{ color: currentTeamColor }}
                >
                  {currentStats.score}
                  <span className="text-3xl font-medium text-muted-foreground/40 ml-1">/{currentStats.wickets}</span>
                </h1>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-1">Overs</p>
              <p className="text-3xl font-black font-mono leading-none">
                {currentStats.overs.toFixed(1)}
                <span className="text-sm text-muted-foreground/30 font-bold">/{setup.totalOvers}</span>
              </p>
            </div>
          </div>

          {/* Summary Row */}
          <div className="flex justify-between items-center px-2 text-[12px] font-bold border-t border-white/5 pt-3">
            {currentInnings === 2 && target ? (
              <>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-muted-foreground tracking-tighter mb-0.5">Target</span>
                  <span className="text-foreground leading-none">{target}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase text-muted-foreground tracking-tighter mb-0.5">To Win</span>
                  <span className="text-foreground leading-none">
                    {Math.max(0, runsNeeded)} <span className="opacity-40 font-medium">in</span> {Math.max(0, ballsRemaining)}b
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase text-muted-foreground tracking-tighter mb-0.5">RRR</span>
                  <span className="text-foreground leading-none">{requiredRunRate > 0 ? requiredRunRate.toFixed(2) : '–'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-muted-foreground tracking-tighter mb-0.5">Run Rate</span>
                  <span className="text-foreground leading-none">{currentRunRate > 0 ? currentRunRate.toFixed(2) : '–'}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase text-muted-foreground tracking-tighter mb-0.5">Balls</span>
                  <span className="text-foreground leading-none">{currentStats.totalBalls}</span>
                </div>
              </>
            )}
          </div>

          {/* Ball History */}
          <div className="flex space-x-2 overflow-x-auto no-scrollbar pt-1">
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
                  <div key={ball.id} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${bgColor} border border-white/5 shadow-sm`}>
                    {label}
                  </div>
                );
              })
            ) : (
              <span className="text-[11px] text-muted-foreground italic opacity-40 py-2">Score first ball...</span>
            )}
          </div>
        </div>
      </div>

      <OverScorecardPanel isOpen={showScorecard} onClose={() => setShowScorecard(false)} />
      <ShareScoreModal isOpen={showShare} onClose={() => setShowShare(false)} />
    </>
  );
}
