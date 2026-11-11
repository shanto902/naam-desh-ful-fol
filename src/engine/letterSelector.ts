import {
  ALL_VALID_LETTER_SET,
  BENGALI_ALPHABET,
  DEFAULT_ENABLED_LETTERS,
} from '../constants/alphabet';

/**
 * Filters a user-configured letter pool to valid Bengali starting letters
 * in canonical alphabet order, falling back to defaults if empty.
 */
export function sanitizeAvailableLetters(letters: string[]): string[] {
  const selectedSet = new Set(
    letters
      .map((l) => l.normalize('NFC').trim())
      .filter((l) => ALL_VALID_LETTER_SET.has(l))
  );

  const ordered = BENGALI_ALPHABET
    .map((item) => item.char)
    .filter((char) => selectedSet.has(char));

  return ordered.length > 0 ? ordered : [...DEFAULT_ENABLED_LETTERS];
}

/**
 * Selects a random Bengali letter from the configured pool.
 * Prefers letters not yet used in earlier rounds of the same match.
 */
export function pickRandomBengaliLetter(
  availableLetters: string[],
  usedLetters: string[] = [],
  rng: () => number = Math.random
): string {
  const validPool = sanitizeAvailableLetters(availableLetters);
  const usedSet = new Set(usedLetters.map((l) => l.normalize('NFC')));
  const unused = validPool.filter((char) => !usedSet.has(char));
  const pool = unused.length > 0 ? unused : validPool;

  const rawIndex = Math.floor(rng() * pool.length);
  const safeIndex = Math.max(0, Math.min(pool.length - 1, rawIndex));
  return pool[safeIndex];
}
