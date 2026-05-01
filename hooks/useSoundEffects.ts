'use client';
import { useState, useCallback } from 'react';

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.3
) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  } catch {
    // audio not supported
  }
}

function playChord(notes: number[], duration: number) {
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, duration, 'triangle', 0.25), i * 60);
  });
}

export function useSoundEffects() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('cricket-sound-enabled');
    return stored === null ? true : stored === 'true';
  });

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('cricket-sound-enabled', String(next));
      return next;
    });
  }, []);

  const playBoundary = useCallback(() => {
    if (!soundEnabled) return;
    // Ascending triumphant chord
    playChord([523, 659, 784], 0.5);
    setTimeout(() => playChord([659, 784, 988], 0.4), 200);
  }, [soundEnabled]);

  const playSix = useCallback(() => {
    if (!soundEnabled) return;
    // Big ascending fanfare
    playChord([523, 659, 784, 1047], 0.6);
    setTimeout(() => playChord([659, 784, 988, 1319], 0.5), 180);
    setTimeout(() => playTone(1047, 0.6, 'triangle', 0.3), 360);
  }, [soundEnabled]);

  const playWicket = useCallback(() => {
    if (!soundEnabled) return;
    // Descending dramatic sound
    playTone(440, 0.2, 'sawtooth', 0.3);
    setTimeout(() => playTone(330, 0.2, 'sawtooth', 0.25), 150);
    setTimeout(() => playTone(220, 0.4, 'sawtooth', 0.2), 300);
  }, [soundEnabled]);

  const playDot = useCallback(() => {
    if (!soundEnabled) return;
    playTone(300, 0.05, 'sine', 0.1);
  }, [soundEnabled]);

  return { soundEnabled, toggleSound, playBoundary, playSix, playWicket, playDot };
}
