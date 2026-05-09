'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Clipboard, History } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useMatchStore } from '@/store/useMatchStore';

interface PlayerInputProps {
  players: string[];
  setPlayers: (players: string[]) => void;
  maxPlayers?: number;
  minPlayers?: number;
}

export function PlayerInput({ players, setPlayers, maxPlayers = 30, minPlayers = 4 }: PlayerInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { recentPlayers } = useMatchStore();
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addPlayer = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (trimmed.includes(',') || trimmed.includes('\n')) {
      const newNames = trimmed
        .split(/[,\n]/)
        .map(n => n.trim())
        .filter(n => n && !players.includes(n));
      
      const combined = [...players, ...newNames].slice(0, maxPlayers);
      setPlayers(combined);
      setInputValue('');
      return;
    }

    if (players.includes(trimmed) || players.length >= maxPlayers) return;
    setPlayers([...players, trimmed]);
    setInputValue('');
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text.includes(',') || text.includes('\n')) {
      e.preventDefault();
      const newNames = text
        .split(/[,\n]/)
        .map(n => n.trim())
        .filter(n => n && !players.includes(n));
      
      const combined = [...players, ...newNames].slice(0, maxPlayers);
      setPlayers(combined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPlayer(inputValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            placeholder="Add player name..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className="h-12 bg-background/40 backdrop-blur-md border-2 border-white/10 focus:border-primary/50 transition-all rounded-xl"
          />
          <Button
            onClick={() => addPlayer(inputValue)}
            disabled={!inputValue.trim() || players.length >= maxPlayers}
            className="h-12 w-12 rounded-xl"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
        
        {recentPlayers.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRecent(!showRecent)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center space-x-1"
          >
            <History className="w-3 h-3" />
            <span>Recent Players</span>
          </Button>
        )}

        <AnimatePresence>
          {showRecent && recentPlayers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-2 w-full glass-panel p-4 rounded-2xl border border-white/20 shadow-2xl max-h-40 overflow-y-auto grid grid-cols-2 gap-2"
            >
              {recentPlayers.filter(name => !players.includes(name)).map(name => (
                <button
                  key={name}
                  onClick={() => {
                    addPlayer(name);
                    setShowRecent(false);
                  }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm truncate"
                >
                  {name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {players.map((name, index) => (
            <motion.div
              key={`${name}-${index}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center space-x-2 bg-primary/10 border border-primary/20 pl-3 pr-1 py-1 rounded-full text-sm font-medium text-foreground group"
            >
              <span>{name}</span>
              <button
                onClick={() => removePlayer(index)}
                className="p-1 rounded-full hover:bg-primary/20 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {players.length > 0 && (
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
          {players.length} Players Added {players.length < minPlayers && `(Min ${minPlayers} required)`}
        </p>
      )}
    </div>
  );
}
