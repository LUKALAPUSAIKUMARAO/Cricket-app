'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchStore } from '@/store/useMatchStore';
import { TeamSelection } from './TeamSelection';
import { RandomTeamGenerator } from './RandomTeamGenerator';
import { ManualTeamSetup } from './ManualTeamSetup';
import { TossSystem } from './TossSystem';
import { Button } from '../ui/button';
import { ChevronLeft } from 'lucide-react';

type Step = 'CHOICE' | 'RANDOM_INPUT' | 'MANUAL_INPUT' | 'TOSS' | 'FINALIZE';

export function PreMatchFlow() {
  const { setup, setSetup, setIsInitialized, resetMatch } = useMatchStore();
  const [step, setStep] = useState<Step>('CHOICE');
  const [prevStep, setPrevStep] = useState<Step | null>(null);

  const handleBack = () => {
    if (step === 'CHOICE') {
      resetMatch();
      return;
    }
    if (step === 'RANDOM_INPUT' || step === 'MANUAL_INPUT') {
      setStep('CHOICE');
    } else if (step === 'TOSS') {
      setStep(prevStep === 'RANDOM_INPUT' ? 'RANDOM_INPUT' : 'MANUAL_INPUT');
    }
  };

  const navigateTo = (nextStep: Step) => {
    setPrevStep(step);
    setStep(nextStep);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto min-h-0">
      <div className="w-full max-w-2xl space-y-6 pb-20">
        <div className="flex items-center space-x-4">
          {step !== 'CHOICE' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-full bg-background/20 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground drop-shadow-md">
              {step === 'CHOICE' && 'Team Setup'}
              {step === 'RANDOM_INPUT' && 'Random Teams'}
              {step === 'MANUAL_INPUT' && 'Manual Setup'}
              {step === 'TOSS' && 'Match Toss'}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium">
              {step === 'CHOICE' && 'How would you like to create teams?'}
              {step === 'RANDOM_INPUT' && 'Enter player names to shuffle'}
              {step === 'MANUAL_INPUT' && 'Add players to each team'}
              {step === 'TOSS' && 'Flip the coin to decide'}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full"
          >
            {step === 'CHOICE' && (
              <TeamSelection 
                onSelectRandom={() => navigateTo('RANDOM_INPUT')}
                onSelectManual={() => navigateTo('MANUAL_INPUT')}
              />
            )}
            {step === 'RANDOM_INPUT' && (
              <RandomTeamGenerator onComplete={() => navigateTo('TOSS')} />
            )}
            {step === 'MANUAL_INPUT' && (
              <ManualTeamSetup onComplete={() => navigateTo('TOSS')} />
            )}
            {step === 'TOSS' && (
              <TossSystem onComplete={() => setIsInitialized(true)} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
