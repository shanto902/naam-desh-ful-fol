import { BengaliLetterItem } from '../types/game';

/**
 * Full list of startable Bengali letters (excluding dependent signs like ং, ঃ, ঁ, ৎ
 * which cannot start a word). Rare/impractical starting letters are disabled by default
 * in random selection, and players can customize them anytime.
 */
export const BENGALI_ALPHABET: BengaliLetterItem[] = [
  // স্বরবর্ণ (Vowels)
  { char: 'অ', group: 'vowel', defaultEnabled: true },
  { char: 'আ', group: 'vowel', defaultEnabled: true },
  { char: 'ই', group: 'vowel', defaultEnabled: true },
  { char: 'ঈ', group: 'vowel', defaultEnabled: false, noteBn: 'শব্দ তুলনামূলক কম' },
  { char: 'উ', group: 'vowel', defaultEnabled: true },
  { char: 'ঊ', group: 'vowel', defaultEnabled: false, noteBn: 'শব্দ তুলনামূলক কম' },
  { char: 'ঋ', group: 'vowel', defaultEnabled: false, noteBn: 'শব্দ খুবই কম' },
  { char: 'এ', group: 'vowel', defaultEnabled: true },
  { char: 'ঐ', group: 'vowel', defaultEnabled: false, noteBn: 'শব্দ তুলনামূলক কম' },
  { char: 'ও', group: 'vowel', defaultEnabled: true },
  { char: 'ঔ', group: 'vowel', defaultEnabled: false, noteBn: 'শব্দ খুবই কম' },

  // ব্যঞ্জনবর্ণ (Consonants)
  { char: 'ক', group: 'consonant', defaultEnabled: true },
  { char: 'খ', group: 'consonant', defaultEnabled: true },
  { char: 'গ', group: 'consonant', defaultEnabled: true },
  { char: 'ঘ', group: 'consonant', defaultEnabled: true },
  { char: 'ঙ', group: 'consonant', defaultEnabled: false, noteBn: 'শব্দের শুরুতে প্রায় ব্যবহৃত হয় না' },
  { char: 'চ', group: 'consonant', defaultEnabled: true },
  { char: 'ছ', group: 'consonant', defaultEnabled: true },
  { char: 'জ', group: 'consonant', defaultEnabled: true },
  { char: 'ঝ', group: 'consonant', defaultEnabled: true },
  { char: 'ঞ', group: 'consonant', defaultEnabled: false, noteBn: 'শব্দের শুরুতে প্রায় ব্যবহৃত হয় না' },
  { char: 'ট', group: 'consonant', defaultEnabled: true },
  { char: 'ঠ', group: 'consonant', defaultEnabled: true },
  { char: 'ড', group: 'consonant', defaultEnabled: true },
  { char: 'ঢ', group: 'consonant', defaultEnabled: true },
  { char: 'ণ', group: 'consonant', defaultEnabled: false, noteBn: 'শব্দের শুরুতে প্রায় ব্যবহৃত হয় না' },
  { char: 'ত', group: 'consonant', defaultEnabled: true },
  { char: 'থ', group: 'consonant', defaultEnabled: true },
  { char: 'দ', group: 'consonant', defaultEnabled: true },
  { char: 'ধ', group: 'consonant', defaultEnabled: true },
  { char: 'ন', group: 'consonant', defaultEnabled: true },
  { char: 'প', group: 'consonant', defaultEnabled: true },
  { char: 'ফ', group: 'consonant', defaultEnabled: true },
  { char: 'ব', group: 'consonant', defaultEnabled: true },
  { char: 'ভ', group: 'consonant', defaultEnabled: true },
  { char: 'ম', group: 'consonant', defaultEnabled: true },
  { char: 'য', group: 'consonant', defaultEnabled: true },
  { char: 'র', group: 'consonant', defaultEnabled: true },
  { char: 'ল', group: 'consonant', defaultEnabled: true },
  { char: 'শ', group: 'consonant', defaultEnabled: true },
  { char: 'ষ', group: 'consonant', defaultEnabled: false, noteBn: 'শব্দ তুলনামূলক কম' },
  { char: 'স', group: 'consonant', defaultEnabled: true },
  { char: 'হ', group: 'consonant', defaultEnabled: true },
  { char: 'ড়', group: 'consonant', defaultEnabled: false, noteBn: 'শব্দের শুরুতে ব্যবহৃত হয় না' },
  { char: 'ঢ়', group: 'consonant', defaultEnabled: false, noteBn: 'শব্দের শুরুতে ব্যবহৃত হয় না' },
  { char: 'য়', group: 'consonant', defaultEnabled: false, noteBn: 'শব্দের শুরুতে প্রায় ব্যবহৃত হয় না' },
];

export const DEFAULT_ENABLED_LETTERS: string[] = BENGALI_ALPHABET
  .filter((item) => item.defaultEnabled)
  .map((item) => item.char);

export const ALL_VALID_LETTER_SET = new Set(BENGALI_ALPHABET.map((item) => item.char));
