import { useState } from 'react';
import { useMatchStore } from '@/store/useMatchStore';
import { Button } from './ui/button';
import { Trophy } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export function MatchSummary() {
  const { setup, firstInnings, secondInnings, resetMatch } = useMatchStore();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!setup) return null;

  let resultMessage = '';
  
  if (secondInnings) {
    if (secondInnings.score > firstInnings.score) {
      resultMessage = `${setup.teamB} won by ${10 - secondInnings.wickets} wickets!`;
    } else if (secondInnings.score < firstInnings.score) {
      resultMessage = `${setup.teamA} won by ${firstInnings.score - secondInnings.score} runs!`;
    } else {
      resultMessage = 'Match Tied!';
    }
  } else {
    resultMessage = 'Match Ended Early';
  }

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <Trophy className="w-24 h-24 text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-foreground drop-shadow-md">Match Complete</h1>
          <p className="text-2xl font-bold text-primary drop-shadow-sm">{resultMessage}</p>
        </div>

        <div className="w-full max-w-sm space-y-4 glass-panel p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-center pb-4 border-b border-border/50">
            <div className="font-semibold">{setup.teamA}</div>
            <div className="text-xl font-bold">{firstInnings.score}/{firstInnings.wickets}</div>
            <div className="text-sm text-muted-foreground">({firstInnings.overs.toFixed(1)})</div>
          </div>
          
          {secondInnings && (
            <div className="flex justify-between items-center pt-2">
              <div className="font-semibold">{setup.teamB}</div>
              <div className="text-xl font-bold">{secondInnings.score}/{secondInnings.wickets}</div>
              <div className="text-sm text-muted-foreground">({secondInnings.overs.toFixed(1)})</div>
            </div>
          )}
        </div>

        <Button 
          onClick={() => setShowConfirm(true)}
          className="w-full max-w-sm h-14 text-lg font-bold rounded-xl"
        >
          Start New Match
        </Button>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={resetMatch}
        title="Start New Match?"
        description="Are you sure you want to clear this match and start a new one? This match data will be lost."
        confirmText="Yes, Start New"
        cancelText="Cancel"
      />
    </>
  );
}
