'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

interface CoinFlipProps {
  onResult: (result: 'Heads' | 'Tails') => void;
  isFlipping: boolean;
}

export function CoinFlip({ onResult, isFlipping }: CoinFlipProps) {
  const controls = useAnimation();
  const [phase, setPhase] = useState<'idle' | 'rising' | 'spinning' | 'slowing' | 'landing' | 'done'>('idle');
  const [showImpact, setShowImpact] = useState(false);
  const [coinResult, setCoinResult] = useState<'Heads' | 'Tails' | null>(null);
  const sparkleRef = useRef<HTMLDivElement>(null);

  const handleFlip = useCallback(async () => {
    const result: 'Heads' | 'Tails' = Math.random() > 0.5 ? 'Heads' : 'Tails';
    setCoinResult(result);
    const finalAngle = result === 'Heads' ? 0 : 180;

    // Phase 1: Launch upward with fast initial spin
    setPhase('rising');
    await controls.start({
      rotateX: 720 + finalAngle,
      y: -180,
      scale: 1.3,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        rotateX: { duration: 0.8, ease: 'linear' },
      },
    });

    // Phase 2: Peak spin — fast rotations at the top
    setPhase('spinning');
    await controls.start({
      rotateX: 2160 + finalAngle,
      y: -200,
      scale: 1.4,
      transition: {
        duration: 1.2,
        ease: 'linear',
        rotateX: { duration: 1.2, ease: 'linear' },
      },
    });

    // Phase 3: Decelerate — slow-motion feel
    setPhase('slowing');
    await controls.start({
      rotateX: 2880 + finalAngle,
      y: -100,
      scale: 1.2,
      transition: {
        duration: 1.0,
        ease: [0.25, 0.46, 0.45, 0.94],
        rotateX: { duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] },
      },
    });

    // Phase 4: Landing with bounce
    setPhase('landing');
    setShowImpact(true);
    
    await controls.start({
      rotateX: 3240 + finalAngle,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.55, 0.06, 0.68, 0.19],
      },
    });

    // Bounce 1
    await controls.start({
      y: -30,
      rotateX: 3240 + finalAngle + 20,
      transition: { duration: 0.15, ease: 'easeOut' },
    });
    await controls.start({
      y: 0,
      rotateX: 3240 + finalAngle,
      transition: { duration: 0.15, ease: 'easeIn' },
    });

    // Bounce 2 (smaller)
    await controls.start({
      y: -10,
      rotateX: 3240 + finalAngle + 5,
      transition: { duration: 0.1, ease: 'easeOut' },
    });
    await controls.start({
      y: 0,
      rotateX: 3240 + finalAngle,
      rotateZ: 0,
      transition: { duration: 0.1, ease: 'easeIn' },
    });

    // Wobble settle
    await controls.start({
      rotateZ: [0, -2, 1.5, -0.5, 0],
      transition: { duration: 0.4, ease: 'easeOut' },
    });

    setPhase('done');
    setTimeout(() => {
      setShowImpact(false);
      onResult(result);
    }, 600);
  }, [controls, onResult]);

  useEffect(() => {
    if (isFlipping && phase === 'idle') {
      handleFlip();
    }
  }, [isFlipping, phase, handleFlip]);

  // Generate sparkle positions
  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${20 + Math.random() * 60}%`,
    top: `${10 + Math.random() * 80}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${1.5 + Math.random() * 1.5}s`,
    size: 2 + Math.random() * 4,
  }));

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-8" ref={sparkleRef}>
      {/* Sparkle particles */}
      <AnimatePresence>
        {(phase === 'spinning' || phase === 'slowing' || phase === 'rising') && (
          <>
            {sparkles.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0.6, 0], scale: [0, 1, 0.5, 0], y: [0, -40 - Math.random() * 60] }}
                exit={{ opacity: 0 }}
                transition={{ duration: parseFloat(s.duration), delay: parseFloat(s.delay), repeat: Infinity }}
                className="absolute rounded-full"
                style={{
                  left: s.left,
                  top: s.top,
                  width: s.size,
                  height: s.size,
                  background: `hsl(${40 + Math.random() * 20}, 100%, ${60 + Math.random() * 20}%)`,
                  boxShadow: `0 0 ${s.size * 2}px hsl(40, 100%, 70%)`,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Coin shadow on ground */}
      <motion.div
        className="absolute bottom-4 w-24 h-4 rounded-full bg-black/20 dark:bg-black/40 blur-md"
        animate={{
          scale: phase === 'rising' || phase === 'spinning' ? 0.5 : phase === 'slowing' ? 0.7 : 1,
          opacity: phase === 'rising' || phase === 'spinning' ? 0.15 : 0.35,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* The coin */}
      <div className="perspective-1000 w-36 h-36 relative">
        <motion.div
          animate={controls}
          initial={{ rotateX: 0, y: 0, scale: 1 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full relative"
        >
          {/* Heads face */}
          <div
            className="absolute inset-0 rounded-full coin-face-heads backface-hidden flex items-center justify-center"
          >
            <div className="w-[85%] h-[85%] rounded-full border-2 border-yellow-400/30 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Embossed cricket stumps */}
              <div className="flex space-x-1 mb-1">
                <div className="w-[3px] h-8 bg-yellow-800/40 rounded-full" />
                <div className="w-[3px] h-8 bg-yellow-800/40 rounded-full" />
                <div className="w-[3px] h-8 bg-yellow-800/40 rounded-full" />
              </div>
              <div className="w-6 h-[2px] bg-yellow-800/30 rounded-full -mt-0.5" />
              <span className="text-xs font-black text-yellow-800/60 mt-1.5 uppercase tracking-[0.2em]">Heads</span>
              {/* Shine reflection */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full" />
            </div>
          </div>

          {/* Tails face */}
          <div
            className="absolute inset-0 rounded-full coin-face-tails backface-hidden flex items-center justify-center"
            style={{ transform: 'rotateX(180deg)' }}
          >
            <div className="w-[85%] h-[85%] rounded-full border-2 border-gray-400/30 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Cricket bat motif */}
              <div className="w-3 h-10 bg-gray-600/30 rounded-sm transform -rotate-12 mb-0.5" />
              <div className="w-2 h-2 rounded-full bg-gray-600/25 absolute top-1/3 right-1/3" />
              <span className="text-xs font-black text-gray-700/60 mt-1.5 uppercase tracking-[0.2em]">Tails</span>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-full" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Impact rings on landing */}
      <AnimatePresence>
        {showImpact && (
          <>
            <motion.div
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute w-36 h-36 rounded-full border-2 border-yellow-500/50"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute w-36 h-36 rounded-full border border-yellow-400/30"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Result flash on done */}
      <AnimatePresence>
        {phase === 'done' && coinResult && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute -bottom-2 text-center"
          >
            <span className="text-2xl font-black text-shimmer uppercase tracking-widest">
              {coinResult}!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
