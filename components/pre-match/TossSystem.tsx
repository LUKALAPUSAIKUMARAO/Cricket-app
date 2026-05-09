'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronRight, RotateCcw, Swords } from 'lucide-react';
import { Button } from '../ui/button';
import { CoinFlip } from './CoinFlip';
import { useMatchStore, TossResult } from '@/store/useMatchStore';

interface TossSystemProps {
  onComplete: () => void;
}

export function TossSystem({ onComplete }: TossSystemProps) {
  const { setup, setToss } = useMatchStore();
  const [callingTeam, setCallingTeam] = useState<string | null>(null);
  const [selection, setSelection] = useState<'Heads' | 'Tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'Heads' | 'Tails' | null>(null);
  const [tossWinner, setTossWinner] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  if (!setup) return null;

  const teamAColor = setup.teamAColor || '#3b82f6';
  const teamBColor = setup.teamBColor || '#ef4444';

  const handleStartFlip = () => {
    if (!callingTeam || !selection) return;
    setIsFlipping(true);
    setResult(null);
  };

  const handleFlipResult = (res: 'Heads' | 'Tails') => {
    setIsFlipping(false);
    setResult(res);
    
    const otherTeam = callingTeam === setup.teamA ? setup.teamB : setup.teamA;
    const winner = res === selection ? callingTeam : otherTeam;
    
    // Dramatic pause before winner reveal
    setTimeout(() => {
      setTossWinner(winner);
      setShowReveal(true);
    }, 800);
  };

  const handleDecision = (dec: 'bat' | 'bowl') => {
    setToss({ winner: tossWinner!, decision: dec });
    onComplete();
  };

  const winnerColor = tossWinner === setup.teamA ? teamAColor : teamBColor;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Stadium atmosphere backdrop */}
      <div className="absolute inset-0 stadium-backdrop" />
      
      {/* Animated vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />

      {/* Spotlight sweep overlay */}
      <div className="absolute inset-0 spotlight-sweep overflow-hidden" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm mx-auto px-6 py-8 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!tossWinner ? (
            <motion.div
              key="toss-setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full space-y-8"
            >
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-2"
              >
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Swords className="w-6 h-6 text-yellow-500" />
                  <h1 className="text-3xl font-black text-shimmer uppercase tracking-[0.15em]">
                    Toss Time
                  </h1>
                  <Swords className="w-6 h-6 text-yellow-500 transform scale-x-[-1]" />
                </div>

                {/* Team vs Team broadcast banner */}
                <div className="flex items-center justify-center space-x-4 py-3">
                  <span className="text-sm font-black uppercase tracking-widest" style={{ color: teamAColor }}>
                    {setup.teamA}
                  </span>
                  <span className="text-[10px] font-black text-gray-500 italic">vs</span>
                  <span className="text-sm font-black uppercase tracking-widest" style={{ color: teamBColor }}>
                    {setup.teamB}
                  </span>
                </div>
              </motion.div>

              {/* Who calls the toss */}
              {!isFlipping && !result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <p className="text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Who will call?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: setup.teamA, color: teamAColor },
                      { name: setup.teamB, color: teamBColor },
                    ].map(({ name, color }) => (
                      <button
                        key={name}
                        onClick={() => setCallingTeam(name)}
                        className="relative p-5 rounded-2xl border-2 transition-all duration-300 font-bold text-sm backdrop-blur-sm overflow-hidden group"
                        style={{
                          borderColor: callingTeam === name ? color : 'rgba(255,255,255,0.1)',
                          backgroundColor: callingTeam === name ? `${color}15` : 'rgba(255,255,255,0.03)',
                          color: callingTeam === name ? color : '#94a3b8',
                        }}
                      >
                        <span className="relative z-10 uppercase tracking-wider">{name}</span>
                        {callingTeam === name && (
                          <motion.div
                            layoutId="team-select"
                            className="absolute inset-0 rounded-2xl"
                            style={{ backgroundColor: `${color}10`, border: `2px solid ${color}40` }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Heads or Tails selection */}
              <AnimatePresence>
                {callingTeam && !isFlipping && !result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      <span style={{ color: callingTeam === setup.teamA ? teamAColor : teamBColor }}>
                        {callingTeam}
                      </span>{' '}
                      calls:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {(['Heads', 'Tails'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelection(opt)}
                          className="p-5 rounded-2xl border-2 transition-all duration-300 font-black text-base uppercase tracking-wider backdrop-blur-sm"
                          style={{
                            borderColor: selection === opt ? '#eab308' : 'rgba(255,255,255,0.1)',
                            backgroundColor: selection === opt ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.03)',
                            color: selection === opt ? '#fbbf24' : '#94a3b8',
                            boxShadow: selection === opt ? '0 0 20px rgba(234,179,8,0.15)' : 'none',
                          }}
                        >
                          {opt === 'Heads' ? '🪙' : '🔄'} {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Flip button */}
              {selection && !isFlipping && !result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button
                    onClick={handleStartFlip}
                    className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-white shadow-2xl shadow-yellow-500/20 uppercase tracking-wider border-0"
                  >
                    Flip the Coin ⚡
                  </Button>
                </motion.div>
              )}

              {/* The coin animation */}
              {isFlipping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center py-4"
                >
                  <CoinFlip onResult={handleFlipResult} isFlipping={isFlipping} />
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Winner reveal and decision */
            <motion.div
              key="toss-result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-full text-center space-y-8"
            >
              {/* Winner trophy and announcement */}
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="space-y-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  className="mx-auto w-28 h-28 rounded-full flex items-center justify-center relative"
                  style={{
                    background: `radial-gradient(circle, ${winnerColor}30 0%, transparent 70%)`,
                  }}
                >
                  <Trophy className="w-16 h-16 text-yellow-500 trophy-glow" />
                  {/* Glow ring */}
                  <div
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{ boxShadow: `0 0 40px ${winnerColor}40, inset 0 0 20px ${winnerColor}20` }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">
                    Toss Winner
                  </p>
                  <h2 className="text-4xl font-black uppercase tracking-tight" style={{ color: winnerColor }}>
                    {tossWinner}
                  </h2>
                  <p className="text-sm text-gray-400 font-bold mt-2">
                    won the toss!
                  </p>
                </motion.div>
              </motion.div>

              {/* Decision buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-4"
              >
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                  Elected to
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleDecision('bat')}
                    className="relative group p-6 rounded-3xl border-2 transition-all duration-300 overflow-hidden"
                    style={{
                      borderColor: `${winnerColor}40`,
                      background: `linear-gradient(135deg, ${winnerColor}15 0%, transparent 100%)`,
                    }}
                  >
                    <div className="relative z-10">
                      <span className="text-3xl block mb-2">🏏</span>
                      <span className="text-lg font-black uppercase tracking-wider" style={{ color: winnerColor }}>
                        Bat
                      </span>
                    </div>
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `${winnerColor}10` }}
                    />
                  </button>
                  <button
                    onClick={() => handleDecision('bowl')}
                    className="relative group p-6 rounded-3xl border-2 border-white/10 transition-all duration-300 overflow-hidden bg-white/[0.03]"
                  >
                    <div className="relative z-10">
                      <span className="text-3xl block mb-2">⚾</span>
                      <span className="text-lg font-black uppercase tracking-wider text-gray-300">
                        Bowl
                      </span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5" />
                  </button>
                </div>
              </motion.div>

              {/* Retoss option */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                onClick={() => {
                  setTossWinner(null);
                  setShowReveal(false);
                  setSelection(null);
                  setResult(null);
                }}
                className="flex items-center space-x-2 mx-auto text-[10px] font-black text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-widest"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retoss</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
