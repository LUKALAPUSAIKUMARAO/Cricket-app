'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';
import { POTMCandidate } from '@/lib/matchStats';

interface PlayerOfTheMatchProps {
  candidate: POTMCandidate | null;
}

export function PlayerOfTheMatch({ candidate }: PlayerOfTheMatchProps) {
  if (!candidate) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      className="relative overflow-hidden rounded-[2rem] border border-yellow-500/20"
      style={{
        background: 'linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(168,85,247,0.05) 50%, rgba(234,179,8,0.03) 100%)',
      }}
    >
      {/* Subtle glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative p-6 space-y-5">
        {/* Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-500/80">
                Player of the Match
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-black text-yellow-500">{candidate.impactScore}</span>
          </div>
        </div>

        {/* Player name and team */}
        <div>
          <h3 className="text-2xl font-black tracking-tight text-foreground">
            {candidate.name}
          </h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
            {candidate.team}
          </p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3">
          {candidate.battingRuns > 0 && (
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">Batting</p>
              <p className="text-xl font-black text-foreground leading-none">
                {candidate.battingRuns}
                <span className="text-xs text-muted-foreground/50 font-bold ml-1">runs</span>
              </p>
              <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                SR {candidate.battingSR}
              </p>
            </div>
          )}
          {candidate.bowlingWickets > 0 && (
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">Bowling</p>
              <p className="text-xl font-black text-foreground leading-none">
                {candidate.bowlingWickets}
                <span className="text-xs text-muted-foreground/50 font-bold ml-1">wkts</span>
              </p>
              <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                Eco {candidate.bowlingEco}
              </p>
            </div>
          )}
        </div>

        {/* Impact breakdown */}
        {candidate.breakdown.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Impact Breakdown</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.breakdown.slice(0, 5).map((b, i) => (
                <span
                  key={i}
                  className="inline-flex items-center space-x-1 text-[10px] font-bold bg-white/5 px-2 py-1 rounded-md border border-white/5"
                >
                  <Star className="w-2.5 h-2.5 text-yellow-500/60" />
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="text-foreground">+{b.value}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
