import {
  AnswerEntry,
  CategoryId,
  Player,
  PlayerStanding,
  RoundData,
  ValidationStatus,
} from '../types/game';
import { normalizeBengaliAnswer } from './bengaliText';

export const SCORE_UNIQUE_CORRECT = 10;
export const SCORE_SHARED_CORRECT = 5;
export const SCORE_ZERO = 0;

/**
 * Finds normalized non-empty answer texts that appear for two or more players
 * in a given category (useful for displaying match indicators during review).
 */
export function findMatchingTextsInCategory(entries: AnswerEntry[]): Set<string> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (entry.normalizedText.length > 0) {
      counts.set(entry.normalizedText, (counts.get(entry.normalizedText) ?? 0) + 1);
    }
  }
  const matches = new Set<string>();
  for (const [text, count] of counts.entries()) {
    if (count >= 2) {
      matches.add(text);
    }
  }
  return matches;
}

/**
 * Recalculates points and duplicate-match flags for all answers in a round.
 * - Empty or non-correct answers always receive 0 points.
 * - Correct unique answers receive 10 points.
 * - Correct answers matching at least one other player's correct answer receive 5 points.
 */
export function recalculateRoundScores(
  round: RoundData,
  categoryIds: CategoryId[]
): RoundData {
  const nextAnswers: Record<string, Record<CategoryId, AnswerEntry>> = {};
  for (const playerId of Object.keys(round.answers)) {
    nextAnswers[playerId] = { ...round.answers[playerId] };
  }

  let allNonEmptyValidated = true;

  for (const categoryId of categoryIds) {
    const correctCounts = new Map<string, number>();

    for (const playerId of Object.keys(nextAnswers)) {
      const existing = nextAnswers[playerId]?.[categoryId];
      if (!existing) {
        continue;
      }

      const normalizedText = normalizeBengaliAnswer(existing.rawText);
      const isEmpty = normalizedText.length === 0;
      const validation: ValidationStatus = isEmpty
        ? 'empty'
        : existing.validation === 'empty'
          ? 'pending'
          : existing.validation;

      if (!isEmpty && validation === 'pending') {
        allNonEmptyValidated = false;
      }

      if (validation === 'correct' && !isEmpty) {
        correctCounts.set(normalizedText, (correctCounts.get(normalizedText) ?? 0) + 1);
      }

      nextAnswers[playerId][categoryId] = {
        ...existing,
        normalizedText,
        validation,
      };
    }

    for (const playerId of Object.keys(nextAnswers)) {
      const entry = nextAnswers[playerId]?.[categoryId];
      if (!entry) {
        continue;
      }

      if (entry.validation === 'correct' && entry.normalizedText.length > 0) {
        const matchCount = correctCounts.get(entry.normalizedText) ?? 1;
        const isDuplicateMatch = matchCount >= 2;
        nextAnswers[playerId][categoryId] = {
          ...entry,
          isDuplicateMatch,
          points: isDuplicateMatch ? SCORE_SHARED_CORRECT : SCORE_UNIQUE_CORRECT,
        };
      } else {
        nextAnswers[playerId][categoryId] = {
          ...entry,
          isDuplicateMatch: false,
          points: SCORE_ZERO,
        };
      }
    }
  }

  return {
    ...round,
    answers: nextAnswers,
    isValidated: allNonEmptyValidated,
  };
}

/**
 * Updates a single answer's validation status in a round and recalculates the entire round.
 */
export function setAnswerValidation(
  round: RoundData,
  playerId: string,
  categoryId: CategoryId,
  status: 'correct' | 'incorrect',
  categoryIds: CategoryId[]
): RoundData {
  const playerAnswers = round.answers[playerId];
  const entry = playerAnswers?.[categoryId];
  if (!entry || entry.normalizedText.length === 0) {
    return round;
  }

  const updatedRound: RoundData = {
    ...round,
    answers: {
      ...round.answers,
      [playerId]: {
        ...playerAnswers,
        [categoryId]: {
          ...entry,
          validation: status,
        },
      },
    },
  };

  return recalculateRoundScores(updatedRound, categoryIds);
}

/**
 * Computes cumulative totals, tie-aware rankings, and winner(s) across all played rounds.
 */
export function calculateMatchStandings(
  players: Player[],
  rounds: RoundData[],
  categoryIds: CategoryId[]
): {
  standings: PlayerStanding[];
  winnerIds: string[];
  winnerNames: string[];
} {
  const statsMap = new Map<string, Omit<PlayerStanding, 'rank'>>();

  for (const player of players) {
    statsMap.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      totalScore: 0,
      correctCount: 0,
      uniqueCount: 0,
      sharedCount: 0,
    });
  }

  for (const round of rounds) {
    for (const player of players) {
      const stat = statsMap.get(player.id);
      const playerAnswers = round.answers[player.id];
      if (!stat || !playerAnswers) {
        continue;
      }

      for (const categoryId of categoryIds) {
        const entry = playerAnswers[categoryId];
        if (!entry || entry.validation !== 'correct') {
          continue;
        }
        stat.totalScore += entry.points;
        stat.correctCount += 1;
        if (entry.points === SCORE_UNIQUE_CORRECT) {
          stat.uniqueCount += 1;
        } else if (entry.points === SCORE_SHARED_CORRECT) {
          stat.sharedCount += 1;
        }
      }
    }
  }

  const orderedIndex = new Map(players.map((p, idx) => [p.id, idx]));

  const sorted = Array.from(statsMap.values()).sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.uniqueCount !== a.uniqueCount) return b.uniqueCount - a.uniqueCount;
    if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
    return (orderedIndex.get(a.playerId) ?? 0) - (orderedIndex.get(b.playerId) ?? 0);
  });

  const standings: PlayerStanding[] = [];
  let currentRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].totalScore < sorted[i - 1].totalScore) {
      currentRank = i + 1;
    }
    standings.push({
      ...sorted[i],
      rank: currentRank,
    });
  }

  const topScore = standings[0]?.totalScore ?? 0;
  const winners = standings.filter((s) => s.totalScore === topScore);

  return {
    standings,
    winnerIds: winners.map((w) => w.playerId),
    winnerNames: winners.map((w) => w.playerName),
  };
}
