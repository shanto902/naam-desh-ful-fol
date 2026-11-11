export type CategoryId =
  | 'country'
  | 'flower'
  | 'fruit'
  | 'animal'
  | 'person'
  | 'profession'
  | 'food'
  | 'river'
  | 'object'
  | 'place';

export interface Category {
  id: CategoryId;
  nameBn: string;
  iconName: string;
  accentColor: string;
  bgColor: string;
  placeholderBn: string;
}

export type RoundDuration = 30 | 45 | 60 | 90 | 120;

export type LetterMode = 'random' | 'manual';

export interface Player {
  id: string;
  name: string;
}

export type ValidationStatus = 'pending' | 'correct' | 'incorrect' | 'empty';

export interface AnswerEntry {
  playerId: string;
  categoryId: CategoryId;
  rawText: string;
  normalizedText: string;
  validation: ValidationStatus;
  points: number;
  isDuplicateMatch: boolean;
}

export interface RoundData {
  roundNumber: number;
  letter: string;
  startedAt: string;
  submittedByPlayerIds: string[];
  answers: Record<string, Record<CategoryId, AnswerEntry>>;
  isValidated: boolean;
}

export interface PlayerStanding {
  playerId: string;
  playerName: string;
  totalScore: number;
  rank: number;
  correctCount: number;
  uniqueCount: number;
  sharedCount: number;
}

export interface MatchRecord {
  id: string;
  playedAt: string;
  players: Player[];
  categoryIds: CategoryId[];
  roundDuration: RoundDuration;
  letterMode: LetterMode;
  totalRounds: number;
  rounds: RoundData[];
  standings: PlayerStanding[];
  winnerIds: string[];
  winnerNames: string[];
}

export interface GameConfig {
  players: Player[];
  categoryIds: CategoryId[];
  roundDuration: RoundDuration;
  letterMode: LetterMode;
  manualLetter: string | null;
  totalRounds: number;
  availableLetters: string[];
}

export interface BengaliLetterItem {
  char: string;
  group: 'vowel' | 'consonant';
  defaultEnabled: boolean;
  noteBn?: string;
}
