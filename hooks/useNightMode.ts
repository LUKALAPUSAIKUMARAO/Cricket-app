'use client';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export function useNightMode() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const hour = new Date().getHours();
    // 18:00 – 06:00 → dark, otherwise → light
    if (hour >= 18 || hour < 6) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
    // Only runs once on mount — user can override manually
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
