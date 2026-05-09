'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { Button } from '../ui/button';

interface SocialShareCardProps {
  headline: string;
  scoreText: string;
  matchName: string;
}

export function SocialShareCard({ headline, scoreText, matchName }: SocialShareCardProps) {
  const [copied, setCopied] = useState(false);

  const fullShareText = `${headline}\n\n${scoreText}\n\n⚡ Scored with Cricket Scorer by @_nameisai_`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `🏏 ${matchName}`, text: fullShareText });
        return;
      } catch { /* cancelled */ }
    }
    handleCopy();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;
    window.open(url, '_blank');
  };

  const handleTelegram = () => {
    const url = `https://t.me/share/url?text=${encodeURIComponent(fullShareText)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-2 px-1">
        <Share2 className="w-4 h-4 text-muted-foreground" />
        <h4 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
          Share Match
        </h4>
      </div>

      {/* Auto-generated headline preview */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-4 space-y-3">
        <p className="text-sm font-black text-foreground leading-snug">{headline}</p>
        <pre className="text-[10px] text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed bg-white/[0.02] rounded-xl p-3 border border-white/5 max-h-32 overflow-y-auto no-scrollbar">
          {scoreText}
        </pre>
      </div>

      {/* Share buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center space-y-1.5 p-3 rounded-2xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-green-500" />
          <span className="text-[9px] font-black text-green-500/80 uppercase tracking-wider">WhatsApp</span>
        </button>
        <button
          onClick={handleTelegram}
          className="flex flex-col items-center space-y-1.5 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
        >
          <Send className="w-5 h-5 text-blue-500" />
          <span className="text-[9px] font-black text-blue-500/80 uppercase tracking-wider">Telegram</span>
        </button>
        <button
          onClick={handleCopy}
          className="flex flex-col items-center space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-muted-foreground" />}
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </button>
      </div>

      {/* Native share fallback */}
      <Button
        onClick={handleNativeShare}
        className="w-full h-12 rounded-2xl font-black text-sm uppercase tracking-wider"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Match Summary
      </Button>
    </motion.div>
  );
}
