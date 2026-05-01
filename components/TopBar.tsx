'use client';
import { useState } from 'react';
import { Sun, Moon, Maximize, Minimize, Volume2, VolumeX, History } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useFullscreen } from '@/hooks/useFullscreen';
import { MatchHistoryPanel } from './MatchHistoryPanel';

interface TopBarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function TopBar({ soundEnabled, onToggleSound }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const [showHistory, setShowHistory] = useState(false);

  // Smaller buttons for mobile to prevent overlap
  const iconBtn = 'w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full glass-panel border border-white/10 hover:bg-white/10 active:scale-95 transition-all';

  return (
    <>
      <div className="fixed top-3 right-3 md:top-4 md:right-4 z-[60] flex items-center space-x-1.5 md:space-x-2">
        <button
          onClick={() => setShowHistory(true)}
          className={iconBtn}
          aria-label="Match History"
          title="Match History"
        >
          <History className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>

        <button
          onClick={onToggleSound}
          className={iconBtn}
          aria-label="Toggle Sound"
          title={soundEnabled ? 'Sound On' : 'Sound Off'}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
          )}
        </button>

        <button
          onClick={toggleFullscreen}
          className={iconBtn}
          aria-label="Toggle Fullscreen"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize className="w-3.5 h-3.5 md:w-4 md:h-4" />
          ) : (
            <Maximize className="w-3.5 h-3.5 md:w-4 md:h-4" />
          )}
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={iconBtn}
          aria-label="Toggle Theme"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 md:w-4 md:h-4" />
          ) : (
            <Moon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          )}
        </button>
      </div>

      <MatchHistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
}
