'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, X, Trophy, Circle } from 'lucide-react';
import { Button } from './ui/button';
import { useMatchStore, SavedMatch } from '@/store/useMatchStore';

interface MatchHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function MatchCard({ match }: { match: SavedMatch }) {
  return (
    <div className="bg-card/50 rounded-2xl p-4 border border-border/50 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm">{match.setup.matchName}</p>
          <p className="text-xs text-muted-foreground">{formatDate(match.date)}</p>
        </div>
        <div className="flex items-center space-x-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
          <Trophy className="w-3 h-3" />
          <span>{match.result}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="text-center bg-background/50 rounded-xl p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-1">{match.setup.teamA}</p>
          <p className="text-lg font-black">{match.firstInnings.score}/{match.firstInnings.wickets}</p>
          <p className="text-xs text-muted-foreground">({match.firstInnings.overs.toFixed(1)} ov)</p>
        </div>
        {match.secondInnings ? (
          <div className="text-center bg-background/50 rounded-xl p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">{match.setup.teamB}</p>
            <p className="text-lg font-black">{match.secondInnings.score}/{match.secondInnings.wickets}</p>
            <p className="text-xs text-muted-foreground">({match.secondInnings.overs.toFixed(1)} ov)</p>
          </div>
        ) : (
          <div className="text-center bg-background/50 rounded-xl p-3 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">1st innings only</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function MatchHistoryPanel({ isOpen, onClose }: MatchHistoryPanelProps) {
  const { savedMatches, clearHistory } = useMatchStore();

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm glass-panel border-l border-border/50 flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Match History</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              {savedMatches.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full space-y-4 py-20 text-muted-foreground">
                  <Circle className="w-16 h-16 opacity-20" />
                  <p className="text-sm text-center">No completed matches yet.<br />Finish a match to see it here.</p>
                </div>
              )}
              {savedMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>

            {savedMatches.length > 0 && (
              <div className="p-5 border-t border-border/50">
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-12 gap-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    if (confirm('Clear all match history?')) clearHistory();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
