import { useState } from 'react';
import { useMatchStore } from '@/store/useMatchStore';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function InningsSelection() {
  const setInnings = useMatchStore((state) => state.setInnings);
  const [innings, setInningsSelection] = useState<1 | 2>(1);
  const [target, setTarget] = useState('');

  const handleSubmit = () => {
    if (innings === 2 && !target) return;
    setInnings(innings, innings === 2 ? Number(target) : undefined);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-sm space-y-8 glass-panel p-8 rounded-[2rem] shadow-2xl relative z-10 border border-white/20">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black tracking-tight text-foreground drop-shadow-md">Innings Break</h2>
          <p className="text-muted-foreground text-sm font-medium">Which innings is starting?</p>
        </div>

        <div className="space-y-6">
          <div className="flex space-x-4">
            <Button
              type="button"
              variant={innings === 1 ? 'default' : 'outline'}
              onClick={() => setInningsSelection(1)}
              className={`flex-1 h-16 text-lg font-bold rounded-xl border-2 transition-all ${
                innings === 1 ? 'border-primary ring-2 ring-primary/20 ring-offset-2' : 'border-border bg-background/50 backdrop-blur-sm'
              }`}
            >
              1st Innings
            </Button>
            <Button
              type="button"
              variant={innings === 2 ? 'default' : 'outline'}
              onClick={() => setInningsSelection(2)}
              className={`flex-1 h-16 text-lg font-bold rounded-xl border-2 transition-all ${
                innings === 2 ? 'border-primary ring-2 ring-primary/20 ring-offset-2' : 'border-border bg-background/50 backdrop-blur-sm'
              }`}
            >
              2nd Innings
            </Button>
          </div>

          {innings === 2 && (
            <div className="space-y-3 animate-in slide-in-from-top-4 fade-in duration-300">
              <label className="text-sm font-semibold text-foreground ml-1">Target Score</label>
              <Input
                type="number"
                min="1"
                placeholder="Enter Target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="h-14 text-lg bg-background/50 backdrop-blur-sm border-2 focus-visible:ring-offset-0 focus-visible:ring-primary/50 rounded-xl"
              />
            </div>
          )}

          <Button 
            onClick={handleSubmit} 
            disabled={innings === 2 && !target}
            className="w-full h-14 text-lg font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
