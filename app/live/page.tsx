'use client';
import { useEffect, useState } from 'react';
import { useMatchStore } from '@/store/useMatchStore';
import { LiveHeader } from '@/components/viewer/LiveHeader';
import { MainScorecard } from '@/components/viewer/MainScorecard';
import { BattingBowlingCards } from '@/components/viewer/BattingBowlingCards';
import { BallTimeline } from '@/components/viewer/BallTimeline';
import { MomentumGraph } from '@/components/viewer/MomentumGraph';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MatchSummary } from '@/components/MatchSummary';
import { subscribeToMatchState } from '@/lib/firebase';

export default function LiveViewerDashboard() {
  const { setup, isInitialized, isMatchComplete } = useMatchStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch and listen for cross-tab or Firebase updates
  useEffect(() => {
    setMounted(true);
    
    // Check for matchId in URL
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('matchId');

    let unsubscribeFirebase = () => {};

    if (matchId) {
      // Connect to Cloud Firebase
      unsubscribeFirebase = subscribeToMatchState(matchId, (cloudState) => {
        // Firebase removes empty arrays from JSON. We must restore them to prevent React crashes!
        if (cloudState) {
          if (cloudState.firstInnings && !cloudState.firstInnings.balls) cloudState.firstInnings.balls = [];
          if (cloudState.firstInnings && !cloudState.firstInnings.fallOfWickets) cloudState.firstInnings.fallOfWickets = [];
          
          if (cloudState.secondInnings) {
            if (!cloudState.secondInnings.balls) cloudState.secondInnings.balls = [];
            if (!cloudState.secondInnings.fallOfWickets) cloudState.secondInnings.fallOfWickets = [];
          }
          
          if (cloudState.setup) {
            if (!cloudState.setup.teamAPlayers) cloudState.setup.teamAPlayers = [];
            if (!cloudState.setup.teamBPlayers) cloudState.setup.teamBPlayers = [];
          }
          
          if (!cloudState.recentPlayers) cloudState.recentPlayers = [];
          
          useMatchStore.setState(cloudState);
        }
      });
    }

    // Fallback cross-tab sync if Firebase is missing
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cricket-match-storage') {
        useMatchStore.persist.rehydrate();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeFirebase();
    };
  }, []);

  if (!mounted) return <div className="min-h-[100dvh] bg-background" />;

  if (!setup || !isInitialized) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center space-y-4 premium-bg">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin opacity-50 mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-widest">Waiting for Live Match</h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          The match hasn't started yet or the link is invalid. Please wait for the scorer to begin the match.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] relative overflow-x-hidden text-foreground pb-10">
      <div className="premium-bg fixed inset-0 -z-10" />
      <ThemeToggle />
      
      <div className="max-w-md mx-auto relative">
        <LiveHeader />
        
        {isMatchComplete ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            <MatchSummary isViewer />
          </div>
        ) : (
          <>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
              <MainScorecard />
            </div>
            
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
              <BattingBowlingCards />
            </div>
            
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
              <BallTimeline />
            </div>
            
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 fill-mode-both">
              <MomentumGraph />
            </div>
            
            {/* Footer */}
            <div className="text-center pb-8 pt-4 opacity-40">
              <p className="text-[10px] uppercase tracking-widest font-bold">
                Live Cricket Dashboard
              </p>
              <p className="text-[9px]">Powered by Cricket Scorer</p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
