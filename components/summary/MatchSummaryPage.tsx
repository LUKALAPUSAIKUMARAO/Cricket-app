'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronDown } from 'lucide-react';
import { useMatchStore } from '@/store/useMatchStore';
import { Button } from '../ui/button';
import { ConfirmModal } from '../ConfirmModal';
import {
  computeBattingStats, computeBowlingStats, computeOverByOver,
  computePartnerships, computePOTM,
} from '@/lib/matchStats';
import { BattingSummary } from './BattingSummary';
import { BowlingSummary } from './BowlingSummary';
import { PlayerOfTheMatch } from './PlayerOfTheMatch';
import { MatchInsights } from './MatchInsights';
import { SocialShareCard } from './SocialShareCard';

export function MatchSummaryPage({ isViewer = false }: { isViewer?: boolean }) {
  const { setup, firstInnings, secondInnings, target, resetMatch, toss } = useMatchStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'winner' | 'loser'>('winner');

  if (!setup || !secondInnings) return null;

  // Determine winner
  const getWinnerInfo = () => {
    if (secondInnings.score > firstInnings.score) {
      const totalBatters = setup.teamBPlayers.length;
      return {
        winnerName: setup.teamB,
        winnerColor: setup.teamBColor,
        loserName: setup.teamA,
        loserColor: setup.teamAColor,
        margin: `${totalBatters - 1 - secondInnings.wickets} wickets`,
        winnerInnings: secondInnings,
        loserInnings: firstInnings,
        winnerPlayers: setup.teamBPlayers,
        loserPlayers: setup.teamAPlayers,
        winnerBowlingPlayers: setup.teamAPlayers,
        loserBowlingPlayers: setup.teamBPlayers,
      };
    } else if (firstInnings.score > secondInnings.score) {
      return {
        winnerName: setup.teamA,
        winnerColor: setup.teamAColor,
        loserName: setup.teamB,
        loserColor: setup.teamBColor,
        margin: `${firstInnings.score - secondInnings.score} runs`,
        winnerInnings: firstInnings,
        loserInnings: secondInnings,
        winnerPlayers: setup.teamAPlayers,
        loserPlayers: setup.teamBPlayers,
        winnerBowlingPlayers: setup.teamBPlayers,
        loserBowlingPlayers: setup.teamAPlayers,
      };
    }
    return null; // Tie
  };

  const winner = getWinnerInfo();
  const isTied = !winner;

  // Compute all stats
  const team1BatStats = useMemo(() => computeBattingStats(firstInnings, setup.teamAPlayers), [firstInnings, setup.teamAPlayers]);
  const team2BatStats = useMemo(() => computeBattingStats(secondInnings, setup.teamBPlayers), [secondInnings, setup.teamBPlayers]);
  const team1BowlStats = useMemo(() => computeBowlingStats(firstInnings, setup.teamBPlayers), [firstInnings, setup.teamBPlayers]);
  const team2BowlStats = useMemo(() => computeBowlingStats(secondInnings, setup.teamAPlayers), [secondInnings, setup.teamAPlayers]);
  const team1Overs = useMemo(() => computeOverByOver(firstInnings), [firstInnings]);
  const team2Overs = useMemo(() => computeOverByOver(secondInnings), [secondInnings]);

  const potm = useMemo(() => computePOTM(
    firstInnings, secondInnings,
    setup.teamAPlayers, setup.teamBPlayers,
    setup.teamA, setup.teamB,
    winner?.winnerName || null,
  ), [firstInnings, secondInnings, setup, winner]);

  // Current view data based on tab
  const currentTeam = isTied || activeTab === 'winner'
    ? { name: winner?.winnerName || setup.teamA, color: winner?.winnerColor || setup.teamAColor, batStats: winner ? (winner.winnerName === setup.teamA ? team1BatStats : team2BatStats) : team1BatStats, bowlStats: winner ? (winner.winnerName === setup.teamA ? team1BowlStats : team2BowlStats) : team1BowlStats, innings: winner?.winnerInnings || firstInnings }
    : { name: winner?.loserName || setup.teamB, color: winner?.loserColor || setup.teamBColor, batStats: winner ? (winner.loserName === setup.teamA ? team1BatStats : team2BatStats) : team2BatStats, bowlStats: winner ? (winner.loserName === setup.teamA ? team1BowlStats : team2BowlStats) : team2BowlStats, innings: winner?.loserInnings || secondInnings };

  // Headline for share
  const headline = isTied
    ? `🏏 ${setup.teamA} vs ${setup.teamB} — Match Tied!`
    : `🏏 ${winner!.winnerName} won by ${winner!.margin}!`;

  const scoreText = [
    `${setup.teamA}: ${firstInnings.score}/${firstInnings.wickets} (${firstInnings.overs.toFixed(1)} ov)`,
    `${setup.teamB}: ${secondInnings.score}/${secondInnings.wickets} (${secondInnings.overs.toFixed(1)} ov)`,
    potm ? `⭐ Player of the Match: ${potm.name}` : '',
  ].filter(Boolean).join('\n');

  return (
    <>
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar pb-28">
        {/* Winner Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${(winner?.winnerColor || '#888')}25 0%, transparent 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.08)_0%,transparent_60%)]" />

          <div className="relative px-6 pt-10 pb-8 text-center space-y-4">
            {/* Trophy */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: `radial-gradient(circle, ${(winner?.winnerColor || '#eab308')}20 0%, transparent 70%)` }}
            >
              <Trophy className="w-12 h-12 text-yellow-500 trophy-glow" />
            </motion.div>

            {/* Result */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-2">
                {isTied ? 'Match Result' : 'Match Winner'}
              </p>
              {isTied ? (
                <h1 className="text-3xl font-black tracking-tight text-yellow-500">Match Tied!</h1>
              ) : (
                <>
                  <h1 className="text-3xl font-black tracking-tight" style={{ color: winner!.winnerColor }}>
                    {winner!.winnerName}
                  </h1>
                  <p className="text-sm font-bold text-muted-foreground mt-1">
                    won by <span className="text-foreground font-black">{winner!.margin}</span>
                  </p>
                </>
              )}
            </motion.div>

            {/* Score summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center space-x-6"
            >
              <ScorePill team={setup.teamA} color={setup.teamAColor} score={firstInnings.score} wickets={firstInnings.wickets} overs={firstInnings.overs} label="1st" />
              <div className="w-px bg-white/10 self-stretch" />
              <ScorePill team={setup.teamB} color={setup.teamBColor} score={secondInnings.score} wickets={secondInnings.wickets} overs={secondInnings.overs} label="2nd" />
            </motion.div>

            {/* Toss info */}
            {toss && (
              <p className="text-[10px] text-muted-foreground/50 font-medium">
                Toss: {toss.winner} elected to {toss.decision} first
              </p>
            )}
          </div>
        </motion.div>

        {/* Content sections */}
        <div className="px-5 space-y-6 mt-2">
          {/* POTM */}
          <PlayerOfTheMatch candidate={potm} />

          {/* Team Tab Switcher */}
          {!isTied && (
            <div className="relative flex bg-white/[0.03] rounded-2xl border border-white/5 p-1">
              <motion.div
                className="absolute top-1 bottom-1 rounded-xl"
                style={{ 
                  width: 'calc(50% - 4px)',
                  background: `${activeTab === 'winner' ? winner!.winnerColor : winner!.loserColor}15`,
                  border: `1px solid ${activeTab === 'winner' ? winner!.winnerColor : winner!.loserColor}30`,
                }}
                animate={{ x: activeTab === 'winner' ? 2 : 'calc(100% + 6px)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => setActiveTab('winner')}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider relative z-10 transition-colors"
                style={{ color: activeTab === 'winner' ? winner!.winnerColor : '#64748b' }}
              >
                {winner!.winnerName}
              </button>
              <button
                onClick={() => setActiveTab('loser')}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider relative z-10 transition-colors"
                style={{ color: activeTab === 'loser' ? winner!.loserColor : '#64748b' }}
              >
                {winner!.loserName}
              </button>
            </div>
          )}

          {/* Detailed Scorecards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'winner' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'winner' ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Score header */}
              <div className="flex items-center justify-between bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight" style={{ color: currentTeam.color }}>
                    {currentTeam.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    {currentTeam.name === setup.teamA ? '1st Innings' : '2nd Innings'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black leading-none" style={{ color: currentTeam.color }}>
                    {currentTeam.innings.score}
                    <span className="text-lg text-muted-foreground/40 font-bold">/{currentTeam.innings.wickets}</span>
                  </p>
                  <p className="text-xs text-muted-foreground font-bold mt-0.5">
                    ({currentTeam.innings.overs.toFixed(1)} ov)
                  </p>
                </div>
              </div>

              <BattingSummary stats={currentTeam.batStats} teamColor={currentTeam.color} teamName={currentTeam.name} />
              <BowlingSummary stats={currentTeam.bowlStats} teamColor={currentTeam.color} />
            </motion.div>
          </AnimatePresence>

          {/* Match Insights */}
          <div className="pt-2">
            <MatchInsights
              team1Overs={team1Overs}
              team2Overs={team2Overs}
              team1Name={setup.teamA}
              team2Name={setup.teamB}
              team1Color={setup.teamAColor}
              team2Color={setup.teamBColor}
              target={target}
            />
          </div>

          {/* Social Share */}
          <div className="pt-2">
            <SocialShareCard
              headline={headline}
              scoreText={scoreText}
              matchName={setup.matchName}
            />
          </div>

          {/* New Match */}
          {!isViewer && (
            <div className="pt-4 pb-8">
              <Button
                onClick={() => setShowConfirm(true)}
                className="w-full h-16 text-lg font-black rounded-2xl shadow-2xl shadow-primary/10 active:scale-95 transition-transform uppercase tracking-wider"
              >
                🏏 New Match
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={resetMatch}
        title="Start New Match?"
        description="This will clear current match data."
        confirmText="Yes, Start New"
        cancelText="Cancel"
      />
    </>
  );
}

function ScorePill({ team, color, score, wickets, overs, label }: { team: string; color: string; score: number; wickets: number; overs: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">{label}</p>
      <p className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ color }}>{team}</p>
      <p className="text-xl font-black leading-none" style={{ color }}>
        {score}<span className="text-sm text-muted-foreground/30">/{wickets}</span>
      </p>
      <p className="text-[10px] text-muted-foreground font-bold mt-0.5">({overs.toFixed(1)} ov)</p>
    </div>
  );
}
