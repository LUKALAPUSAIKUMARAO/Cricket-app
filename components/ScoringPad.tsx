'use client';
import { useState } from 'react';
import { useMatchStore, ExtrasType } from '@/store/useMatchStore';
import { Button } from './ui/button';
import { RotateCcw } from 'lucide-react';
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
  const { addBall, undoLastBall, resetMatch } = useMatchStore();
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  
  // Keep screen awake while scoring
  useWakeLock();
  
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

  const runBtnClass = "h-16 text-2xl font-black rounded-2xl transition-all active:scale-90 shadow-md disabled:opacity-50";
  const extraBtnClass = "h-14 text-sm font-black rounded-2xl transition-all active:scale-95 shadow-lg uppercase tracking-wider disabled:opacity-50";

  return (
    <div className="p-4 max-w-md mx-auto w-full space-y-5 mb-8">
      {/* Utility Row */}
      <div className="flex justify-between items-center px-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowRestartConfirm(true)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold rounded-full gap-2 px-4 h-9 border border-destructive/10"
          disabled={isDisabled}
        >
          Restart
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={undoLastBall}
          className="font-bold rounded-full gap-2 px-4 h-9 border-2 bg-background/50 backdrop-blur-sm shadow-sm"
          disabled={isDisabled}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Undo
        </Button>
      </div>

      {/* Extras at the TOP as requested */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className={`${extraBtnClass} bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-500`}
          onClick={() => handleExtras('wide')}
          disabled={isDisabled}
        >
          WIDE
        </Button>
        <Button
          variant="outline"
          className={`${extraBtnClass} bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-500`}
          onClick={() => handleExtras('no-ball')}
          disabled={isDisabled}
        >
          NO BALL
        </Button>
      </div>

      {/* Main Scoring Grid */}
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((run) => (
          <Button
            key={run}
            variant="outline"
            className={runBtnClass}
            onClick={() => handleRuns(run)}
            disabled={isDisabled}
          >
            {run}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className={`${runBtnClass} h-20 text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800`}
          onClick={() => handleRuns(4)}
          disabled={isDisabled}
        >
          4
        </Button>
        <Button
          variant="outline"
          className={`${runBtnClass} h-20 text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800`}
          onClick={() => handleRuns(6)}
          disabled={isDisabled}
        >
          6
        </Button>
      </div>

      {/* Wicket at the Bottom */}
      <Button
        variant="destructive"
        className="w-full h-20 text-2xl font-black rounded-3xl shadow-xl active:scale-95 transition-transform disabled:opacity-50 uppercase tracking-widest"
        onClick={handleWicket}
        disabled={isDisabled}
      >
        WICKET
      </Button>

      <ConfirmModal 
        isOpen={showRestartConfirm}
        onClose={() => setShowRestartConfirm(false)}
        onConfirm={() => {
          resetMatch();
          setShowRestartConfirm(false);
        }}
        title="Restart Match?"
        message="Are you sure you want to clear all scores and restart the match?"
      />
    </div>
  );
}
