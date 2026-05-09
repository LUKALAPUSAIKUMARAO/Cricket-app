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
      <div 
        className="w-full glass-panel border-x-0 rounded-b-[2.5rem] sticky top-0 z-10 overflow-hidden"
        style={{ boxShadow: `0 20px 40px -12px ${currentTeamColor}20, inset 0 -1px 0 rgba(255,255,255,0.05)` }}
      >
        <div className="p-4 max-w-md mx-auto space-y-4">
          
          {/* Top Row: Utility Spacing */}
          <div className="flex justify-between items-center h-9">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowShare(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full glass-button"
                title="Share Score"
              >
                <Share2 className="w-4.5 h-4.5 text-foreground" />
              </button>
              <button
                onClick={() => setShowScorecard(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full glass-button"
                title="Over Scorecard"
              >
                <ListOrdered className="w-4.5 h-4.5 text-foreground" />
              </button>
            </div>
            <div className="w-40 md:w-0" aria-hidden="true" />
          </div>

          {/* Centered Identity Row: Perfect Symmetry */}
          <div className="flex justify-center -mt-2">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 glass-card px-6 py-2.5 rounded-full min-w-[240px]">
              <span 
                className="text-right text-[11px] font-black uppercase tracking-widest truncate drop-shadow-md"
                style={{ color: teamAColor }}
              >
                {setup.teamA}
              </span>
              <span className="text-[9px] font-black italic lowercase text-muted-foreground opacity-30 px-1">vs</span>
              <span 
                className="text-left text-[11px] font-black uppercase tracking-widest truncate drop-shadow-md"
                style={{ color: teamBColor }}
              >
                {setup.teamB}
              </span>
            </div>
          </div>

          {/* Main Score Area */}
          <div className="flex justify-between items-center glass-card rounded-[1.5rem] p-5 relative overflow-hidden">
            {/* Dynamic Team Gradient Aura */}
            <div 
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: currentTeamColor }}
            />

            <div className="flex flex-col relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                <span
                  className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ backgroundColor: `${currentTeamColor}15`, color: currentTeamColor, border: `1px solid ${currentTeamColor}30` }}
                >
                  Innings {currentInnings}
                </span>
                <span className="flex items-center text-[10px] font-bold text-muted-foreground bg-white/[0.03] px-2.5 py-0.5 rounded-full border border-white/5">
                  <Clock className="w-3 h-3 mr-1 opacity-60" />
                  {elapsed}
                </span>
              </div>
              <div className="flex items-baseline space-x-1">
                <h1
                  className="text-6xl font-black tracking-tighter score-pop leading-none drop-shadow-lg"
                  style={{ color: currentTeamColor, textShadow: `0 0 30px ${currentTeamColor}40` }}
                >
                  {currentStats.score}
                  <span className="text-3xl font-medium text-muted-foreground/30 ml-1">/{currentStats.wickets}</span>
                </h1>
              </div>
            </div>

            <div className="text-right relative z-10">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-1">Overs</p>
              <p className="text-4xl font-black font-mono leading-none tracking-tight text-foreground/90">
                {currentStats.overs.toFixed(1)}
                <span className="text-base text-muted-foreground/30 font-bold ml-0.5">/{setup.totalOvers}</span>
              </p>
            </div>
          </div>

          {/* Summary Row */}
          <div className="flex justify-between items-center px-4 text-[12px] font-bold pt-1">
            {currentInnings === 2 && target ? (
              <>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-muted-foreground tracking-widest mb-1">Target</span>
                  <span className="text-foreground text-sm leading-none">{target}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase text-muted-foreground tracking-widest mb-1">To Win</span>
                  <span className="text-foreground text-sm leading-none">
                    {Math.max(0, runsNeeded)} <span className="opacity-40 font-medium text-xs">in</span> {Math.max(0, ballsRemaining)}b
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase text-muted-foreground tracking-widest mb-1">RRR</span>
                  <span className="text-foreground text-sm leading-none">{requiredRunRate > 0 ? requiredRunRate.toFixed(2) : '–'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-muted-foreground tracking-widest mb-1">Run Rate</span>
                  <span className="text-foreground text-sm leading-none">{currentRunRate > 0 ? currentRunRate.toFixed(2) : '–'}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase text-muted-foreground tracking-widest mb-1">Balls</span>
                  <span className="text-foreground text-sm leading-none">{currentStats.totalBalls}</span>
                </div>
              </>
            )}
          </div>

          {/* Ball History */}
          <div className="flex space-x-3 overflow-x-auto no-scrollbar pt-2 pb-1">
            {recentBalls.length > 0 ? (
              recentBalls.map((ball) => {
                let label = ball.runs.toString();
                let bgColor = 'bg-secondary/40 text-secondary-foreground border-white/5';
                if (ball.isWicket) { label = 'W'; bgColor = 'bg-destructive text-destructive-foreground wicket-shake shadow-[0_0_15px_rgba(153,27,27,0.5)] border-destructive/50'; }
                else if (ball.isBoundary && ball.runs === 4) { label = '4'; bgColor = 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border-blue-400/50'; }
                else if (ball.isSix && ball.runs === 6) { label = '6'; bgColor = 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] border-purple-400/50'; }
                else if (ball.extras.type !== 'none') {
                  const type = ball.extras.type === 'wide' ? 'wd' : ball.extras.type === 'no-ball' ? 'nb' : 'lb';
                  label = `${ball.runs + ball.extras.runs}${type}`; bgColor = 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)] border-amber-400/50';
                }
                return (
                  <div key={ball.id} className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${bgColor} border shadow-sm`}>
                    {label}
                  </div>
                );
              })
            ) : (
              <span className="text-[11px] text-muted-foreground italic opacity-40 py-2">Score first ball...</span>
            )}
          </div>

          {/* Current Players Section */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.08]">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Batsmen</p>
              <div className="space-y-2">
                <PlayerRow 
                  id={currentStats.strikerId} 
                  isStriker 
                  balls={currentStats.balls} 
                  teamPlayers={currentInnings === 1 ? setup.teamAPlayers : setup.teamBPlayers}
                />
                <PlayerRow 
                  id={currentStats.nonStrikerId} 
                  balls={currentStats.balls} 
                  teamPlayers={currentInnings === 1 ? setup.teamAPlayers : setup.teamBPlayers}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60 text-right">Bowler</p>
              <BowlerRow 
                id={currentStats.currentBowlerId} 
                balls={currentStats.balls} 
                teamPlayers={currentInnings === 1 ? setup.teamBPlayers : setup.teamAPlayers}
              />
            </div>
          </div>
        </div>
      </div>

      <OverScorecardPanel isOpen={showScorecard} onClose={() => setShowScorecard(false)} />
      <ShareScoreModal isOpen={showShare} onClose={() => setShowShare(false)} />
    </>
  );
}

function PlayerRow({ id, isStriker, balls, teamPlayers }: { id: string | null, isStriker?: boolean, balls: any[], teamPlayers: any[] }) {
  const player = teamPlayers.find(p => p.id === id);
  if (!id || !player) return (
    <div className="flex items-center space-x-2 opacity-30">
      <div className={`w-1.5 h-1.5 rounded-full ${isStriker ? 'bg-primary' : 'bg-transparent'}`} />
      <span className="text-[11px] font-bold">Select Batsman</span>
    </div>
  );

  const playerBalls = balls.filter(b => b.strikerId === id);
  const runs = playerBalls.reduce((sum, b) => sum + b.runs, 0);
  const faced = playerBalls.filter(b => !['wide'].includes(b.extras.type)).length;

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isStriker ? 'bg-primary animate-pulse' : 'bg-transparent'}`} />
        <span className={`text-[11px] font-black truncate max-w-[80px] ${isStriker ? 'text-foreground' : 'text-muted-foreground'}`}>
          {player.name}{isStriker && '*'}
        </span>
      </div>
      <span className="text-[11px] font-bold text-foreground/80">
        {runs}<span className="text-[9px] opacity-40 font-medium ml-0.5">({faced})</span>
      </span>
    </div>
  );
}

function BowlerRow({ id, balls, teamPlayers }: { id: string | null, balls: any[], teamPlayers: any[] }) {
  const player = teamPlayers.find(p => p.id === id);
  if (!id || !player) return (
    <div className="flex items-center justify-end space-x-2 opacity-30">
      <span className="text-[11px] font-bold">Select Bowler</span>
      <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
    </div>
  );

  const bowlerBalls = balls.filter(b => b.bowlerId === id);
  const runs = bowlerBalls.reduce((sum, b) => sum + b.runs + b.extras.runs + (['wide', 'no-ball'].includes(b.extras.type) ? 1 : 0), 0);
  const legalBalls = bowlerBalls.filter(b => !['wide', 'no-ball'].includes(b.extras.type)).length;
  const wickets = bowlerBalls.filter(b => b.isWicket).length;
  
  const overs = Math.floor(legalBalls / 6) + (legalBalls % 6) / 10;

  return (
    <div className="flex items-center justify-between w-full">
      <span className="text-[11px] font-bold text-foreground/80">
        {wickets}-{runs} <span className="text-[9px] opacity-40 font-medium ml-0.5">({overs.toFixed(1)})</span>
      </span>
      <div className="flex items-center space-x-2">
        <span className="text-[11px] font-black truncate max-w-[80px] text-foreground text-right">
          {player.name}
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
      </div>
    </div>
  );
}
