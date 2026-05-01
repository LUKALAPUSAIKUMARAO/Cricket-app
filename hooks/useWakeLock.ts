'use client';
import { useEffect, useRef } from 'react';

export function useWakeLock(active: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const request = async () => {
    if (!active || !('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {
      // silently fail — some browsers block this
    }
  };

  useEffect(() => {
    if (active) {
      request();
    } else {
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    }
    return () => {
      wakeLockRef.current?.release();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Re-acquire after tab becomes visible again
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && active) {
        request();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
