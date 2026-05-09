'use client';
import { useState } from 'react';
import { useMatchStore, ExtrasType } from '@/store/useMatchStore';
import { Button } from './ui/button';
import { RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmModal } from './ConfirmModal';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface ScoringPadProps {
  onBoundary: (type: '4' | '6') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDisabled?: boolean;
}

export function ScoringPad({ onBoundary, soundEnabled, onToggleSound, isDisabled }: ScoringPadProps) {
  const { 
    addBall, undoLastBall, resetMatch, addRunOut, addInjuredNotOut,
    currentInnings, firstInnings, secondInnings 
  } = useMatchStore();
  
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showRunOutMenu, setShowRunOutMenu] = useState(false);
  const [showInjuryMenu, setShowInjuryMenu] = useState(false);
  const [runOutRuns, setRunOutRuns] = useState<number | null>(null);
  
  const currentStats = currentInnings === 1 ? firstInnings : secondInnings;

  // Keep screen awake while scoring
  useWakeLock(true);
  
  const { playBoundary, playSix, playWicket, playDot } = useSoundEffects();

  const handleRuns = (runs: number) => {
    if (isDisabled) return;
    if (runs === 4) { onBoundary('4'); playBoundary(); }
    if (runs === 6) { onBoundary('6'); playSix(); }
    if (runs === 0) playDot();

    addBall({
      runs,
      isWicket: false,
      extras: { type: 'none', runs: 0 },
      isBoundary: runs === 4,
      isSix: runs === 6,
    });
  };

  const handleWicket = () => {
    if (isDisabled) return;
    playWicket();
    addBall({
      runs: 0,
      isWicket: true,
      extras: { type: 'none', runs: 0 },
      isBoundary: false,
      isSix: false,
    });
  };

  const handleExtras = (type: 'wide' | 'no-ball') => {
    if (isDisabled) return;
    addBall({
      runs: 0,
      isWicket: false,
      extras: { type, runs: 0 },
      isBoundary: false,
      isSix: false,
    });
  };

  const runBtnClass = "h-16 text-2xl font-black rounded-[1.25rem] glass-button disabled:opacity-50 border border-white/10 text-foreground";
  const extraBtnClass = "h-14 text-sm font-black rounded-2xl glass-button uppercase tracking-wider disabled:opacity-50 border border-white/10";

  return (
    <div className="p-4 max-w-md mx-auto w-full space-y-6 mb-8 relative z-10">
      {/* Utility Row */}
      <div className="flex justify-between items-center px-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowRestartConfirm(true)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold rounded-full gap-2 px-4 h-9 border border-destructive/10 backdrop-blur-md"
          disabled={isDisabled}
        >
          Restart
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={undoLastBall}
          className="font-bold rounded-full gap-2 px-4 h-9 border-white/10 bg-white/[0.03] backdrop-blur-md shadow-sm"
          disabled={isDisabled}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Undo
        </Button>
      </div>

      {/* Extras at the TOP as requested */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="ghost"
          className={`${extraBtnClass} text-amber-500 hover:text-amber-400 hover:border-amber-500/30`}
          onClick={() => handleExtras('wide')}
          disabled={isDisabled}
        >
          WIDE
        </Button>
        <Button
          variant="ghost"
          className={`${extraBtnClass} text-orange-500 hover:text-orange-400 hover:border-orange-500/30`}
          onClick={() => handleExtras('no-ball')}
          disabled={isDisabled}
        >
          NO BALL
        </Button>
      </div>

      {/* Main Scoring Grid */}
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((run) => (
          <Button
            key={run}
            variant="ghost"
            className={runBtnClass}
            onClick={() => handleRuns(run)}
            disabled={isDisabled}
          >
            {run}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="ghost"
          className={`${runBtnClass} h-20 text-[2rem] text-blue-400 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:border-blue-400/40`}
          onClick={() => handleRuns(4)}
          disabled={isDisabled}
        >
          4
        </Button>
        <Button
          variant="ghost"
          className={`${runBtnClass} h-20 text-[2rem] text-purple-400 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:border-purple-400/40`}
          onClick={() => handleRuns(6)}
          disabled={isDisabled}
        >
          6
        </Button>
      </div>

      {/* Wicket & Special Actions */}
      <div className="grid grid-cols-1 gap-4 mt-2">
        <Button
          variant="destructive"
          className="w-full h-[5.5rem] text-3xl font-black rounded-[1.5rem] shadow-[0_10px_30px_rgba(220,38,38,0.3)] active:scale-[0.98] transition-transform disabled:opacity-50 uppercase tracking-[0.2em] bg-gradient-to-b from-red-500 to-red-700 border-t border-red-400/50"
          onClick={handleWicket}
          disabled={isDisabled}
        >
          WICKET
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="ghost"
            className="h-14 font-black rounded-2xl glass-button text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/30 tracking-widest"
            onClick={() => setShowRunOutMenu(true)}
            disabled={isDisabled}
          >
            RUN OUT
          </Button>
          <Button
            variant="ghost"
            className="h-14 font-black rounded-2xl glass-button text-amber-500 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/30 tracking-widest"
            onClick={() => setShowInjuryMenu(true)}
            disabled={isDisabled}
          >
            INJURY
          </Button>
        </div>
      </div>

      {/* Run Out Menu Overlay */}
      <AnimatePresence>
        {showRunOutMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[110] bg-background/90 backdrop-blur-xl p-8 flex flex-col justify-center"
          >
            <div className="space-y-8 max-w-sm mx-auto w-full">
              {runOutRuns === null ? (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black">Run Out!</h2>
                    <p className="text-muted-foreground font-bold">How many runs were completed?</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4].map(r => (
                      <Button 
                        key={r} 
                        onClick={() => setRunOutRuns(r)}
                        className="h-16 text-xl font-black rounded-xl"
                      >
                        {r}
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black">Who is out?</h2>
                    <p className="text-muted-foreground font-bold">Select the player who was run out</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: currentStats?.strikerId, label: 'Striker' },
                      { id: currentStats?.nonStrikerId, label: 'Non-Striker' }
                    ].filter(p => p.id).map(p => (
                      <Button 
                        key={p.id} 
                        onClick={() => {
                          addRunOut(runOutRuns, p.id!);
                          setRunOutRuns(null);
                          setShowRunOutMenu(false);
                        }}
                        className="h-16 text-xl font-black rounded-xl"
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </>
              )}
              <Button variant="ghost" onClick={() => {
                setRunOutRuns(null);
                setShowRunOutMenu(false);
              }} className="w-full font-bold">Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Injury Menu Overlay */}
      <AnimatePresence>
        {showInjuryMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[110] bg-background/90 backdrop-blur-xl p-8 flex flex-col justify-center"
          >
            <div className="space-y-8 max-w-sm mx-auto w-full">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black">Injury</h2>
                <p className="text-muted-foreground font-bold">Which player is leaving?</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: currentStats?.strikerId, label: 'Striker' },
                  { id: currentStats?.nonStrikerId, label: 'Non-Striker' }
                ].filter(p => p.id).map(p => (
                  <Button 
                    key={p.id} 
                    onClick={() => {
                      addInjuredNotOut(p.id!);
                      setShowInjuryMenu(false);
                    }}
                    className="h-16 text-xl font-black rounded-xl"
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setShowInjuryMenu(false)} className="w-full font-bold">Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={showRestartConfirm}
        onClose={() => setShowRestartConfirm(false)}
        onConfirm={() => {
          resetMatch();
          setShowRestartConfirm(false);
        }}
        title="Restart Match?"
        description="Are you sure you want to clear all scores and restart the match?"
      />
    </div>
  );
}
