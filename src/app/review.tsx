import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BnText } from '../components/BnText';
import { ConfirmModal } from '../components/ConfirmModal';
import { ManualLetterPickerModal } from '../components/ManualLetterPickerModal';
import { PrimaryButton } from '../components/PrimaryButton';
import { CATEGORY_MAP } from '../constants/categories';
import { AppColors } from '../constants/theme';
import { useGame } from '../context/GameContext';
import {
  calculateMatchStandings,
  findMatchingTextsInCategory,
} from '../engine/scoring';
import { toBengaliDigits } from '../utils/bengali';

export default function ReviewScreen() {
  const router = useRouter();
  const {
    activeMatch,
    validateAnswer,
    advanceToNextRound,
    finalizeCurrentMatch,
    clearActiveMatch,
  } = useGame();

  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [nextRoundLetterOpen, setNextRoundLetterOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setExitModalOpen(true);
      return true;
    });
    return () => sub.remove();
  }, []);

  const currentRound = activeMatch?.rounds[activeMatch.currentRoundIndex];

  const { pendingCount, totalNonEmpty, verifiedCount } = useMemo(() => {
    if (!activeMatch || !currentRound) {
      return { pendingCount: 0, totalNonEmpty: 0, verifiedCount: 0 };
    }
    let pending = 0;
    let nonEmpty = 0;
    let verified = 0;

    for (const player of activeMatch.config.players) {
      const pAnswers = currentRound.answers[player.id];
      if (!pAnswers) continue;
      for (const catId of activeMatch.config.categoryIds) {
        const entry = pAnswers[catId];
        if (!entry || entry.validation === 'empty') continue;
        nonEmpty += 1;
        if (entry.validation === 'pending') {
          pending += 1;
        } else {
          verified += 1;
        }
      }
    }
    return {
      pendingCount: pending,
      totalNonEmpty: nonEmpty,
      verifiedCount: verified,
    };
  }, [activeMatch, currentRound]);

  const liveStandings = useMemo(() => {
    if (!activeMatch) return [];
    return calculateMatchStandings(
      activeMatch.config.players,
      activeMatch.rounds,
      activeMatch.config.categoryIds
    ).standings;
  }, [activeMatch]);

  const roundScoresByPlayer = useMemo(() => {
    const map: Record<string, number> = {};
    if (!activeMatch || !currentRound) return map;
    for (const player of activeMatch.config.players) {
      let sum = 0;
      const pAnswers = currentRound.answers[player.id];
      if (pAnswers) {
        for (const catId of activeMatch.config.categoryIds) {
          sum += pAnswers[catId]?.points ?? 0;
        }
      }
      map[player.id] = sum;
    }
    return map;
  }, [activeMatch, currentRound]);

  if (!activeMatch || !currentRound) {
    return (
      <SafeAreaView className="flex-1 bg-ivory items-center justify-center px-6">
        <View className="w-full max-w-sm bg-surface rounded-3xl p-6 border border-parchment items-center">
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={42}
            color={AppColors.slateMuted}
          />
          <BnText weight="bold" className="text-lg text-ink mt-3 text-center">
            যাচাই করার মতো কোনো রাউন্ড পাওয়া যায়নি
          </BnText>
          <PrimaryButton
            label="হোমে ফিরে যান"
            onPress={() => router.replace('/')}
            className="w-full mt-5"
          />
        </View>
      </SafeAreaView>
    );
  }

  const { config, currentRoundIndex, rounds } = activeMatch;
  const hasMoreRounds = currentRoundIndex + 1 < config.totalRounds;
  const canContinue = pendingCount === 0;

  const handleToggleValidation = (
    playerId: string,
    categoryId: typeof config.categoryIds[number],
    status: 'correct' | 'incorrect'
  ) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    validateAnswer(playerId, categoryId, status);
  };

  const handleProceed = async () => {
    if (!canContinue) return;
    setSaveError(null);

    if (hasMoreRounds) {
      if (config.letterMode === 'manual') {
        setNextRoundLetterOpen(true);
      } else {
        advanceToNextRound();
        router.replace('/game');
      }
      return;
    }

    setSaving(true);
    try {
      await finalizeCurrentMatch();
      router.replace('/results');
    } catch {
      setSaveError('ফলাফল সংরক্ষণে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      setSaving(false);
    }
  };

  const handleExit = () => {
    setExitModalOpen(false);
    clearActiveMatch();
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3 border-b border-parchment bg-ivory">
        <Pressable
          onPress={() => setExitModalOpen(true)}
          accessibilityLabel="বাতিল করে হোমে যান"
          className="w-9 h-9 rounded-full bg-surface border border-parchment items-center justify-center active:opacity-75"
        >
          <MaterialCommunityIcons name="close" size={19} color={AppColors.ink} />
        </Pressable>

        <View className="items-center flex-1 px-2">
          <BnText weight="bold" className="text-lg text-ink">
            উত্তর যাচাই ও স্কোরিং
          </BnText>
          <BnText weight="medium" className="text-xs text-slateMuted">
            রাউন্ড {toBengaliDigits(currentRoundIndex + 1)}/
            {toBengaliDigits(config.totalRounds)} • নির্ধারিত বর্ণ:{' '}
            <BnText inline weight="bold" className="text-emeraldDark">
              {currentRound.letter}
            </BnText>
          </BnText>
        </View>

        <View className="w-10 h-10 rounded-full bg-emeraldBrand items-center justify-center border-2 border-amberSoft">
          <BnText weight="bold" className="text-lg text-white">
            {currentRound.letter}
          </BnText>
        </View>
      </View>

      {/* Live Score Strip */}
      <View className="bg-surface border-b border-parchment px-4 py-2.5">
        <View className="flex-row items-center justify-between mb-2">
          <BnText weight="bold" className="text-xs text-slateMuted">
            লাইভ পয়েন্ট হিসাব {hasMoreRounds ? '(মোট ম্যাচ স্কোর)' : ''}
          </BnText>
          <View
            className={`px-2.5 py-0.5 rounded-full ${
              canContinue ? 'bg-emeraldSoft' : 'bg-amberSoft'
            }`}
          >
            <BnText
              weight="bold"
              className={`text-xs ${
                canContinue ? 'text-emeraldDark' : 'text-amberWarm'
              }`}
            >
              যাচাই: {toBengaliDigits(verifiedCount)}/
              {toBengaliDigits(totalNonEmpty)}
            </BnText>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {liveStandings.map((standing) => {
              const roundPts = roundScoresByPlayer[standing.playerId] ?? 0;
              return (
                <View
                  key={standing.playerId}
                  className="px-3 py-1.5 rounded-xl bg-ivory border border-parchment flex-row items-center gap-2"
                >
                  <BnText weight="semibold" className="text-xs text-ink">
                    {standing.playerName}
                  </BnText>
                  <View className="px-2 py-0.5 rounded-lg bg-emeraldSoft">
                    <BnText weight="bold" className="text-xs text-emeraldDark">
                      {toBengaliDigits(standing.totalScore)}
                      {hasMoreRounds
                        ? ` (+${toBengaliDigits(roundPts)})`
                        : ' পয়েন্ট'}
                    </BnText>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Category Grouped Answers */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-3 p-3 rounded-2xl bg-indigoSoft/70 border border-indigo/15 flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={AppColors.indigo}
          />
          <BnText className="text-xs text-ink/80 flex-1 leading-5">
            প্রতিটি উত্তর যাচাই করে{' '}
            <BnText inline weight="bold">
              সঠিক
            </BnText>{' '}
            অথবা{' '}
            <BnText inline weight="bold">
              ভুল
            </BnText>{' '}
            নির্বাচন করুন। সঠিক ও অনন্য উত্তরে ১০ পয়েন্ট এবং একাধিক খেলোয়াড়ের সঠিক উত্তর মিললে ৫ পয়েন্ট যোগ হবে।
          </BnText>
        </View>

        {config.categoryIds.map((categoryId) => {
          const category = CATEGORY_MAP[categoryId];
          const entries = config.players
            .map((p) => currentRound.answers[p.id]?.[categoryId])
            .filter((e): e is NonNullable<typeof e> => Boolean(e));
          const matchingTexts = findMatchingTextsInCategory(entries);

          return (
            <View
              key={categoryId}
              className="bg-surface rounded-3xl p-4 border border-parchment mb-3.5"
            >
              {/* Category Header */}
              <View className="flex-row items-center gap-2.5 pb-2.5 mb-3 border-b border-sand">
                <View
                  style={{ backgroundColor: category.bgColor }}
                  className="w-8 h-8 rounded-xl items-center justify-center"
                >
                  <MaterialCommunityIcons
                    name={
                      category.iconName as keyof typeof MaterialCommunityIcons.glyphMap
                    }
                    size={17}
                    color={category.accentColor}
                  />
                </View>
                <BnText weight="bold" className="text-base text-ink flex-1">
                  {category.nameBn}
                </BnText>
              </View>

              {/* Player Answers */}
              <View className="gap-2.5">
                {config.players.map((player) => {
                  const entry = currentRound.answers[player.id]?.[categoryId];
                  const isEmpty = !entry || entry.validation === 'empty';
                  const hasTextMatch =
                    !isEmpty &&
                    entry.normalizedText.length > 0 &&
                    matchingTexts.has(entry.normalizedText);

                  const isCorrect = entry?.validation === 'correct';
                  const isIncorrect = entry?.validation === 'incorrect';
                  const isPending = entry?.validation === 'pending';

                  return (
                    <View
                      key={player.id}
                      className={`rounded-2xl p-3 border ${
                        isEmpty
                          ? 'bg-sand/40 border-parchment/70'
                          : isCorrect
                            ? 'bg-emeraldSoft/40 border-emeraldBrand/40'
                            : isIncorrect
                              ? 'bg-crimsonSoft/40 border-crimson/35'
                              : 'bg-ivory border-amber/40'
                      }`}
                    >
                      <View className="flex-row items-start justify-between gap-2">
                        <View className="flex-1">
                          <View className="flex-row items-center flex-wrap gap-1.5 mb-1">
                            <BnText weight="bold" className="text-xs text-slateMuted">
                              {player.name}
                            </BnText>
                            {hasTextMatch ? (
                              <View className="px-2 py-0.5 rounded-full bg-amberSoft border border-amber/30">
                                <BnText
                                  weight="semibold"
                                  className="text-[10px] text-amberWarm"
                                >
                                  একই উত্তর
                                </BnText>
                              </View>
                            ) : null}
                          </View>

                          <BnText
                            weight={isEmpty ? 'regular' : 'bold'}
                            className={`text-base leading-6 ${
                              isEmpty ? 'text-slateLight italic' : 'text-ink'
                            }`}
                          >
                            {isEmpty ? 'উত্তর দেওয়া হয়নি' : entry.rawText}
                          </BnText>
                        </View>

                        {/* Points Badge */}
                        <View
                          className={`px-2.5 py-1 rounded-xl ${
                            isEmpty
                              ? 'bg-sand'
                              : isCorrect
                                ? entry.isDuplicateMatch
                                  ? 'bg-amberSoft'
                                  : 'bg-emeraldSoft'
                                : isIncorrect
                                  ? 'bg-crimsonSoft'
                                  : 'bg-amberSoft/70'
                          }`}
                        >
                          <BnText
                            weight="bold"
                            className={`text-xs ${
                              isEmpty
                                ? 'text-slateMuted'
                                : isCorrect
                                  ? entry.isDuplicateMatch
                                    ? 'text-amberWarm'
                                    : 'text-emeraldDark'
                                  : isIncorrect
                                    ? 'text-crimson'
                                    : 'text-amberWarm'
                            }`}
                          >
                            {isPending
                              ? 'যাচাই বাকি'
                              : isCorrect
                                ? `+${toBengaliDigits(entry.points)} পয়েন্ট`
                                : '০ পয়েন্ট'}
                          </BnText>
                        </View>
                      </View>

                      {/* Manual Validation Controls */}
                      {!isEmpty ? (
                        <View className="flex-row gap-2 mt-2.5">
                          <Pressable
                            onPress={() =>
                              handleToggleValidation(player.id, categoryId, 'correct')
                            }
                            className={`flex-1 py-2 px-3 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                              isCorrect
                                ? 'bg-emeraldBrand border-emeraldDark'
                                : 'bg-surface border-parchment'
                            } active:opacity-80`}
                          >
                            <MaterialCommunityIcons
                              name="check-circle-outline"
                              size={16}
                              color={isCorrect ? '#FFFFFF' : AppColors.emerald}
                            />
                            <BnText
                              weight="bold"
                              className={`text-xs ${
                                isCorrect ? 'text-white' : 'text-emeraldDark'
                              }`}
                            >
                              সঠিক
                            </BnText>
                          </Pressable>

                          <Pressable
                            onPress={() =>
                              handleToggleValidation(player.id, categoryId, 'incorrect')
                            }
                            className={`flex-1 py-2 px-3 rounded-xl border flex-row items-center justify-center gap-1.5 ${
                              isIncorrect
                                ? 'bg-crimson border-crimson'
                                : 'bg-surface border-parchment'
                            } active:opacity-80`}
                          >
                            <MaterialCommunityIcons
                              name="close-circle-outline"
                              size={16}
                              color={isIncorrect ? '#FFFFFF' : AppColors.crimson}
                            />
                            <BnText
                              weight="bold"
                              className={`text-xs ${
                                isIncorrect ? 'text-white' : 'text-crimson'
                              }`}
                            >
                              ভুল
                            </BnText>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {saveError ? (
          <View className="mb-3 p-3.5 rounded-2xl bg-crimsonSoft border border-crimson/30">
            <BnText weight="semibold" className="text-sm text-crimson text-center">
              {saveError}
            </BnText>
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View className="px-4 py-3 bg-surface border-t border-parchment">
        {!canContinue ? (
          <View className="mb-2 items-center">
            <BnText weight="semibold" className="text-xs text-amberWarm">
              সবগুলো অখালি উত্তর যাচাই করুন (বাকি {toBengaliDigits(pendingCount)}টি)
            </BnText>
          </View>
        ) : null}

        <PrimaryButton
          label={
            !canContinue
              ? `আরও ${toBengaliDigits(pendingCount)}টি উত্তর যাচাই বাকি`
              : hasMoreRounds
                ? `পরবর্তী রাউন্ড (${toBengaliDigits(currentRoundIndex + 2)}/${toBengaliDigits(config.totalRounds)})`
                : 'চূড়ান্ত ফলাফল দেখুন'
          }
          iconName={hasMoreRounds ? 'arrow-right-circle' : 'trophy'}
          variant={hasMoreRounds ? 'secondary' : 'primary'}
          disabled={!canContinue}
          loading={saving}
          onPress={handleProceed}
        />
      </View>

      <ManualLetterPickerModal
        visible={nextRoundLetterOpen}
        selectedLetter={null}
        usedLetters={rounds.map((r) => r.letter)}
        title={`রাউন্ড ${toBengaliDigits(currentRoundIndex + 2)}-এর বর্ণ বেছে নিন`}
        subtitle="হলুদ রঙের বর্ণগুলো পূর্ববর্তী রাউন্ডে খেলা হয়েছে"
        onSelect={(letter) => {
          setNextRoundLetterOpen(false);
          advanceToNextRound(letter);
          router.replace('/game');
        }}
        onClose={() => setNextRoundLetterOpen(false)}
      />

      <ConfirmModal
        visible={exitModalOpen}
        title="খেলা থেকে বের হবেন?"
        message="যাচাই শেষ না করে বের হয়ে গেলে এই ম্যাচের ফলাফল সংরক্ষিত হবে না।"
        confirmLabel="হ্যাঁ, বের হই"
        cancelLabel="ফিরে যাই"
        variant="danger"
        iconName="exit-to-app"
        onConfirm={handleExit}
        onCancel={() => setExitModalOpen(false)}
      />
    </SafeAreaView>
  );
}
