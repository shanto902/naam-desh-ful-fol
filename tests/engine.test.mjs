import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  normalizeBengaliAnswer,
  isAnswerEmpty,
  createAnswerEntry,
} = require('/tmp/ndff-test-out/engine/bengaliText.js');
const {
  sanitizeAvailableLetters,
  pickRandomBengaliLetter,
} = require('/tmp/ndff-test-out/engine/letterSelector.js');
const {
  recalculateRoundScores,
  setAnswerValidation,
  calculateMatchStandings,
  findMatchingTextsInCategory,
} = require('/tmp/ndff-test-out/engine/scoring.js');
const {
  DEFAULT_ENABLED_LETTERS,
} = require('/tmp/ndff-test-out/constants/alphabet.js');
const {
  DEFAULT_CATEGORIES,
} = require('/tmp/ndff-test-out/constants/categories.js');
const {
  toBengaliDigits,
  formatBengaliClock,
  getBengaliOrdinal,
  formatBengaliDateTime,
} = require('/tmp/ndff-test-out/utils/bengali.js');

test('default categories match all 10 required Bengali categories', () => {
  assert.deepEqual(
    DEFAULT_CATEGORIES.map((c) => c.nameBn),
    [
      'দেশের নাম',
      'ফুলের নাম',
      'ফলের নাম',
      'প্রাণীর নাম',
      'মানুষের নাম',
      'পেশার নাম',
      'খাবারের নাম',
      'নদীর নাম',
      'বস্তুর নাম',
      'স্থানের নাম',
    ]
  );
});

test('normalizeBengaliAnswer ignores extra whitespace and unifies NFC without stripping meaningful characters', () => {
  assert.equal(normalizeBengaliAnswer('   আম   '), 'আম');
  assert.equal(normalizeBengaliAnswer('কাজী   নজরুল    ইসলাম'), 'কাজী নজরুল ইসলাম');
  assert.equal(normalizeBengaliAnswer('\u200Bগোলাপ\uFEFF'), 'গোলাপ');

  // NFD vs NFC: ড + ় (\u09A1\u09BC) vs ড় (\u09DC), and ে + া vs ো
  const decomposed = '\u09A1\u09BC\u09BE\u09AC';
  const precomposed = '\u09DC\u09BE\u09AC';
  assert.equal(normalizeBengaliAnswer(decomposed), normalizeBengaliAnswer(precomposed));

  const splitVowel = 'ব\u09C7\u09BE\u09B2';
  const combinedVowel = 'ব\u09CB\u09B2';
  assert.equal(normalizeBengaliAnswer(splitVowel), normalizeBengaliAnswer(combinedVowel));

  // Meaningful characters must NOT be collapsed
  assert.notEqual(normalizeBengaliAnswer('কাঁঠাল'), normalizeBengaliAnswer('কাঠাল'));
  assert.notEqual(normalizeBengaliAnswer('কমল'), normalizeBengaliAnswer('কমলা'));
  assert.notEqual(normalizeBengaliAnswer('বাংলাদেশ'), normalizeBengaliAnswer('বাংলা'));

  assert.equal(isAnswerEmpty('   \u200B  '), true);
  assert.equal(isAnswerEmpty('বই'), false);
});

test('letterSelector filters invalid letters, avoids used letters, and handles pool exhaustion', () => {
  assert.equal(DEFAULT_ENABLED_LETTERS.includes('ঙ'), false);
  assert.equal(DEFAULT_ENABLED_LETTERS.includes('ঞ'), false);
  assert.equal(DEFAULT_ENABLED_LETTERS.includes('ণ'), false);
  assert.equal(DEFAULT_ENABLED_LETTERS.includes('ক'), true);

  const sanitized = sanitizeAvailableLetters(['A', 'ং', 'ৎ', 'ক', 'ক', 'অ', 'ঙ']);
  assert.deepEqual(sanitized, ['অ', 'ক', 'ঙ']);

  const fallback = sanitizeAvailableLetters(['X', 'ং']);
  assert.deepEqual(fallback, DEFAULT_ENABLED_LETTERS);

  const picked = pickRandomBengaliLetter(['ক', 'ম'], ['ক'], () => 0);
  assert.equal(picked, 'ম');

  // Exhaustion still returns a valid letter from available pool
  const exhausted = pickRandomBengaliLetter(['ক', 'ম'], ['ক', 'ম'], () => 0.99);
  assert.equal(exhausted, 'ম');
});

