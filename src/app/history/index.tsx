import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { BnText } from '../../components/BnText';
import { ConfirmModal } from '../../components/ConfirmModal';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AppColors } from '../../constants/theme';
import {
  clearMatchHistory,
  loadMatchHistory,
} from '../../storage/gameStorage';
import { MatchRecord } from '../../types/game';
import { formatBengaliDateTime, toBengaliDigits } from '../../utils/bengali';

export default function HistoryListScreen() {
  const router = useRouter();
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const data = await loadMatchHistory();
      setRecords(data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const handleConfirmClear = async () => {
    setClearModalOpen(false);
    await clearMatchHistory();
    setRecords([]);
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <AppHeader
        title="পূর্বের খেলার ফলাফল"
        subtitle={
          records.length > 0
            ? `মোট ${toBengaliDigits(records.length)}টি খেলা সংরক্ষিত`
            : 'সংরক্ষিত খেলার তালিকা'
        }
        rightSlot={
          records.length > 0 ? (
            <Pressable
              onPress={() => setClearModalOpen(true)}
              accessibilityLabel="সব ইতিহাস মুছুন"
              className="px-3 py-1.5 rounded-xl bg-crimsonSoft border border-crimson/25 flex-row items-center gap-1 active:opacity-80"
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={15}
                color={AppColors.crimson}
              />
              <BnText weight="bold" className="text-xs text-crimson">
                সব মুছুন
              </BnText>
            </Pressable>
          ) : undefined
        }
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={AppColors.emerald} />
          <BnText className="text-sm text-slateMuted mt-3">
            ইতিহাস লোড হচ্ছে...
          </BnText>
        </View>
      ) : loadError ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-sm bg-surface rounded-3xl p-6 border border-parchment items-center">
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={40}
              color={AppColors.crimson}
            />
            <BnText weight="bold" className="text-base text-ink mt-3 text-center">
              তথ্য লোড করতে সমস্যা হয়েছে
            </BnText>
            <PrimaryButton
              label="আবার চেষ্টা করুন"
              onPress={fetchHistory}
              className="w-full mt-4"
            />
          </View>
        </View>
      ) : records.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-sm bg-surface rounded-3xl p-6 border border-parchment items-center">
            <View className="w-16 h-16 rounded-full bg-sand items-center justify-center mb-3">
              <MaterialCommunityIcons
                name="history"
                size={34}
                color={AppColors.slateMuted}
              />
            </View>
            <BnText weight="bold" className="text-lg text-ink text-center">
              এখনো কোনো খেলা সংরক্ষিত নেই
            </BnText>
            <BnText className="text-sm text-slateMuted text-center mt-1.5 leading-6 mb-5">
              বন্ধু বা পরিবারের সাথে একটি ম্যাচ খেললে তার পূর্ণাঙ্গ ফলাফল এখানে সংরক্ষিত থাকবে।
            </BnText>
            <PrimaryButton
              label="নতুন খেলা শুরু করুন"
              iconName="play-circle"
              onPress={() => router.replace('/setup')}
              className="w-full"
            />
          </View>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-3">
            {records.map((item) => {
              const isTie = item.winnerNames.length > 1;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(`/history/${item.id}`)}
                  className="bg-surface rounded-3xl p-4 border border-parchment active:opacity-85"
                >
                  {/* Date & Rounds row */}
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-1.5 flex-1 pr-2">
                      <MaterialCommunityIcons
                        name="calendar-clock"
                        size={15}
                        color={AppColors.slateMuted}
                      />
                      <BnText className="text-xs text-slateMuted" numberOfLines={1}>
                        {formatBengaliDateTime(item.playedAt)}
                      </BnText>
                    </View>
                    <View className="px-2.5 py-0.5 rounded-full bg-sand border border-parchment">
                      <BnText weight="semibold" className="text-xs text-ink">
                        রাউন্ড: {toBengaliDigits(item.totalRounds)}টি
                      </BnText>
                    </View>
                  </View>

                  {/* Winner highlight */}
                  <View className="flex-row items-center justify-between py-2 px-3 rounded-2xl bg-emeraldSoft/60 border border-emeraldBrand/20 mb-2.5">
                    <View className="flex-row items-center gap-2 flex-1 pr-2">
                      <MaterialCommunityIcons
                        name={isTie ? 'handshake' : 'trophy'}
                        size={18}
                        color="#CA8A04"
                      />
                      <BnText weight="bold" className="text-sm text-emeraldDark flex-1">
                        {isTie ? 'যৌথ বিজয়ী: ' : 'বিজয়ী: '}
                        {item.winnerNames.join(' ও ')}
                      </BnText>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={AppColors.emeraldDark}
                    />
                  </View>

                  {/* Player scores */}
                  <View className="flex-row flex-wrap gap-1.5">
                    {item.standings.map((st) => (
                      <View
                        key={st.playerId}
                        className="px-2.5 py-1 rounded-xl bg-ivory border border-parchment flex-row items-center gap-1.5"
                      >
                        <BnText weight="medium" className="text-xs text-ink">
                          {st.playerName}:
                        </BnText>
                        <BnText weight="bold" className="text-xs text-marigold">
                          {toBengaliDigits(st.totalScore)}
                        </BnText>
                      </View>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      <ConfirmModal
        visible={clearModalOpen}
        title="সব ইতিহাস মুছে ফেলবেন?"
        message="আগের সকল খেলার ফলাফল স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?"
        confirmLabel="হ্যাঁ, মুছে ফেলুন"
        cancelLabel="বাতিল করুন"
        variant="danger"
        iconName="delete-alert-outline"
        onConfirm={handleConfirmClear}
        onCancel={() => setClearModalOpen(false)}
      />
    </SafeAreaView>
  );
}
