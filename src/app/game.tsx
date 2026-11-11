import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BnText } from '../components/BnText';
import { ConfirmModal } from '../components/ConfirmModal';
import { CountdownBanner } from '../components/CountdownBanner';
import { LetterBadge } from '../components/LetterBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { TurnHandoffStage } from '../components/TurnHandoffStage';
import { CATEGORY_MAP } from '../constants/categories';
import { AppColors, AppFonts } from '../constants/theme';
import { useGame } from '../context/GameContext';
import { isAnswerEmpty } from '../engine/bengaliText';
import { toBengaliDigits } from '../utils/bengali';

export default function GameScreen() {
  const router = useRouter();
  const {
    activeMatch,
    beginCurrentTurn,
    updateDraftAnswer,
    markCurrentTurnTimeUp,
    submitCurrentTurn,
    clearActiveMatch,
  } = useGame();

  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const inputRefs = useRef<(React.ComponentRef<typeof TextInput> | null)[]>([]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Keyboard.dismiss();
      setExitModalOpen(true);
      return true;
    });
    return () => sub.remove();
  }, []);

  const currentRound = activeMatch?.rounds[activeMatch.currentRoundIndex];
  const currentPlayer =
    activeMatch?.config.players[activeMatch.currentPlayerIndex];

  const selectedCategories = useMemo(() => {
    if (!activeMatch) return [];
    return activeMatch.config.categoryIds.map((id) => CATEGORY_MAP[id]);
  }, [activeMatch]);

  const filledCount = useMemo(() => {
    if (!activeMatch) return 0;
    return activeMatch.config.categoryIds.reduce((acc, id) => {
      const val = activeMatch.currentDrafts[id] ?? '';
      return acc + (isAnswerEmpty(val) ? 0 : 1);
    }, 0);
  }, [activeMatch]);

  const handleTimeUp = useCallback(() => {
    Keyboard.dismiss();
    setSubmitModalOpen(false);
    markCurrentTurnTimeUp();
  }, [markCurrentTurnTimeUp]);

  const handleConfirmSubmit = () => {
    setSubmitModalOpen(false);
    Keyboard.dismiss();
    const { nextScreen } = submitCurrentTurn();
    if (nextScreen === 'review') {
      router.replace('/review');
    } else {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handleExitGame = () => {
    setExitModalOpen(false);
    clearActiveMatch();
    router.replace('/');
  };

  if (!activeMatch || !currentRound || !currentPlayer) {
    return (
      <SafeAreaView className="flex-1 bg-ivory items-center justify-center px-6">
        <View className="w-full max-w-sm bg-surface rounded-3xl p-6 border border-parchment items-center">
          <MaterialCommunityIcons
            name="gamepad-variant-outline"
            size={42}
            color={AppColors.slateMuted}
          />
          <BnText weight="bold" className="text-lg text-ink mt-3 text-center">
            কোনো চলমান খেলা পাওয়া যায়নি
          </BnText>
          <BnText className="text-sm text-slateMuted mt-1 text-center mb-5">
            নতুন খেলা শুরু করতে সেটআপ স্ক্রিনে যান।
          </BnText>
          <PrimaryButton
            label="হোমে ফিরে যান"
            onPress={() => router.replace('/')}
            className="w-full"
          />
        </View>
      </SafeAreaView>
    );
  }

  const { config, currentRoundIndex, currentPlayerIndex, turnPhase, currentDrafts } =
    activeMatch;
  const isLastPlayer = currentPlayerIndex + 1 >= config.players.length;
  const nextPlayer = !isLastPlayer
    ? config.players[currentPlayerIndex + 1]
    : null;
  const turnKey = `${activeMatch.matchId}_r${currentRoundIndex}_p${currentPlayerIndex}`;
  const isLocked = turnPhase === 'timeup';
  const totalCategories = selectedCategories.length;
  const completionPct =
    totalCategories > 0 ? Math.round((filledCount / totalCategories) * 100) : 0;

  if (turnPhase === 'handoff') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.ivory }}>
        <TurnHandoffStage
          key={turnKey}
          currentPlayer={currentPlayer}
          players={config.players}
          currentPlayerIndex={currentPlayerIndex}
          currentRoundNumber={currentRoundIndex + 1}
          totalRounds={config.totalRounds}
          roundDuration={config.roundDuration}
          categories={selectedCategories}
          onStartTurn={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
                () => {}
              );
            }
            beginCurrentTurn();
          }}
          onRequestExit={() => setExitModalOpen(true)}
        />

        <ConfirmModal
          visible={exitModalOpen}
          title="খেলা থেকে বের হবেন?"
          message="এখন বের হয়ে গেলে চলমান খেলার সকল তথ্য মুছে যাবে।"
          confirmLabel="হ্যাঁ, বের হই"
          cancelLabel="খেলায় ফিরি"
          variant="danger"
          iconName="exit-to-app"
          onConfirm={handleExitGame}
          onCancel={() => setExitModalOpen(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      {/* Compact Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-2.5 border-b border-parchment bg-ivory">
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            setExitModalOpen(true);
          }}
          accessibilityLabel="খেলা বন্ধ করুন"
          className="w-9 h-9 rounded-full bg-surface border border-parchment items-center justify-center active:opacity-75"
        >
          <MaterialCommunityIcons name="close" size={19} color={AppColors.ink} />
        </Pressable>

        <View className="flex-1 px-2">
          <BnText
            weight="bold"
            className="text-base text-ink text-center w-full"
            style={{ lineHeight: 26 }}
            numberOfLines={1}
          >
            {currentPlayer.name}
          </BnText>
          <BnText
            weight="medium"
            className="text-xs text-slateMuted text-center w-full"
            style={{ lineHeight: 20 }}
          >
            রাউন্ড {toBengaliDigits(currentRoundIndex + 1)}/
            {toBengaliDigits(config.totalRounds)} • খেলোয়াড়{' '}
            {toBengaliDigits(currentPlayerIndex + 1)}/
            {toBengaliDigits(config.players.length)}
          </BnText>
        </View>

        <View className="px-2.5 py-1 rounded-full bg-emeraldSoft border border-emeraldBrand/25">
          <BnText
            weight="bold"
            className="text-xs text-emeraldDark"
            style={{ lineHeight: 20 }}
          >
            {toBengaliDigits(filledCount)}/{toBengaliDigits(totalCategories)}
          </BnText>
        </View>
      </View>

      {/* Sticky Letter + Timer + Progress Hero */}
      <View className="px-4 py-3 bg-surface border-b border-parchment">
        <View className="flex-row items-center gap-3.5">
          <LetterBadge letter={currentRound.letter} label="" size="md" />

          <View className="flex-1 gap-2">
            <CountdownBanner
              key={turnKey}
              durationSeconds={config.roundDuration}
              isRunning={turnPhase === 'playing'}
              isPaused={submitModalOpen || exitModalOpen}
              onTimeUp={handleTimeUp}
            />

            {/* Completion Progress Bar */}
            <View className="flex-row items-center gap-2">
              <View className="flex-1 h-2 rounded-full bg-sand overflow-hidden">
                <View
                  style={{ width: `${completionPct}%` }}
                  className="h-full rounded-full bg-marigold"
                />
              </View>
              <BnText
                weight="semibold"
                className="text-xs text-slateMuted"
                style={{ lineHeight: 20, minWidth: 82, textAlign: 'right' }}
              >
                সম্পন্ন {toBengaliDigits(filledCount)}/{toBengaliDigits(totalCategories)}
              </BnText>
            </View>
          </View>
        </View>
      </View>

      {/* Category Input List */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLocked ? (
            <View className="mb-3 p-3.5 rounded-2xl bg-crimsonSoft border border-crimson/30 flex-row items-center gap-2.5">
              <MaterialCommunityIcons
                name="lock-clock"
                size={22}
                color={AppColors.crimson}
              />
              <View className="flex-1">
                <BnText weight="bold" className="text-sm text-crimson">
                  সময় শেষ! ইনপুট লক করা হয়েছে
                </BnText>
                <BnText className="text-xs text-ink/80">
                  আপনার লেখা {toBengaliDigits(filledCount)}টি উত্তর সংরক্ষিত রয়েছে।
                </BnText>
              </View>
            </View>
          ) : null}

          <View className="gap-2.5">
            {selectedCategories.map((category, index) => {
              const value = currentDrafts[category.id] ?? '';
              const isFilled = !isAnswerEmpty(value);
              const isLast = index === selectedCategories.length - 1;

              return (
                <View
                  key={category.id}
                  className={`rounded-2xl p-3.5 border ${
                    isLocked
                      ? 'bg-sand/60 border-parchment opacity-90'
                      : isFilled
                        ? 'bg-surface border-emeraldBrand/50'
                        : 'bg-surface border-parchment'
                  }`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2 flex-1 pr-2">
                      <View
                        style={{ backgroundColor: category.bgColor }}
                        className="w-7 h-7 rounded-lg items-center justify-center"
                      >
                        <MaterialCommunityIcons
                          name={
                            category.iconName as keyof typeof MaterialCommunityIcons.glyphMap
                          }
                          size={16}
                          color={category.accentColor}
                        />
                      </View>
                      <BnText
                        weight="bold"
                        className="text-sm text-ink flex-1"
                        style={{ lineHeight: 23 }}
                      >
                        {category.nameBn}
                      </BnText>
                    </View>

                    {isFilled ? (
                      <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-emeraldSoft">
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={13}
                          color={AppColors.emerald}
                        />
                        <BnText weight="semibold" className="text-xs text-emeraldDark">
                          সম্পন্ন
                        </BnText>
                      </View>
                    ) : isLocked ? (
                      <BnText className="text-xs text-slateLight">খালি</BnText>
                    ) : null}
                  </View>

                  <TextInput
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    value={value}
                    onChangeText={(text) => updateDraftAnswer(category.id, text)}
                    editable={!isLocked}
                    placeholder={`'${currentRound.letter}' দিয়ে ${category.placeholderBn}`}
                    placeholderTextColor={AppColors.slateLight}
                    returnKeyType={isLast ? 'done' : 'next'}
                    submitBehavior={isLast ? 'blurAndSubmit' : 'submit'}
                    onSubmitEditing={() => {
                      if (!isLast) {
                        inputRefs.current[index + 1]?.focus();
                      } else {
                        Keyboard.dismiss();
                      }
                    }}
                    style={{
                      fontFamily: AppFonts.medium,
                      fontSize: 16,
                      lineHeight: 24,
                      color: isLocked ? AppColors.slateMuted : AppColors.ink,
                      backgroundColor: isLocked ? '#EFE6D5' : AppColors.ivory,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isFilled ? '#A7F3D0' : AppColors.border,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}
                  />
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Sticky Submit / Next Bar */}
        <View className="px-4 py-3 bg-surface border-t border-parchment">
          {isLocked ? (
            <PrimaryButton
              label={
                isLastPlayer
                  ? 'উত্তর যাচাই করুন'
                  : `পরবর্তী খেলোয়াড়: ${nextPlayer?.name ?? ''}`
              }
              iconName={isLastPlayer ? 'clipboard-check-outline' : 'arrow-right-circle'}
              variant="secondary"
              onPress={handleConfirmSubmit}
            />
          ) : (
            <PrimaryButton
              label="জমা দিন"
              iconName="check-bold"
              variant="primary"
              onPress={() => {
                Keyboard.dismiss();
                setSubmitModalOpen(true);
              }}
            />
          )}
        </View>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={submitModalOpen}
        title="উত্তর জমা দেবেন?"
        message={
          filledCount < totalCategories
            ? 'সময় শেষ হওয়ার আগেই আপনার লেখা উত্তরগুলো জমা দিতে চান?'
            : 'সবগুলো বিভাগের উত্তর লেখা সম্পন্ন হয়েছে। এখনই কি জমা দেবেন?'
        }
        confirmLabel="হ্যাঁ, জমা দিন"
        cancelLabel="না, ফিরে যাই"
        iconName="send-check-outline"
        extraContent={
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              backgroundColor: AppColors.ivory,
              borderRadius: 16,
              padding: 10,
              borderWidth: 1,
              borderColor: AppColors.parchment,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: AppColors.emeraldSoft,
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 10,
                alignItems: 'center',
              }}
            >
              <BnText
                weight="bold"
                style={{
                  fontSize: 18,
                  lineHeight: 30,
                  color: AppColors.emeraldDark,
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                {toBengaliDigits(filledCount)}টি
              </BnText>
              <BnText
                weight="medium"
                style={{
                  fontSize: 12.5,
                  lineHeight: 21,
                  color: AppColors.emeraldDark,
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                লিখেছেন
              </BnText>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor:
                  totalCategories - filledCount > 0
                    ? AppColors.amberSoft
                    : AppColors.sand,
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 10,
                alignItems: 'center',
              }}
            >
              <BnText
                weight="bold"
                style={{
                  fontSize: 18,
                  lineHeight: 30,
                  width: '100%',
                  textAlign: 'center',
                  color:
                    totalCategories - filledCount > 0
                      ? AppColors.amber
                      : AppColors.slateMuted,
                }}
              >
                {toBengaliDigits(totalCategories - filledCount)}টি
              </BnText>
              <BnText
                weight="medium"
                style={{
                  fontSize: 12.5,
                  lineHeight: 21,
                  width: '100%',
                  textAlign: 'center',
                  color:
                    totalCategories - filledCount > 0
                      ? AppColors.amber
                      : AppColors.slateMuted,
                }}
              >
                বাকি আছে
              </BnText>
            </View>
          </View>
        }
        onConfirm={handleConfirmSubmit}
        onCancel={() => setSubmitModalOpen(false)}
      />

      <ConfirmModal
        visible={exitModalOpen}
        title="খেলা থেকে বের হবেন?"
        message="এখন বের হয়ে গেলে চলমান রাউন্ডের উত্তরগুলো হারিয়ে যাবে।"
        confirmLabel="হ্যাঁ, বের হই"
        cancelLabel="খেলায় ফিরি"
        variant="danger"
        iconName="exit-to-app"
        onConfirm={handleExitGame}
        onCancel={() => setExitModalOpen(false)}
      />
    </SafeAreaView>
  );
}
