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
}

export function ScoringPad({ onBoundary, soundEnabled, onToggleSound }: ScoringPadProps) {
  const { addBall, undoLastBall, resetMatch, isMatchComplete } = useMatchStore();
  const [showExtras, setShowExtras] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // Keep screen awake while scoring
  useWakeLock(!isMatchComplete);

  // Sound effects (controlled externally via TopBar, but hooked in here)
  const { playBoundary, playSix, playWicket, playDot } = useSoundEffects();

  const handleRuns = (runs: number) => {
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
    playWicket();
    addBall({
      runs: 0,
      isWicket: true,
      extras: { type: 'none', runs: 0 },
      isBoundary: false,
      isSix: false,
    });
  };

  const handleExtras = (type: ExtrasType) => {
    addBall({
      runs: 0,
      isWicket: false,
      extras: { type, runs: 0 },
      isBoundary: false,
      isSix: false,
    });
    setShowExtras(false);
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto px-4 pb-10 pt-2 flex-1 flex flex-col justify-end">
        {/* Action Row */}
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowRestartConfirm(true)}
            className="rounded-full shadow-sm bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-transparent"
          >
            Restart
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={undoLastBall}
            disabled={isMatchComplete}
            className="rounded-full shadow-sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Undo Last Ball
          </Button>
        </div>

        {/* Extras Menu */}
        {showExtras && (
          <div className="grid grid-cols-4 gap-2 mb-4 animate-in slide-in-from-bottom-4 fade-in">
            {(['wide', 'no-ball', 'bye', 'leg-bye'] as ExtrasType[]).map((ext) => (
              <Button
                key={ext}
                variant="outline"
                className="h-12 border-amber-500/50 text-amber-600 dark:text-amber-400 uppercase text-xs font-bold bg-amber-500/5 hover:bg-amber-500/20"
                onClick={() => handleExtras(ext)}
              >
                {ext === 'no-ball' ? 'NB' : ext === 'leg-bye' ? 'LB' : ext.toUpperCase()}
              </Button>
            ))}
          </div>
        )}

        {/* Main Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 6].map((num) => {
            let colorClass = 'bg-card/80 backdrop-blur-sm hover:bg-accent border-2 border-border text-foreground';
            if (num === 4) colorClass = 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 dark:bg-blue-950/80 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-900/80 backdrop-blur-sm';
            if (num === 6) colorClass = 'bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 text-purple-700 dark:bg-purple-950/80 dark:border-purple-900 dark:text-purple-300 dark:hover:bg-purple-900/80 backdrop-blur-sm';

            return (
              <button
                key={num}
                disabled={isMatchComplete}
                onClick={() => handleRuns(num)}
                className={`h-20 rounded-2xl text-3xl font-black shadow-sm active:scale-95 transition-all duration-75 disabled:opacity-50 ${colorClass}`}
              >
                {num}
              </button>
            );
          })}

          {/* Wicket */}
          <button
            disabled={isMatchComplete}
            onClick={handleWicket}
            className="h-20 col-span-2 rounded-2xl text-2xl font-black bg-destructive/90 text-destructive-foreground shadow-sm active:scale-95 transition-all duration-75 disabled:opacity-50 backdrop-blur-sm"
          >
            WICKET
          </button>

          {/* Extras Toggle */}
          <button
            disabled={isMatchComplete}
            onClick={() => setShowExtras(!showExtras)}
            className={`h-20 rounded-2xl text-xl font-black shadow-sm active:scale-95 transition-all duration-75 disabled:opacity-50 ${
              showExtras
                ? 'bg-amber-500 text-white'
                : 'bg-card/80 backdrop-blur-sm border-2 border-border text-foreground hover:bg-accent'
            }`}
          >
            EXTRAS
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showRestartConfirm}
        onClose={() => setShowRestartConfirm(false)}
        onConfirm={resetMatch}
        title="Restart Match?"
        description="Are you sure you want to abandon this match and start over? All current progress will be lost."
        confirmText="Yes, Restart"
        cancelText="No, Continue"
      />
    </>
  );
}
