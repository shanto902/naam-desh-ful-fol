import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../components/AppHeader';
import { BnText } from '../components/BnText';
import { MatchDetailsBreakdown } from '../components/MatchDetailsBreakdown';
import { PrimaryButton } from '../components/PrimaryButton';
import { WinnerCelebration } from '../components/WinnerCelebration';
import { AppColors } from '../constants/theme';
import { useGame } from '../context/GameContext';
import { toBengaliDigits } from '../utils/bengali';

export default function ResultsScreen() {
  const router = useRouter();
  const { activeMatch, availableLetters, startMatch, clearActiveMatch } = useGame();
  const [initialRecord] = useState(() => activeMatch?.finalizedRecord ?? null);
  const record = activeMatch?.finalizedRecord ?? initialRecord;

  useEffect(() => {
    if (record && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
    }
  }, [record]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      clearActiveMatch();
      router.replace('/');
      return true;
    });
    return () => sub.remove();
  }, [clearActiveMatch, router]);

  const handleGoHome = () => {
    clearActiveMatch();
    router.replace('/');
  };

  const handlePlayAgain = () => {
    if (!activeMatch) {
      router.replace('/setup');
      return;
    }
    const prevConfig = activeMatch.config;
    if (prevConfig.letterMode === 'manual') {
      clearActiveMatch();
      router.replace('/setup');
      return;
    }

    startMatch({
      ...prevConfig,
      availableLetters,
    });
    router.replace('/game');
  };

  if (!record) {
    return (
      <SafeAreaView className="flex-1 bg-ivory items-center justify-center px-6">
        <View className="w-full max-w-sm bg-surface rounded-3xl p-6 border border-parchment items-center">
          <MaterialCommunityIcons
            name="trophy-outline"
            size={42}
            color={AppColors.slateMuted}
          />
          <BnText weight="bold" className="text-lg text-ink mt-3 text-center">
            খেলার ফলাফল পাওয়া যায়নি
          </BnText>
          <PrimaryButton
            label="হোমে ফিরে যান"
            onPress={handleGoHome}
            className="w-full mt-5"
          />
        </View>
      </SafeAreaView>
    );
  }

  const topScore = record.standings[0]?.totalScore ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <AppHeader
        title="খেলার চূড়ান্ত ফলাফল"
        subtitle={`মোট ${toBengaliDigits(record.totalRounds)} রাউন্ড সম্পন্ন`}
        onBackPress={handleGoHome}
      />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <WinnerCelebration
            winnerNames={record.winnerNames}
            topScoreText={toBengaliDigits(topScore)}
          />
        </View>

        <MatchDetailsBreakdown record={record} />

        <View className="gap-3 mt-5">
          <PrimaryButton
            label="আবার খেলুন"
            iconName="replay"
            variant="primary"
            onPress={handlePlayAgain}
          />
          <PrimaryButton
            label="হোমে ফিরে যান"
            iconName="home-outline"
            variant="outline"
            onPress={handleGoHome}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
