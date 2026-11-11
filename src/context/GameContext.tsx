import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { DEFAULT_ENABLED_LETTERS } from '../constants/alphabet';
import { createAnswerEntry } from '../engine/bengaliText';
import { pickRandomBengaliLetter } from '../engine/letterSelector';
import {
  calculateMatchStandings,
  recalculateRoundScores,
  setAnswerValidation,
} from '../engine/scoring';
import {
  loadAvailableLetters,
  saveAvailableLetters,
  saveMatchRecord,
} from '../storage/gameStorage';
import {
  AnswerEntry,
  CategoryId,
  GameConfig,
  MatchRecord,
  RoundData,
} from '../types/game';

export type TurnPhase = 'handoff' | 'playing' | 'timeup' | 'review' | 'finished';

export interface ActiveMatchState {
  matchId: string;
  config: GameConfig;
  rounds: RoundData[];
  currentRoundIndex: number;
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  currentDrafts: Record<string, string>;
  finalizedRecord: MatchRecord | null;
}

interface GameContextValue {
  activeMatch: ActiveMatchState | null;
  availableLetters: string[];
  lettersLoaded: boolean;
  updateAvailableLetters: (letters: string[]) => Promise<string[]>;
  startMatch: (config: GameConfig) => ActiveMatchState;
  beginCurrentTurn: () => void;
  updateDraftAnswer: (categoryId: CategoryId, text: string) => void;
  markCurrentTurnTimeUp: () => void;
  submitCurrentTurn: () => { nextScreen: 'game' | 'review' };
  validateAnswer: (
    playerId: string,
    categoryId: CategoryId,
    status: 'correct' | 'incorrect'
  ) => void;
  advanceToNextRound: (manualLetter?: string) => void;
  finalizeCurrentMatch: () => Promise<MatchRecord | null>;
  clearActiveMatch: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function generateMatchId(): string {
  return `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyDrafts(categoryIds: CategoryId[]): Record<string, string> {
  const drafts: Record<string, string> = {};
  for (const id of categoryIds) {
    drafts[id] = '';
  }
  return drafts;
}

function createRound(roundNumber: number, letter: string): RoundData {
  return {
    roundNumber,
    letter,
    startedAt: new Date().toISOString(),
    submittedByPlayerIds: [],
    answers: {},
    isValidated: false,
  };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [activeMatch, setActiveMatch] = useState<ActiveMatchState | null>(null);
  const [availableLetters, setAvailableLetters] = useState<string[]>([
    ...DEFAULT_ENABLED_LETTERS,
  ]);
  const [lettersLoaded, setLettersLoaded] = useState(false);
  const finalizedRef = useRef<Record<string, MatchRecord>>({});

  useEffect(() => {
    let mounted = true;
    loadAvailableLetters()
      .then((letters) => {
        if (mounted) {
          setAvailableLetters(letters);
          setLettersLoaded(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setLettersLoaded(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const updateAvailableLetters = useCallback(async (letters: string[]) => {
    const saved = await saveAvailableLetters(letters);
    setAvailableLetters(saved);
    return saved;
  }, []);

  const startMatch = useCallback((config: GameConfig): ActiveMatchState => {
    const firstLetter =
      config.letterMode === 'manual' && config.manualLetter
        ? config.manualLetter
        : pickRandomBengaliLetter(config.availableLetters);

    const nextState: ActiveMatchState = {
      matchId: generateMatchId(),
      config,
      rounds: [createRound(1, firstLetter)],
      currentRoundIndex: 0,
      currentPlayerIndex: 0,
      turnPhase: 'handoff',
      currentDrafts: createEmptyDrafts(config.categoryIds),
      finalizedRecord: null,
    };

    setActiveMatch(nextState);
    return nextState;
  }, []);

  const beginCurrentTurn = useCallback(() => {
    setActiveMatch((prev) => {
      if (!prev || prev.turnPhase !== 'handoff') return prev;
      return {
        ...prev,
        turnPhase: 'playing',
      };
    });
  }, []);

  const updateDraftAnswer = useCallback((categoryId: CategoryId, text: string) => {
    setActiveMatch((prev) => {
      if (!prev || prev.turnPhase !== 'playing') return prev;
      return {
        ...prev,
        currentDrafts: {
          ...prev.currentDrafts,
          [categoryId]: text,
        },
      };
    });
  }, []);

  const markCurrentTurnTimeUp = useCallback(() => {
    setActiveMatch((prev) => {
      if (!prev || prev.turnPhase !== 'playing') return prev;
      return {
        ...prev,
        turnPhase: 'timeup',
      };
    });
  }, []);

  const submitCurrentTurn = useCallback((): { nextScreen: 'game' | 'review' } => {
    const isLastPlayerNow = activeMatch
      ? activeMatch.currentPlayerIndex + 1 >= activeMatch.config.players.length
      : false;

    setActiveMatch((prev) => {
      if (!prev) return prev;
      const currentRound = prev.rounds[prev.currentRoundIndex];
      const currentPlayer = prev.config.players[prev.currentPlayerIndex];
      if (!currentRound || !currentPlayer) return prev;

      const playerEntries = {} as Record<CategoryId, AnswerEntry>;
      for (const categoryId of prev.config.categoryIds) {
        const rawText = prev.currentDrafts[categoryId] ?? '';
        playerEntries[categoryId] = createAnswerEntry(
          currentPlayer.id,
          categoryId,
          rawText
        );
      }

      const updatedRoundRaw: RoundData = {
        ...currentRound,
        submittedByPlayerIds: currentRound.submittedByPlayerIds.includes(currentPlayer.id)
          ? currentRound.submittedByPlayerIds
          : [...currentRound.submittedByPlayerIds, currentPlayer.id],
        answers: {
          ...currentRound.answers,
          [currentPlayer.id]: playerEntries,
        },
      };

      const isLastPlayer = prev.currentPlayerIndex + 1 >= prev.config.players.length;
      const updatedRound = isLastPlayer
        ? recalculateRoundScores(updatedRoundRaw, prev.config.categoryIds)
        : updatedRoundRaw;

      const nextRounds = prev.rounds.map((r, idx) =>
        idx === prev.currentRoundIndex ? updatedRound : r
      );

      if (isLastPlayer) {
        return {
          ...prev,
          rounds: nextRounds,
          turnPhase: 'review',
          currentDrafts: createEmptyDrafts(prev.config.categoryIds),
        };
      }

      return {
        ...prev,
        rounds: nextRounds,
        currentPlayerIndex: prev.currentPlayerIndex + 1,
        turnPhase: 'handoff',
        currentDrafts: createEmptyDrafts(prev.config.categoryIds),
      };
    });

    return { nextScreen: isLastPlayerNow ? 'review' : 'game' };
  }, [activeMatch]);

  const validateAnswer = useCallback(
    (playerId: string, categoryId: CategoryId, status: 'correct' | 'incorrect') => {
      setActiveMatch((prev) => {
        if (!prev) return prev;
        const currentRound = prev.rounds[prev.currentRoundIndex];
        if (!currentRound) return prev;

        const recalculated = setAnswerValidation(
          currentRound,
          playerId,
          categoryId,
          status,
          prev.config.categoryIds
        );

        const nextRounds = prev.rounds.map((r, idx) =>
          idx === prev.currentRoundIndex ? recalculated : r
        );

        return {
          ...prev,
          rounds: nextRounds,
        };
      });
    },
    []
  );

  const advanceToNextRound = useCallback((manualLetter?: string) => {
    setActiveMatch((prev) => {
      if (!prev) return prev;
      const nextRoundNumber = prev.currentRoundIndex + 2;
      if (nextRoundNumber > prev.config.totalRounds) return prev;

      const usedLetters = prev.rounds.map((r) => r.letter);
      const nextLetter =
        manualLetter ?? pickRandomBengaliLetter(prev.config.availableLetters, usedLetters);

      const newRound = createRound(nextRoundNumber, nextLetter);

      return {
        ...prev,
        rounds: [...prev.rounds, newRound],
        currentRoundIndex: prev.currentRoundIndex + 1,
        currentPlayerIndex: 0,
        turnPhase: 'handoff',
        currentDrafts: createEmptyDrafts(prev.config.categoryIds),
      };
    });
  }, []);

  const finalizeCurrentMatch = useCallback(async (): Promise<MatchRecord | null> => {
    if (!activeMatch) return null;
    if (activeMatch.finalizedRecord) {
      return activeMatch.finalizedRecord;
    }
    const cached = finalizedRef.current[activeMatch.matchId];
    if (cached) {
      return cached;
    }

    const { standings, winnerIds, winnerNames } = calculateMatchStandings(
      activeMatch.config.players,
      activeMatch.rounds,
      activeMatch.config.categoryIds
    );

    const record: MatchRecord = {
      id: activeMatch.matchId,
      playedAt: new Date().toISOString(),
      players: activeMatch.config.players,
      categoryIds: activeMatch.config.categoryIds,
      roundDuration: activeMatch.config.roundDuration,
      letterMode: activeMatch.config.letterMode,
      totalRounds: activeMatch.rounds.length,
      rounds: activeMatch.rounds,
      standings,
      winnerIds,
      winnerNames,
    };

    finalizedRef.current[record.id] = record;
    try {
      await saveMatchRecord(record);
    } catch (err) {
      delete finalizedRef.current[record.id];
      throw err;
    }

    setActiveMatch((prev) => {
      if (!prev || prev.matchId !== record.id) return prev;
      return {
        ...prev,
        turnPhase: 'finished',
        finalizedRecord: record,
      };
    });

    return record;
  }, [activeMatch]);

  const clearActiveMatch = useCallback(() => {
    setActiveMatch(null);
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      activeMatch,
      availableLetters,
      lettersLoaded,
      updateAvailableLetters,
      startMatch,
      beginCurrentTurn,
      updateDraftAnswer,
      markCurrentTurnTimeUp,
      submitCurrentTurn,
      validateAnswer,
      advanceToNextRound,
      finalizeCurrentMatch,
      clearActiveMatch,
    }),
    [
      activeMatch,
      availableLetters,
      lettersLoaded,
      updateAvailableLetters,
      startMatch,
      beginCurrentTurn,
      updateDraftAnswer,
      markCurrentTurnTimeUp,
      submitCurrentTurn,
      validateAnswer,
      advanceToNextRound,
      finalizeCurrentMatch,
      clearActiveMatch,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used inside GameProvider');
  }
  return ctx;
}
