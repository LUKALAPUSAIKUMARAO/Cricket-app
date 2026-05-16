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
  strikerId: string | null;
  bowlerId: string | null;
}

export interface FallOfWicket {
  score: number;
  wickets: number;
  overs: number;
  batsman: string;
}

export interface InningsState {
  score: number;
  wickets: number;
  overs: number;
  totalBalls: number;
  balls: BallInfo[];
  strikerId: string | null;
  nonStrikerId: string | null;
  currentBowlerId: string | null;
  fallOfWickets: FallOfWicket[];
}

export interface Player {
  id: string;
  name: string;
  isCaptain?: boolean;
  isWicketKeeper?: boolean;
  isInjured?: boolean;
}

export interface MatchSetup {
  matchName: string;
  teamA: string;
  teamB: string;
  totalOvers: number;
  teamAColor: string;
  teamBColor: string;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
}

export interface TossResult {
  winner: string; // Team name
  decision: 'bat' | 'bowl';
}

export interface SavedMatch {
  id: string;
  setup: MatchSetup;
  firstInnings: InningsState;
  secondInnings: InningsState | null;
  result: string;
  date: number;
  toss?: TossResult;
}

export interface MatchState {
  matchId: string | null;
  setup: MatchSetup | null;
  currentInnings: 1 | 2;
  firstInnings: InningsState;
  secondInnings: InningsState | null;
  target: number | null;
  isMatchComplete: boolean;
  matchStartTime: number | null;
  toss: TossResult | null;
  recentPlayers: string[];
  isInitialized: boolean;
}

export interface MatchStore extends MatchState {
  actionHistory: MatchState[];
  savedMatches: SavedMatch[];
  setSetup: (setup: MatchSetup) => void;
  setChaseSetup: (setup: MatchSetup, target: number) => void;
  setInnings: (innings: 1 | 2, target?: number) => void;
  setToss: (toss: TossResult) => void;
  addBall: (ball: Omit<BallInfo, 'id' | 'timestamp' | 'strikerId' | 'bowlerId'> & { strikerId?: string | null; bowlerId?: string | null; outPlayerId?: string | null }) => void;
  undoLastBall: () => void;
  resetMatch: () => void;
  clearHistory: () => void;
  setRecentPlayers: (players: string[]) => void;
  setIsInitialized: (initialized: boolean) => void;
  setStriker: (id: string | null) => void;
  setNonStriker: (id: string | null) => void;
  setBowler: (id: string | null) => void;
  addRunOut: (runsCompleted: number, outPlayerId: string) => void;
  addInjuredNotOut: (playerId: string) => void;
}

const initialInnings: InningsState = {
  score: 0,
  wickets: 0,
  overs: 0,
  totalBalls: 0,
  balls: [],
  strikerId: null,
  nonStrikerId: null,
  currentBowlerId: null,
  fallOfWickets: [],
};

