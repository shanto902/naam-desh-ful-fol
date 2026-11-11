import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { BnText } from '../../components/BnText';
import { MatchDetailsBreakdown } from '../../components/MatchDetailsBreakdown';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AppColors } from '../../constants/theme';
import { getMatchRecordById } from '../../storage/gameStorage';
import { MatchRecord } from '../../types/game';
import { formatBengaliDateTime, toBengaliDigits } from '../../utils/bengali';

export default function MatchDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const matchId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [record, setRecord] = useState<MatchRecord | null>(null);
  const [loading, setLoading] = useState(() => Boolean(matchId));

  useEffect(() => {
    let active = true;
    if (!matchId) {
      return;
    }

    getMatchRecordById(matchId)
      .then((found) => {
        if (active) {
          setRecord(found);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [matchId]);

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <AppHeader
        title="ম্যাচের বিস্তারিত ফলাফল"
        subtitle={record ? formatBengaliDateTime(record.playedAt) : undefined}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={AppColors.emerald} />
          <BnText className="text-sm text-slateMuted mt-3">লোড হচ্ছে...</BnText>
        </View>
      ) : !record ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-sm bg-surface rounded-3xl p-6 border border-parchment items-center">
            <MaterialCommunityIcons
              name="file-question-outline"
              size={42}
              color={AppColors.slateMuted}
            />
            <BnText weight="bold" className="text-lg text-ink mt-3 text-center">
              ম্যাচের তথ্য পাওয়া যায়নি
            </BnText>
            <PrimaryButton
              label="ইতিহাসে ফিরে যান"
              onPress={() => router.back()}
              className="w-full mt-5"
            />
          </View>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Banner */}
          <View className="bg-surface rounded-3xl p-4 border border-parchment mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-2xl bg-goldSoft border border-gold/40 items-center justify-center">
                <MaterialCommunityIcons
                  name={record.winnerNames.length > 1 ? 'handshake' : 'trophy'}
                  size={26}
                  color="#CA8A04"
                />
              </View>
              <View className="flex-1">
                <BnText weight="semibold" className="text-xs text-slateMuted">
                  {record.winnerNames.length > 1 ? 'যৌথ বিজয়ী' : 'বিজয়ী'}
                </BnText>
                <BnText weight="bold" className="text-lg text-emeraldDark">
                  {record.winnerNames.join(' ও ')}
                </BnText>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2 mt-3 pt-3 border-t border-sand">
              <View className="px-2.5 py-1 rounded-xl bg-ivory border border-parchment">
                <BnText className="text-xs text-slateMuted">
                  রাউন্ড: {toBengaliDigits(record.totalRounds)}টি
                </BnText>
              </View>
              <View className="px-2.5 py-1 rounded-xl bg-ivory border border-parchment">
                <BnText className="text-xs text-slateMuted">
                  সময়সীমা: {toBengaliDigits(record.roundDuration)} সেকেন্ড
                </BnText>
              </View>
              <View className="px-2.5 py-1 rounded-xl bg-ivory border border-parchment">
                <BnText className="text-xs text-slateMuted">
                  বিভাগ: {toBengaliDigits(record.categoryIds.length)}টি
                </BnText>
              </View>
            </View>
          </View>

          <MatchDetailsBreakdown record={record} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
