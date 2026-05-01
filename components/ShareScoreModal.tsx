'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { useMatchStore } from '@/store/useMatchStore';

interface ShareScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareScoreModal({ isOpen, onClose }: ShareScoreModalProps) {
  const { setup, currentInnings, firstInnings, secondInnings, target } = useMatchStore();
  const [copied, setCopied] = useState(false);

  if (!setup) return null;

  const currentStats = currentInnings === 1 ? firstInnings : secondInnings;
  const runsNeeded = target ? target - (currentStats?.score ?? 0) : null;
  const ballsRemaining = target
    ? setup.totalOvers * 6 - (currentStats?.totalBalls ?? 0)
    : null;

  const scoreText = [
    `🏏 ${setup.matchName}`,
    `${setup.teamA} vs ${setup.teamB} | ${setup.totalOvers} Overs`,
    ``,
    `📊 1st Innings: ${setup.teamA}`,
    `   ${firstInnings.score}/${firstInnings.wickets} (${firstInnings.overs.toFixed(1)} ov)`,
    secondInnings
      ? [`📊 2nd Innings: ${setup.teamB}`,
         `   ${secondInnings.score}/${secondInnings.wickets} (${secondInnings.overs.toFixed(1)} ov)`,
         target ? `🎯 Target: ${target} | Need ${Math.max(0, runsNeeded ?? 0)} off ${Math.max(0, ballsRemaining ?? 0)} balls` : ''
        ].filter(Boolean).join('\n')
      : currentInnings === 1
      ? `📍 Live: ${currentStats?.score}/${currentStats?.wickets} (${currentStats?.overs.toFixed(1)} ov)`
      : '',
    ``,
    `⚡ Scored with Cricket Scorer by @_nameisai_`,
  ].filter(s => s !== undefined).join('\n');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `🏏 ${setup.matchName}`, text: scoreText });
        onClose();
        return;
      } catch { /* user cancelled */ }
    }
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(scoreText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 glass-panel rounded-3xl p-6 shadow-2xl border border-white/20"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Share Score</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="text-xs text-foreground/80 bg-muted/50 rounded-xl p-4 whitespace-pre-wrap font-mono leading-relaxed mb-5 border border-border/50">
              {scoreText}
            </pre>

            <div className="flex space-x-3">
              <Button onClick={onClose} variant="outline" className="flex-1 rounded-xl h-12">
                Cancel
              </Button>
              <Button onClick={handleShare} className="flex-1 rounded-xl h-12 gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Share / Copy'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
