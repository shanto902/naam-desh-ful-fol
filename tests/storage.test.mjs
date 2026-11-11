import assert from 'node:assert/strict';
import test from 'node:test';
import Module, { createRequire } from 'node:module';

const store = new Map();
const mockAsyncStorage = {
  async getItem(key) {
    return store.has(key) ? store.get(key) : null;
  },
  async setItem(key, value) {
    store.set(key, String(value));
  },
  async removeItem(key) {
    store.delete(key);
  },
};

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') {
    return { __esModule: true, default: mockAsyncStorage };
  }
  return originalLoad.apply(this, arguments);
};

const require = createRequire(import.meta.url);
const {
  loadMatchHistory,
  saveMatchRecord,
  getMatchRecordById,
  clearMatchHistory,
  loadAvailableLetters,
  saveAvailableLetters,
  loadSetupPreferences,
  saveSetupPreferences,
  DEFAULT_SETUP_PREFS,
} = require('/tmp/ndff-test-out/storage/gameStorage.js');
const { DEFAULT_ENABLED_LETTERS } = require('/tmp/ndff-test-out/constants/alphabet.js');

test('match history saves, deduplicates by id, retrieves by id, and clears cleanly', async () => {
  store.clear();
  assert.deepEqual(await loadMatchHistory(), []);

  const record1 = {
    id: 'm1',
    playedAt: '2026-11-12T00:00:00.000Z',
    players: [
      { id: 'p1', name: 'রাফি' },
      { id: 'p2', name: 'তানিয়া' },
    ],
    categoryIds: ['country', 'flower'],
    roundDuration: 60,
    letterMode: 'random',
    totalRounds: 1,
    rounds: [],
    standings: [
      {
        playerId: 'p1',
        playerName: 'রাফি',
        totalScore: 20,
        rank: 1,
        correctCount: 2,
        uniqueCount: 2,
        sharedCount: 0,
      },
    ],
    winnerIds: ['p1'],
    winnerNames: ['রাফি'],
  };

  await saveMatchRecord(record1);
  // Saving same ID again must deduplicate rather than duplicate entries
  await saveMatchRecord(record1);

  const loaded = await loadMatchHistory();
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].id, 'm1');

  const found = await getMatchRecordById('m1');
  assert.equal(found?.winnerNames[0], 'রাফি');
  assert.equal(await getMatchRecordById('missing'), null);

  await clearMatchHistory();
  assert.deepEqual(await loadMatchHistory(), []);
});

test('storage recovers gracefully from corrupted JSON and sanitizes preferences', async () => {
  store.clear();
  store.set('@ndff/match_history_v1', '{invalid json');
  store.set('@ndff/available_letters_v1', '{invalid');
  store.set('@ndff/setup_prefs_v1', '{"roundDuration":999,"letterMode":"weird"}');

  assert.deepEqual(await loadMatchHistory(), []);
  assert.deepEqual(await loadAvailableLetters(), DEFAULT_ENABLED_LETTERS);

  const prefs = await loadSetupPreferences();
  assert.equal(prefs.roundDuration, DEFAULT_SETUP_PREFS.roundDuration);
  assert.equal(prefs.letterMode, 'random');

  const savedLetters = await saveAvailableLetters(['ক', 'ম', 'A', 'ং']);
  assert.deepEqual(savedLetters, ['ক', 'ম']);
  assert.deepEqual(await loadAvailableLetters(), ['ক', 'ম']);

  await saveSetupPreferences({
    playerNames: ['অনিক', 'সারা'],
    categoryIds: ['country', 'fruit'],
    roundDuration: 45,
    totalRounds: 3,
    letterMode: 'manual',
  });
  const updatedPrefs = await loadSetupPreferences();
  assert.deepEqual(updatedPrefs.playerNames, ['অনিক', 'সারা']);
  assert.equal(updatedPrefs.roundDuration, 45);
  assert.equal(updatedPrefs.totalRounds, 3);
  assert.equal(updatedPrefs.letterMode, 'manual');
});
