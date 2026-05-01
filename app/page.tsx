"use client"

import { useEffect, useState } from 'react';
import { useMatchStore } from '@/store/useMatchStore';
import { SetupScreen } from '@/components/SetupScreen';
import { InningsBreakScreen } from '@/components/InningsBreakScreen';
import { Scoreboard } from '@/components/Scoreboard';
import { ScoringPad } from '@/components/ScoringPad';
import { BoundaryAnimation } from '@/components/Animations';
import { MatchSummary } from '@/components/MatchSummary';
import { TopBar } from '@/components/TopBar';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useNightMode } from '@/hooks/useNightMode';

export default function Home() {
  const { setup, currentInnings, firstInnings, isMatchComplete } = useMatchStore();
  const [boundaryType, setBoundaryType] = useState<'4' | '6' | null>(null);
  const [mounted, setMounted] = useState(false);
  const { soundEnabled, toggleSound } = useSoundEffects();

  // Auto switch dark/light based on time of day — runs once on mount
  useNightMode();

  // Prevent hydration mismatch for zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  // Global reload confirmation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (setup && !isMatchComplete) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [setup, isMatchComplete]);

  if (!mounted) return <div className="min-h-screen bg-background" />;

  const isFirstInningsFinished =
    setup &&
    currentInnings === 1 &&
    (firstInnings.wickets >= 10 || firstInnings.overs >= setup.totalOvers);

  return (
    <main className="flex flex-col min-h-[100dvh] relative overflow-hidden text-foreground">
      <div className="premium-bg" />

      {/* Top utility bar — always visible */}
      <TopBar soundEnabled={soundEnabled} onToggleSound={toggleSound} />

      {!setup ? (
        <SetupScreen />
      ) : isMatchComplete ? (
        <MatchSummary />
      ) : isFirstInningsFinished ? (
        <InningsBreakScreen />
      ) : (
        <>
          <Scoreboard />
          <ScoringPad
            onBoundary={setBoundaryType}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
          />
        </>
      )}

      <BoundaryAnimation type={boundaryType} onComplete={() => setBoundaryType(null)} />

      <a
        href="https://www.instagram.com/_nameisai_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-medium tracking-widest uppercase opacity-40 hover:opacity-90 transition-opacity flex items-center space-x-1 z-20 text-foreground"
      >
        <span>Crafted by</span>
        <span className="font-bold">@_nameisai_</span>
      </a>
    </main>
  );
}
