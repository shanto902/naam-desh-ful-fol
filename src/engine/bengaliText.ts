import { AnswerEntry, CategoryId } from '../types/game';

/**
 * Normalizes Bengali answer text for fair duplicate comparison:
 * - Strips invisible zero-width spaces (\u200B) and BOM (\uFEFF)
 * - Applies Unicode NFC normalization so decomposed characters (e.g., ড + ় vs ড়) match
 * - Trims leading/trailing whitespace and collapses internal whitespace runs
 * - Preserves all meaningful Bengali characters, matras, chandrabindu, hasanta, and conjuncts
 */
export function normalizeBengaliAnswer(raw: string): string {
  return raw
    .replace(/[\u200B\uFEFF]/g, '')
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function isAnswerEmpty(raw: string): boolean {
  return normalizeBengaliAnswer(raw).length === 0;
}

export function createAnswerEntry(
  playerId: string,
  categoryId: CategoryId,
  rawText: string
): AnswerEntry {
  const normalizedText = normalizeBengaliAnswer(rawText);
  const empty = normalizedText.length === 0;
  return {
    playerId,
    categoryId,
    rawText: rawText.trim(),
    normalizedText,
    validation: empty ? 'empty' : 'pending',
    points: 0,
    isDuplicateMatch: false,
  };
}