test('scoring enforces manual verification and recalculates unique/duplicate points accurately', () => {
  const categories = ['country', 'flower', 'fruit'];

  const round = {
    roundNumber: 1,
    letter: 'ক',
    startedAt: '2026-11-12T00:00:00.000Z',
    submittedByPlayerIds: ['p1', 'p2'],
    isValidated: false,
    answers: {
      p1: {
        country: createAnswerEntry('p1', 'country', '  কানাডা '),
        flower: createAnswerEntry('p1', 'flower', 'কদম'),
        fruit: createAnswerEntry('p1', 'fruit', '   '),
      },
      p2: {
        country: createAnswerEntry('p2', 'country', 'কানাডা'),
        flower: createAnswerEntry('p2', 'flower', 'কৃষ্ণচূড়া'),
        fruit: createAnswerEntry('p2', 'fruit', 'কলম'),
      },
    },
  };

  assert.equal(round.answers.p1.country.validation, 'pending');
  assert.equal(round.answers.p2.fruit.validation, 'pending');
  assert.equal(round.answers.p1.fruit.validation, 'empty');

  const initialRecalc = recalculateRoundScores(round, categories);
  assert.equal(initialRecalc.isValidated, false);
  assert.equal(initialRecalc.answers.p1.country.points, 0);

  const dupes = findMatchingTextsInCategory([
    initialRecalc.answers.p1.country,
    initialRecalc.answers.p2.country,
  ]);
  assert.equal(dupes.has('কানাডা'), true);

  let updated = setAnswerValidation(initialRecalc, 'p1', 'country', 'correct', categories);
  assert.equal(updated.answers.p1.country.points, 10);

  updated = setAnswerValidation(updated, 'p2', 'country', 'correct', categories);
  assert.equal(updated.answers.p1.country.points, 5);
  assert.equal(updated.answers.p2.country.points, 5);
  assert.equal(updated.answers.p1.country.isDuplicateMatch, true);

  updated = setAnswerValidation(updated, 'p2', 'country', 'incorrect', categories);
  assert.equal(updated.answers.p1.country.points, 10);
  assert.equal(updated.answers.p2.country.points, 0);

  updated = setAnswerValidation(updated, 'p2', 'country', 'correct', categories);
  updated = setAnswerValidation(updated, 'p1', 'flower', 'correct', categories);
  updated = setAnswerValidation(updated, 'p2', 'flower', 'correct', categories);
  updated = setAnswerValidation(updated, 'p2', 'fruit', 'incorrect', categories);

  assert.equal(updated.isValidated, true);
  assert.equal(updated.answers.p1.flower.points, 10);
  assert.equal(updated.answers.p2.flower.points, 10);
  assert.equal(updated.answers.p2.fruit.points, 0);

  const players = [
    { id: 'p1', name: 'রাফি' },
    { id: 'p2', name: 'তানিয়া' },
  ];
  const { standings, winnerIds } = calculateMatchStandings(players, [updated], categories);
  assert.equal(standings[0].totalScore, 15);
  assert.equal(standings[1].totalScore, 15);
  assert.equal(standings[0].rank, 1);
  assert.equal(standings[1].rank, 1);
  assert.deepEqual(winnerIds, ['p1', 'p2']);
});

test('multi-round standings handle 4 players with tie-aware ranks accurately', () => {
  const categories = ['country'];
  const players = [
    { id: 'p1', name: 'অনন্যা' },
    { id: 'p2', name: 'সাকিব' },
    { id: 'p3', name: 'মীম' },
    { id: 'p4', name: 'তপু' },
  ];

  let r1 = {
    roundNumber: 1,
    letter: 'ব',
    startedAt: '2026-11-12T00:00:00.000Z',
    submittedByPlayerIds: ['p1', 'p2', 'p3', 'p4'],
    isValidated: false,
    answers: {
      p1: { country: createAnswerEntry('p1', 'country', 'ব্রাজিল') },
      p2: { country: createAnswerEntry('p2', 'country', 'বাংলাদেশ') },
      p3: { country: createAnswerEntry('p3', 'country', '  বাংলাদেশ  ') },
      p4: { country: createAnswerEntry('p4', 'country', '') },
    },
  };
  r1 = setAnswerValidation(r1, 'p1', 'country', 'correct', categories);
  r1 = setAnswerValidation(r1, 'p2', 'country', 'correct', categories);
  r1 = setAnswerValidation(r1, 'p3', 'country', 'correct', categories);

  let r2 = {
    roundNumber: 2,
    letter: 'জ',
    startedAt: '2026-11-12T00:05:00.000Z',
    submittedByPlayerIds: ['p1', 'p2', 'p3', 'p4'],
    isValidated: false,
    answers: {
      p1: { country: createAnswerEntry('p1', 'country', 'জাপান') },
      p2: { country: createAnswerEntry('p2', 'country', 'জার্মানি') },
      p3: { country: createAnswerEntry('p3', 'country', 'জ্যামাইকা') },
      p4: { country: createAnswerEntry('p4', 'country', 'জর্দান') },
    },
  };
  for (const p of players) {
    r2 = setAnswerValidation(r2, p.id, 'country', 'correct', categories);
  }

  // Totals: p1 = 20, p2 = 15, p3 = 15, p4 = 10 -> ranks 1, 2, 2, 4
  const { standings, winnerIds } = calculateMatchStandings(players, [r1, r2], categories);
  assert.deepEqual(
    standings.map((s) => ({ id: s.playerId, score: s.totalScore, rank: s.rank })),
    [
      { id: 'p1', score: 20, rank: 1 },
      { id: 'p2', score: 15, rank: 2 },
      { id: 'p3', score: 15, rank: 2 },
      { id: 'p4', score: 10, rank: 4 },
    ]
  );
  assert.deepEqual(winnerIds, ['p1']);
});

test('Bengali numeral and formatting helpers never emit English text', () => {
  assert.equal(toBengaliDigits(1234567890), '১২৩৪৫৬৭৮৯০');
  assert.equal(formatBengaliClock(60), '০১:০০');
  assert.equal(formatBengaliClock(9), '০০:০৯');
  assert.equal(getBengaliOrdinal(1), '১ম');
  assert.equal(getBengaliOrdinal(4), '৪র্থ');

  const formattedDate = formatBengaliDateTime('2026-11-12T14:05:00+06:00');
  assert.equal(/[A-Za-z0-9]/.test(formattedDate), false);
});
