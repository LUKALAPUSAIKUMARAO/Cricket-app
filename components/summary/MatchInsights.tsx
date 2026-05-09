'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap } from 'lucide-react';
import { OverData } from '@/lib/matchStats';

interface MatchInsightsProps {
  team1Overs: OverData[];
  team2Overs: OverData[];
  team1Name: string;
  team2Name: string;
  team1Color: string;
  team2Color: string;
  target: number | null;
}

export function MatchInsights({
  team1Overs, team2Overs,
  team1Name, team2Name,
  team1Color, team2Color,
  target,
}: MatchInsightsProps) {
  // Detect key turning points
  const turningPoints = useMemo(() => {
    const points: string[] = [];

    // Big overs (> 15 runs)
    team1Overs.forEach(o => {
      if (o.runs >= 15) points.push(`💥 ${team1Name} scored ${o.runs} in over ${o.over}`);
    });
    team2Overs.forEach(o => {
      if (o.runs >= 15) points.push(`💥 ${team2Name} scored ${o.runs} in over ${o.over}`);
    });

    // Multi-wicket overs
    team1Overs.forEach(o => {
      if (o.wickets >= 2) points.push(`🔥 ${o.wickets} wickets fell in over ${o.over} (${team1Name})`);
    });
    team2Overs.forEach(o => {
      if (o.wickets >= 2) points.push(`🔥 ${o.wickets} wickets fell in over ${o.over} (${team2Name})`);
    });

    return points.slice(0, 4);
  }, [team1Overs, team2Overs, team1Name, team2Name]);

  const maxOvers = Math.max(team1Overs.length, team2Overs.length, 1);
  const maxCumulative = Math.max(
    team1Overs[team1Overs.length - 1]?.cumulative || 0,
    team2Overs[team2Overs.length - 1]?.cumulative || 0,
    target || 0,
    1,
  );

  // SVG dimensions
  const svgW = 320;
  const svgH = 160;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 25;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const getX = (over: number) => padL + (over / maxOvers) * chartW;
  const getY = (runs: number) => padT + chartH - (runs / maxCumulative) * chartH;

  const team1Points = team1Overs.map(o => `${getX(o.over)},${getY(o.cumulative)}`).join(' ');
  const team2Points = team2Overs.map(o => `${getX(o.over)},${getY(o.cumulative)}`).join(' ');

  // Run rate bars
  const maxRunRate = Math.max(
    ...team1Overs.map(o => o.runs),
    ...team2Overs.map(o => o.runs),
    1,
  );

  return (
    <div className="space-y-6">
      {/* Worm Graph */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] rounded-2xl border border-white/5 p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
              Match Worm
            </h4>
          </div>
          <div className="flex space-x-4 text-[9px] font-bold">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-[2px] rounded-full" style={{ backgroundColor: team1Color }} />
              <span className="text-muted-foreground">{team1Name}</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-[2px] rounded-full" style={{ backgroundColor: team2Color }} />
              <span className="text-muted-foreground">{team2Name}</span>
            </span>
          </div>
        </div>

        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
            const y = padT + chartH * (1 - frac);
            const label = Math.round(maxCumulative * frac);
            return (
              <g key={frac}>
                <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x={padL - 4} y={y + 3} textAnchor="end" className="fill-muted-foreground" fontSize="8" fontWeight="bold">
                  {label}
                </text>
              </g>
            );
          })}

          {/* Over labels */}
          {Array.from({ length: maxOvers }, (_, i) => i + 1).map(over => (
            <text key={over} x={getX(over)} y={svgH - 5} textAnchor="middle" className="fill-muted-foreground" fontSize="8" fontWeight="bold">
              {over}
            </text>
          ))}

          {/* Target line */}
          {target && (
            <line
              x1={padL} y1={getY(target)} x2={svgW - padR} y2={getY(target)}
              stroke="rgba(239,68,68,0.3)" strokeWidth="1" strokeDasharray="4,4"
            />
          )}

          {/* Team 1 worm */}
          {team1Overs.length > 0 && (
            <>
              <polyline
                points={`${getX(0)},${getY(0)} ${team1Points}`}
                fill="none"
                stroke={team1Color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
              {team1Overs.map(o => (
                <circle key={`t1-${o.over}`} cx={getX(o.over)} cy={getY(o.cumulative)} r="3" fill={team1Color} opacity="0.8" />
              ))}
            </>
          )}

          {/* Team 2 worm */}
          {team2Overs.length > 0 && (
            <>
              <polyline
                points={`${getX(0)},${getY(0)} ${team2Points}`}
                fill="none"
                stroke={team2Color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
              {team2Overs.map(o => (
                <circle key={`t2-${o.over}`} cx={getX(o.over)} cy={getY(o.cumulative)} r="3" fill={team2Color} opacity="0.8" />
              ))}
            </>
          )}
        </svg>
      </motion.div>

      {/* Run Rate Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.02] rounded-2xl border border-white/5 p-4 space-y-3"
      >
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
            Runs Per Over
          </h4>
        </div>

        <div className="space-y-2">
          {Array.from({ length: maxOvers }, (_, i) => {
            const t1 = team1Overs[i];
            const t2 = team2Overs[i];
            return (
              <div key={i} className="flex items-center space-x-2">
                <span className="text-[9px] font-bold text-muted-foreground w-6 text-right shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 flex space-x-1 items-center h-5">
                  {/* Team 1 bar */}
                  <div className="flex-1 flex justify-end">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${t1 ? (t1.runs / maxRunRate) * 100 : 0}%` }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                      className="h-4 rounded-l-sm min-w-[2px]"
                      style={{ backgroundColor: team1Color, opacity: 0.7 }}
                    />
                  </div>
                  <div className="w-px h-5 bg-white/10 shrink-0" />
                  {/* Team 2 bar */}
                  <div className="flex-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${t2 ? (t2.runs / maxRunRate) * 100 : 0}%` }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                      className="h-4 rounded-r-sm min-w-[2px]"
                      style={{ backgroundColor: team2Color, opacity: 0.7 }}
                    />
                  </div>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <span className="text-[9px] font-black w-4 text-right" style={{ color: team1Color }}>
                    {t1?.runs ?? '-'}
                  </span>
                  <span className="text-[9px] font-black w-4" style={{ color: team2Color }}>
                    {t2?.runs ?? '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Key Turning Points */}
      {turningPoints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] rounded-2xl border border-white/5 p-4 space-y-3"
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
              Key Moments
            </h4>
          </div>
          <div className="space-y-2">
            {turningPoints.map((point, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-xs font-bold text-foreground/70 pl-2 border-l-2 border-yellow-500/30 py-1"
              >
                {point}
              </motion.p>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
