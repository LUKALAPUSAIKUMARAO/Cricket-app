'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import { useMatchStore, BallInfo } from '@/store/useMatchStore';

interface OverScorecardPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function getBallLabel(ball: BallInfo): { label: string; color: string } {
  if (ball.isWicket) return { label: 'W', color: 'bg-red-500 text-white' };
  if (ball.isSix) return { label: '6', color: 'bg-purple-500 text-white' };
  if (ball.isBoundary) return { label: '4', color: 'bg-blue-500 text-white' };
  if (ball.extras.type !== 'none') {
    const map: Record<string, string> = { wide: 'wd', 'no-ball': 'nb', bye: 'b', 'leg-bye': 'lb' };
    return { label: map[ball.extras.type] || 'E', color: 'bg-amber-500 text-white' };
  }
  if (ball.runs === 0) return { label: '·', color: 'bg-muted text-muted-foreground' };
  return { label: String(ball.runs), color: 'bg-secondary text-secondary-foreground' };
}

function groupByOvers(balls: BallInfo[]): BallInfo[][] {
  const overs: BallInfo[][] = [];
  let currentOver: BallInfo[] = [];
  let legalCount = 0;

  for (const ball of balls) {
    currentOver.push(ball);
    if (!['wide', 'no-ball'].includes(ball.extras.type)) {
      legalCount++;
      if (legalCount === 6) {
        overs.push(currentOver);
        currentOver = [];
        legalCount = 0;
      }
    }
  }
  if (currentOver.length > 0) overs.push(currentOver);
  return overs;
}

export function OverScorecardPanel({ isOpen, onClose }: OverScorecardPanelProps) {
  const { currentInnings, firstInnings, secondInnings, setup } = useMatchStore();
  const currentStats = currentInnings === 1 ? firstInnings : secondInnings;
  const overs = groupByOvers(currentStats?.balls ?? []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-panel rounded-t-3xl max-h-[70vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Over-by-Over</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              {overs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No balls bowled yet</p>
              )}
              {[...overs].reverse().map((balls, reversedIdx) => {
                const overIdx = overs.length - 1 - reversedIdx;
                const overRuns = balls.reduce((sum, b) => {
                  let r = b.runs + b.extras.runs;
                  if (b.extras.type === 'wide' || b.extras.type === 'no-ball') r += 1;
                  return sum + r;
                }, 0);
                const wickets = balls.filter((b) => b.isWicket).length;
                return (
                  <div key={overIdx} className="bg-card/50 rounded-2xl p-4 border border-border/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-muted-foreground">
                        Over {overIdx + 1}
                        {overIdx === overs.length - 1 ? ' (current)' : ''}
                      </span>
                      <div className="flex items-center space-x-3 text-sm font-semibold">
                        <span>{overRuns} runs</span>
                        {wickets > 0 && <span className="text-red-500">{wickets}W</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {balls.map((ball) => {
                        const { label, color } = getBallLabel(ball);
                        return (
                          <div
                            key={ball.id}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${color}`}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-border/50 text-center text-xs text-muted-foreground">
              {setup?.matchName} · Innings {currentInnings}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