const initialState: MatchState = {
  matchId: null,
  setup: null,
  currentInnings: 1,
  firstInnings: { ...initialInnings },
  secondInnings: null,
  target: null,
  isMatchComplete: false,
  matchStartTime: null,
  toss: null,
  recentPlayers: [],
  isInitialized: false,
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
          const matchId = state.matchId || Math.random().toString(36).substring(2, 10);
          return {
            matchId,
            setup,
            matchStartTime: Date.now(),
            actionHistory: [...state.actionHistory, snapshot],
          };
        }),

      setChaseSetup: (setup, target) =>
        set((state) => {
          const snapshot = extractState(state);
          const matchId = state.matchId || Math.random().toString(36).substring(2, 10);
          return {
            matchId,
            setup,
            currentInnings: 2,
            target,
            matchStartTime: Date.now(),
            // Mock first innings for history/results if starting from 2nd
            firstInnings: {
              ...initialInnings,
              score: target - 1,
              overs: setup.totalOvers,
            },
            secondInnings: { ...initialInnings },
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

      setToss: (toss) =>
        set((state) => {
          if (!state.setup) return state;
          const snapshot = extractState(state);
          
          let newSetup = { ...state.setup };
          
          const teamAWon = toss.winner === state.setup.teamA;
          const batsFirst = (teamAWon && toss.decision === 'bat') || (!teamAWon && toss.decision === 'bowl') ? 'A' : 'B';

          // If Team B is supposed to bat first, swap Team A and Team B in the setup
          // so that Team A is ALWAYS the team batting in the 1st innings.
          if (batsFirst === 'B') {
            newSetup = {
              ...newSetup,
              teamA: state.setup.teamB,
              teamB: state.setup.teamA,
              teamAPlayers: state.setup.teamBPlayers,
              teamBPlayers: state.setup.teamAPlayers,
              teamAColor: state.setup.teamBColor,
              teamBColor: state.setup.teamAColor,
            };
          }

          return {
            toss,
            setup: newSetup,
            actionHistory: [...state.actionHistory, snapshot],
          };
        }),

      setRecentPlayers: (players) =>
        set((state) => {
          // Merge unique players and keep top 30
          const combined = Array.from(new Set([...players, ...state.recentPlayers])).slice(0, 30);
          return { recentPlayers: combined };
        }),

      setIsInitialized: (initialized) =>
        set((state) => {
          const snapshot = extractState(state);
          return {
            isInitialized: initialized,
            actionHistory: [...state.actionHistory, snapshot],
          };
        }),

      setStriker: (id) =>
        set((state) => {
          const isFirstInnings = state.currentInnings === 1;
          const current = isFirstInnings ? state.firstInnings : state.secondInnings!;
          const updated = { ...current, strikerId: id };
          return {
            firstInnings: isFirstInnings ? updated : state.firstInnings,
            secondInnings: !isFirstInnings ? updated : state.secondInnings,
          };
        }),

      setNonStriker: (id) =>
        set((state) => {
          const isFirstInnings = state.currentInnings === 1;
          const current = isFirstInnings ? state.firstInnings : state.secondInnings!;
          const updated = { ...current, nonStrikerId: id };
          return {
            firstInnings: isFirstInnings ? updated : state.firstInnings,
            secondInnings: !isFirstInnings ? updated : state.secondInnings,
          };
        }),

      setBowler: (id) =>
        set((state) => {
          const isFirstInnings = state.currentInnings === 1;
          const current = isFirstInnings ? state.firstInnings : state.secondInnings!;
          const updated = { ...current, currentBowlerId: id };
          return {
            firstInnings: isFirstInnings ? updated : state.firstInnings,
            secondInnings: !isFirstInnings ? updated : state.secondInnings,
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
            strikerId: currentInningsState.strikerId,
            bowlerId: currentInningsState.currentBowlerId,
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

          // Fall of wicket
          let newFallOfWickets = [...currentInningsState.fallOfWickets];
          if (ball.isWicket) {
            const outBatsman = state.setup?.[isFirstInnings ? 'teamAPlayers' : 'teamBPlayers']
              .find(p => p.id === currentInningsState.strikerId)?.name || 'Unknown';
            newFallOfWickets.push({
              score: newScore,
              wickets: newWickets,
              overs: calculateOvers(newTotalBalls),
              batsman: outBatsman
            });
          }

          // Strike rotation
          let nextStriker = currentInningsState.strikerId;
          let nextNonStriker = currentInningsState.nonStrikerId;

          if (ball.isWicket) {
            if (ballInput.outPlayerId) {
              if (ballInput.outPlayerId === nextStriker) nextStriker = null;
              if (ballInput.outPlayerId === nextNonStriker) nextNonStriker = null;
            } else {
              // Regular wicket: Striker is out
              nextStriker = null;
            }
          }

          const runsForRotation = ball.runs + (['bye', 'leg-bye'].includes(ball.extras.type) ? ball.extras.runs : 0);
          if (runsForRotation % 2 !== 0) {
            [nextStriker, nextNonStriker] = [nextNonStriker, nextStriker];
          }

          // End of over rotation
          if (isLegalDelivery && newTotalBalls % 6 === 0) {
            [nextStriker, nextNonStriker] = [nextNonStriker, nextStriker];
          }

          let isMatchComplete: boolean = false;
          const battingTeamPlayers = state.setup?.[isFirstInnings ? 'teamAPlayers' : 'teamBPlayers'] || [];
          const isAllOut = newWickets >= Math.max(1, battingTeamPlayers.length - 1);
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
            strikerId: nextStriker,
            nonStrikerId: nextNonStriker,
            currentBowlerId: (isLegalDelivery && newTotalBalls % 6 === 0) ? null : currentInningsState.currentBowlerId,
            fallOfWickets: newFallOfWickets,
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

      addRunOut: (runsCompleted, outPlayerId) => {
        const state = get();
        const isFirstInnings = state.currentInnings === 1;
        const current = isFirstInnings ? state.firstInnings : state.secondInnings!;
        
        // Add a "virtual" ball for run out
        state.addBall({
          runs: runsCompleted,
          isWicket: true,
          extras: { type: 'none', runs: 0 },
          isBoundary: false,
          isSix: false,
          strikerId: current.strikerId,
          bowlerId: current.currentBowlerId,
          outPlayerId,
        });
      },

      addInjuredNotOut: (playerId) => {
        set((state) => {
          const snapshot = extractState(state);
          const isFirstInnings = state.currentInnings === 1;
          const current = isFirstInnings ? state.firstInnings : state.secondInnings!;
          
          let updatedStriker = current.strikerId;
          let updatedNonStriker = current.nonStrikerId;

          if (playerId === current.strikerId) updatedStriker = null;
          if (playerId === current.nonStrikerId) updatedNonStriker = null;

          const updated = { ...current, strikerId: updatedStriker, nonStrikerId: updatedNonStriker };
          return {
            actionHistory: [...state.actionHistory, snapshot],
            firstInnings: isFirstInnings ? updated : state.firstInnings,
            secondInnings: !isFirstInnings ? updated : state.secondInnings,
          };
        });
      },
    }),
    {
      name: 'cricket-match-storage',
    }
  )
);

function extractState(state: MatchStore): MatchState {
  return {
    matchId: state.matchId,
    setup: state.setup,
    currentInnings: state.currentInnings,
    firstInnings: state.firstInnings,
    secondInnings: state.secondInnings,
    target: state.target,
    isMatchComplete: state.isMatchComplete,
    matchStartTime: state.matchStartTime,
    toss: state.toss,
    recentPlayers: state.recentPlayers,
    isInitialized: state.isInitialized,
  };
}
