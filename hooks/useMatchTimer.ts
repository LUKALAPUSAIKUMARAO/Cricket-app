'use client';
import { useState, useEffect } from 'react';

export function useMatchTimer(startTime: number | null) {
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    if (!startTime) {
      setElapsed('00:00');
      return;
    }
    const tick = () => {
      const diffMs = Date.now() - startTime;
      const totalSeconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
      const seconds = (totalSeconds % 60).toString().padStart(2, '0');
      setElapsed(`${minutes}:${seconds}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return elapsed;
}
