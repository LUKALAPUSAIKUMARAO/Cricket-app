import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ExtrasType = 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'none';

export interface BallInfo {
  id: string;
  runs: number;
  isWicket: boolean;
  extras: {
    type: ExtrasType;
    runs: number;
  };
  isBoundary: boolean;
  isSix: boolean;
  timestamp: number;
}

export interface InningsState {
  score: number;
  wickets: number;
  overs: number;
  totalBalls: number;
  balls: BallInfo[];
}

export interface MatchSetup {
  matchName: string;
  teamA: string;
  teamB: string;
  totalOvers: number;
  teamAColor: string;
  teamBColor: string;
}

export interface SavedMatch {
  id: string;
  setup: MatchSetup;
  firstInnings: InningsState;
  secondInnings: InningsState | null;
  result: string;
  date: number;
}

export interface MatchState {
  setup: MatchSetup | null;
  currentInnings: 1 | 2;
  firstInnings: InningsState;
  secondInnings: InningsState | null;
  target: number | null;
  isMatchComplete: boolean;
  matchStartTime: number | null;
}

export interface MatchStore extends MatchState {
  actionHistory: MatchState[];
  savedMatches: SavedMatch[];
  setSetup: (setup: MatchSetup) => void;
  setInnings: (innings: 1 | 2, target?: number) => void;
  addBall: (ball: Omit<BallInfo, 'id' | 'timestamp'>) => void;
  undoLastBall: () => void;
  resetMatch: () => void;
  clearHistory: () => void;
}

const initialInnings: InningsState = {
  score: 0,
  wickets: 0,
  overs: 0,
  totalBalls: 0,
  balls: [],
};

const initialState: MatchState = {
  setup: null,
  currentInnings: 1,
  firstInnings: { ...initialInnings },
  secondInnings: null,
  target: null,
  isMatchComplete: false,
  matchStartTime: null,
};

const calculateOvers = (totalBalls: number): number => {
  const completedOvers = Math.floor(totalBalls / 6);
  const remainingBalls = totalBalls % 6;
  return completedOvers + remainingBalls / 10;
};

const getResultMessage = (
  setup: MatchSetup,
  firstInnings: InningsState,
  secondInnings: InningsState | null
): string => {
  if (!secondInnings) return 'Match Ended Early';
  if (secondInnings.score > firstInnings.score) {
    return `${setup.teamB} won by ${10 - secondInnings.wickets} wickets`;
  } else if (secondInnings.score < firstInnings.score) {
    return `${setup.teamA} won by ${firstInnings.score - secondInnings.score} runs`;
  }
  return 'Match Tied';
};

export const useMatchStore = create<MatchStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      actionHistory: [],
      savedMatches: [],

      setSetup: (setup) =>
        set((state) => {
          const snapshot = extractState(state);
          return {
            setup,
            matchStartTime: Date.now(),
            actionHistory: [...state.actionHistory, snapshot],
          };
        }),

      setInnings: (innings, target) =>
        set((state) => {
          const snapshot = extractState(state);
          return {
            currentInnings: innings,
            target: target ?? null,
            secondInnings: innings === 2 ? { ...initialInnings } : null,
            actionHistory: [...state.actionHistory, snapshot],
          };
        }),

      addBall: (ballInput) =>
        set((state) => {
          if (state.isMatchComplete) return state;

          const snapshot = extractState(state);
          const isFirstInnings = state.currentInnings === 1;
          const currentInningsState = isFirstInnings
            ? state.firstInnings
            : state.secondInnings!;

          const ball: BallInfo = {
            ...ballInput,
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
          };

          const isLegalDelivery = !['wide', 'no-ball'].includes(ball.extras.type);

          let runToAdd = ball.runs + ball.extras.runs;
          if (ball.extras.type === 'wide' || ball.extras.type === 'no-ball') {
            runToAdd += 1;
          }

          const newTotalBalls = isLegalDelivery
            ? currentInningsState.totalBalls + 1
            : currentInningsState.totalBalls;

          const newScore = currentInningsState.score + runToAdd;
          const newWickets = currentInningsState.wickets + (ball.isWicket ? 1 : 0);

          let isMatchComplete: boolean = false;

          const isAllOut = newWickets >= 10;
          const isOversFinished = state.setup && calculateOvers(newTotalBalls) >= state.setup.totalOvers;
          const targetReached = state.currentInnings === 2 && state.target && newScore >= state.target;

          if (state.currentInnings === 2 && (isAllOut || isOversFinished || targetReached)) {
            isMatchComplete = true;
          }

          const updatedInningsState = {
            score: newScore,
            wickets: newWickets,
            totalBalls: newTotalBalls,
            overs: calculateOvers(newTotalBalls),
            balls: [...currentInningsState.balls, ball],
          };

          const newFirstInnings = isFirstInnings ? updatedInningsState : state.firstInnings;
          const newSecondInnings = !isFirstInnings ? updatedInningsState : state.secondInnings;

          // Auto-save on match complete
          let savedMatches = state.savedMatches;
          if (isMatchComplete && state.setup) {
            const savedMatch: SavedMatch = {
              id: Math.random().toString(36).substring(7),
              setup: state.setup,
              firstInnings: newFirstInnings,
              secondInnings: newSecondInnings,
              result: getResultMessage(state.setup, newFirstInnings, newSecondInnings),
              date: Date.now(),
            };
            savedMatches = [savedMatch, ...state.savedMatches].slice(0, 20); // keep last 20
          }

          return {
            actionHistory: [...state.actionHistory, snapshot],
            isMatchComplete,
            firstInnings: newFirstInnings,
            secondInnings: newSecondInnings,
            savedMatches,
          };
        }),

      undoLastBall: () =>
        set((state) => {
          if (state.actionHistory.length === 0) return state;

          const newHistory = [...state.actionHistory];
          const previousState = newHistory.pop()!;

          return {
            ...previousState,
            actionHistory: newHistory,
            savedMatches: state.savedMatches,
          };
        }),

      resetMatch: () =>
        set((state) => ({ ...initialState, actionHistory: [], savedMatches: state.savedMatches })),

      clearHistory: () => set({ savedMatches: [] }),
    }),
    {
      name: 'cricket-match-storage',
    }
  )
);

function extractState(state: MatchStore): MatchState {
  return {
    setup: state.setup,
    currentInnings: state.currentInnings,
    firstInnings: state.firstInnings,
    secondInnings: state.secondInnings,
    target: state.target,
    isMatchComplete: state.isMatchComplete,
    matchStartTime: state.matchStartTime,
  };
}
