'use client';
import { useState } from 'react';
import { useMatchStore } from '@/store/useMatchStore';
import { useMatchTimer } from '@/hooks/useMatchTimer';
import { OverScorecardPanel } from './OverScorecardPanel';
import { ShareScoreModal } from './ShareScoreModal';
import { ListOrdered, Share2 } from 'lucide-react';

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
          {/* Teams + Timer + Utility Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span style={{ color: teamAColor }}>{setup.teamA}</span>
              <span className="opacity-40">v</span>
              <span style={{ color: teamBColor }}>{setup.teamB}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-muted-foreground">⏱ {elapsed}</span>
              <button
                onClick={() => setShowShare(true)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                title="Share Score"
              >
                <Share2 className="w-3.5 h-3.5 text-primary" />
              </button>
              <button
                onClick={() => setShowScorecard(true)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                title="Over Scorecard"
              >
                <ListOrdered className="w-3.5 h-3.5 text-primary" />
              </button>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${currentTeamColor}20`, color: currentTeamColor }}
              >
                Inn. {currentInnings}
              </span>
            </div>
          </div>

          {/* Main Score */}
          <div className="flex justify-between items-end">
            <div className="flex items-baseline space-x-2">
              <h1
                className="text-5xl font-black tracking-tighter"
                style={{ color: currentTeamColor }}
              >
                {currentStats.score}
                <span className="text-3xl font-medium text-muted-foreground">/{currentStats.wickets}</span>
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Overs</p>
              <p className="text-3xl font-bold font-mono">
                {currentStats.overs.toFixed(1)}
                <span className="text-lg text-muted-foreground">/{setup.totalOvers}</span>
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex justify-between items-center pt-1 border-t border-border/50 text-xs font-medium">
            {currentInnings === 2 && target ? (
              <>
                <span className="text-muted-foreground">
                  Target <span className="text-foreground font-bold">{target}</span>
                </span>
                <span className="text-muted-foreground">
                  Need <span className="text-foreground font-bold">{Math.max(0, runsNeeded)}</span> off <span className="text-foreground font-bold">{Math.max(0, ballsRemaining)}</span>b
                </span>
                <span className="text-muted-foreground">
                  RRR <span className="text-foreground font-bold">{requiredRunRate > 0 ? requiredRunRate.toFixed(2) : '–'}</span>
                </span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">
                  CRR <span className="text-foreground font-bold">{currentRunRate > 0 ? currentRunRate.toFixed(2) : '–'}</span>
                </span>
                <span className="text-muted-foreground">
                  Balls <span className="text-foreground font-bold">{currentStats.totalBalls}</span>
                </span>
              </>
            )}
          </div>

          {/* Last 6 Balls */}
          <div className="flex items-center space-x-2 h-9">
            <span className="text-xs font-semibold text-muted-foreground w-12">Recent:</span>
            <div className="flex space-x-1.5 flex-1 overflow-x-auto no-scrollbar">
              {recentBalls.map((ball) => {
                let label = ball.runs.toString();
                let bgColor = 'bg-secondary text-secondary-foreground';

                if (ball.isWicket) {
                  label = 'W'; bgColor = 'bg-destructive text-destructive-foreground';
                } else if (ball.isBoundary && ball.runs === 4) {
                  label = '4'; bgColor = 'bg-blue-500 text-white';
                } else if (ball.isSix && ball.runs === 6) {
                  label = '6'; bgColor = 'bg-purple-600 text-white';
                } else if (ball.extras.type !== 'none') {
                  const shortExtra = ball.extras.type === 'wide' ? 'wd'
                    : ball.extras.type === 'no-ball' ? 'nb'
                    : ball.extras.type === 'leg-bye' ? 'lb' : 'b';
                  label = `${ball.runs + ball.extras.runs}${shortExtra}`;
                  bgColor = 'bg-amber-500 text-white';
                } else if (ball.runs === 0) {
                  label = '·';
                }

                return (
                  <div
                    key={ball.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${bgColor} transition-all`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <OverScorecardPanel isOpen={showScorecard} onClose={() => setShowScorecard(false)} />
      <ShareScoreModal isOpen={showShare} onClose={() => setShowShare(false)} />
    </>
  );
}
