'use client';
import { useMatchStore } from '@/store/useMatchStore';
import { Clock, RefreshCcw } from 'lucide-react';

export function LiveHeader() {
  const { setup, isMatchComplete, currentInnings } = useMatchStore();

  if (!setup) return null;

  return (
    <div className="flex items-center justify-between p-4 glass-panel border-x-0 rounded-b-3xl shadow-md sticky top-0 z-50">
      <div className="flex flex-col">
        <div className="flex items-center space-x-2 mb-1">
          {!isMatchComplete ? (
            <div className="flex items-center space-x-1.5 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Finished</span>
            </div>
          )}
          <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest">Innings {currentInnings}</span>
        </div>
        <h1 className="text-sm font-black tracking-tight">{setup.matchName}</h1>
      </div>
      
      <div className="flex flex-col items-end">
        <div className="flex items-center space-x-1 text-xs font-black tracking-widest">
          <span className="text-blue-400">{setup.teamA}</span>
          <span className="text-[9px] text-foreground/70 italic px-1">vs</span>
          <span className="text-red-400">{setup.teamB}</span>
        </div>
        {/* Simple Auto-sync indicator (mock) */}
        <div className="flex items-center space-x-1 mt-1 opacity-40">
          <RefreshCcw className="w-3 h-3 animate-[spin_3s_linear_infinite]" />
          <span className="text-[9px] uppercase tracking-wider font-bold">Syncing</span>
        </div>
      </div>
    </div>
  );
}
