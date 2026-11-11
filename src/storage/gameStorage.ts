import AsyncStorage from '@react-native-async-storage/async-storage';

import { ALL_CATEGORY_IDS } from '../constants/categories';
import { DEFAULT_ENABLED_LETTERS } from '../constants/alphabet';
import { sanitizeAvailableLetters } from '../engine/letterSelector';
import {
  CategoryId,
  LetterMode,
  MatchRecord,
  RoundDuration,
} from '../types/game';

const STORAGE_KEYS = {
  MATCH_HISTORY: '@ndff/match_history_v1',
  AVAILABLE_LETTERS: '@ndff/available_letters_v1',
  SETUP_PREFS: '@ndff/setup_prefs_v1',
} as const;

export interface SetupPreferences {
  playerNames: string[];
  categoryIds: CategoryId[];
  roundDuration: RoundDuration;
  totalRounds: number;
  letterMode: LetterMode;
}

const VALID_CATEGORY_SET = new Set<string>(ALL_CATEGORY_IDS);
const VALID_DURATIONS = new Set<number>([30, 45, 60, 90, 120]);
const VALID_ROUND_COUNTS = new Set<number>([1, 2, 3, 5]);

export const DEFAULT_SETUP_PREFS: SetupPreferences = {
  playerNames: ['খেলোয়াড় ১', 'খেলোয়াড় ২'],
  categoryIds: [...ALL_CATEGORY_IDS],
  roundDuration: 60,
  totalRounds: 1,
  letterMode: 'random',
};

export async function loadMatchHistory(): Promise<MatchRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is MatchRecord =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as MatchRecord).id === 'string' &&
        Array.isArray((item as MatchRecord).standings) &&
        Array.isArray((item as MatchRecord).rounds)
    );
  } catch {
    return [];
  }
}

export async function saveMatchRecord(record: MatchRecord): Promise<MatchRecord[]> {
  const existing = await loadMatchHistory();
  const deduped = [record, ...existing.filter((item) => item.id !== record.id)];
  await AsyncStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(deduped));
  return deduped;
}

export async function getMatchRecordById(id: string): Promise<MatchRecord | null> {
  const records = await loadMatchHistory();
  return records.find((item) => item.id === id) ?? null;
}

export async function clearMatchHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.MATCH_HISTORY);
}

export async function loadAvailableLetters(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.AVAILABLE_LETTERS);
    if (!raw) return [...DEFAULT_ENABLED_LETTERS];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_ENABLED_LETTERS];
    const strings = parsed.filter((x): x is string => typeof x === 'string');
    return sanitizeAvailableLetters(strings);
  } catch {
    return [...DEFAULT_ENABLED_LETTERS];
  }
}

export async function saveAvailableLetters(letters: string[]): Promise<string[]> {
  const sanitized = sanitizeAvailableLetters(letters);
  await AsyncStorage.setItem(STORAGE_KEYS.AVAILABLE_LETTERS, JSON.stringify(sanitized));
  return sanitized;
}

export async function loadSetupPreferences(): Promise<SetupPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETUP_PREFS);
    if (!raw) return { ...DEFAULT_SETUP_PREFS };
    const parsed = JSON.parse(raw) as Partial<SetupPreferences> | null;
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SETUP_PREFS };

    const playerNames = Array.isArray(parsed.playerNames)
      ? parsed.playerNames
          .filter((n): n is string => typeof n === 'string')
          .slice(0, 6)
      : [...DEFAULT_SETUP_PREFS.playerNames];

    const categoryIds = Array.isArray(parsed.categoryIds)
      ? parsed.categoryIds.filter((c): c is CategoryId =>
          typeof c === 'string' && VALID_CATEGORY_SET.has(c)
        )
      : [...DEFAULT_SETUP_PREFS.categoryIds];

    const roundDuration =
      typeof parsed.roundDuration === 'number' && VALID_DURATIONS.has(parsed.roundDuration)
        ? (parsed.roundDuration as RoundDuration)
        : DEFAULT_SETUP_PREFS.roundDuration;

    const totalRounds =
      typeof parsed.totalRounds === 'number' && VALID_ROUND_COUNTS.has(parsed.totalRounds)
        ? parsed.totalRounds
        : DEFAULT_SETUP_PREFS.totalRounds;

    const letterMode: LetterMode =
      parsed.letterMode === 'manual' ? 'manual' : 'random';

    return {
      playerNames: playerNames.length >= 2 ? playerNames : [...DEFAULT_SETUP_PREFS.playerNames],
      categoryIds: categoryIds.length >= 1 ? categoryIds : [...DEFAULT_SETUP_PREFS.categoryIds],
      roundDuration,
      totalRounds,
      letterMode,
    };
  } catch {
    return { ...DEFAULT_SETUP_PREFS };
  }
}

export async function saveSetupPreferences(prefs: SetupPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETUP_PREFS, JSON.stringify(prefs));
  } catch {
    // Preference caching is best-effort; avoid interrupting gameplay flow
  }
}
