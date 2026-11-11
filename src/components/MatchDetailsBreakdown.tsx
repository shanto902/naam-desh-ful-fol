import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { CATEGORY_MAP } from '../constants/categories';
import { AppColors } from '../constants/theme';
import { MatchRecord } from '../types/game';
import { getBengaliOrdinal, toBengaliDigits } from '../utils/bengali';
import { BnText } from './BnText';

interface MatchDetailsBreakdownProps {
  record: MatchRecord;
}

function getRankBadgeStyle(rank: number) {
  switch (rank) {
    case 1:
      return {
        bg: 'bg-goldSoft border-gold',
        text: 'text-amberWarm',
      };
    case 2:
      return {
        bg: 'bg-indigoSoft border-indigo/30',
        text: 'text-indigoAccent',
      };
    case 3:
      return {
        bg: 'bg-marigoldSoft border-marigold/30',
        text: 'text-marigold',
      };
    default:
      return {
        bg: 'bg-sand border-parchment',
        text: 'text-slateMuted',
      };
  }
}

export function MatchDetailsBreakdown({ record }: MatchDetailsBreakdownProps) {
  const [selectedRoundIdx, setSelectedRoundIdx] = useState(0);
  const activeRound = record.rounds[selectedRoundIdx] ?? record.rounds[0];

  return (
    <View className="gap-4">
      {/* Rankings & Total Scores */}
      <View className="bg-surface rounded-3xl p-4 border border-parchment">
        <View className="flex-row items-center gap-2 mb-3">
          <MaterialCommunityIcons
            name="podium-gold"
            size={20}
            color={AppColors.amber}
          />
          <BnText weight="bold" className="text-base text-ink">
            খেলোয়াড়দের অবস্থান ও মোট স্কোর
          </BnText>
        </View>

        <View className="gap-2.5">
          {record.standings.map((standing) => {
            const rankStyle = getRankBadgeStyle(standing.rank);
            const isWinner = record.winnerIds.includes(standing.playerId);

            return (
              <View
                key={standing.playerId}
                className={`rounded-2xl p-3 border flex-row items-center justify-between ${
                  isWinner
                    ? 'bg-emeraldSoft/55 border-emeraldBrand/40'
                    : 'bg-ivory border-parchment'
                }`}
              >
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <View
                    className={`w-10 h-10 rounded-xl border items-center justify-center ${rankStyle.bg}`}
                  >
                    <BnText weight="bold" className={`text-sm ${rankStyle.text}`}>
                      {getBengaliOrdinal(standing.rank)}
                    </BnText>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <BnText weight="bold" className="text-base text-ink">
                        {standing.playerName}
                      </BnText>
                      {isWinner ? (
                        <MaterialCommunityIcons
                          name="crown"
                          size={16}
                          color={AppColors.amber}
                        />
                      ) : null}
                    </View>
                    <BnText className="text-xs text-slateMuted">
                      সঠিক: {toBengaliDigits(standing.correctCount)}টি • একক:{' '}
                      {toBengaliDigits(standing.uniqueCount)} • যৌথ:{' '}
                      {toBengaliDigits(standing.sharedCount)}
                    </BnText>
                  </View>
                </View>

                <View className="px-3 py-1.5 rounded-xl bg-surface border border-parchment items-end">
                  <BnText weight="bold" className="text-base text-emeraldDark">
                    {toBengaliDigits(standing.totalScore)}
                  </BnText>
                  <BnText className="text-[10px] text-slateMuted">পয়েন্ট</BnText>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Round Switcher (if multiple rounds) */}
      {record.rounds.length > 1 ? (
        <View>
          <BnText weight="bold" className="text-sm text-ink mb-2">
            রাউন্ড অনুযায়ী উত্তর দেখুন
          </BnText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {record.rounds.map((round, idx) => {
                const active = idx === selectedRoundIdx;
                return (
                  <Pressable
                    key={round.roundNumber}
                    onPress={() => setSelectedRoundIdx(idx)}
                    className={`px-3.5 py-2 rounded-2xl border flex-row items-center gap-2 ${
                      active
                        ? 'bg-emeraldBrand border-emeraldDark'
                        : 'bg-surface border-parchment'
                    }`}
                  >
                    <BnText
                      weight="bold"
                      className={`text-xs ${active ? 'text-white' : 'text-ink'}`}
                    >
                      রাউন্ড {toBengaliDigits(round.roundNumber)} ({round.letter})
                    </BnText>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      ) : null}

      {/* Category-wise Answers & Points */}
      {activeRound ? (
        <View className="bg-surface rounded-3xl p-4 border border-parchment">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="format-list-checks"
                size={20}
                color={AppColors.emerald}
              />
              <BnText weight="bold" className="text-base text-ink">
                বিভাগ অনুযায়ী উত্তর ও পয়েন্ট
              </BnText>
            </View>
            <View className="px-2.5 py-1 rounded-full bg-emeraldSoft">
              <BnText weight="bold" className="text-xs text-emeraldDark">
                বর্ণ: {activeRound.letter}
              </BnText>
            </View>
          </View>

          <View className="gap-3">
            {record.categoryIds.map((categoryId) => {
              const category = CATEGORY_MAP[categoryId];
              if (!category) return null;

              return (
                <View
                  key={categoryId}
                  className="rounded-2xl bg-ivory p-3 border border-parchment"
                >
                  <View className="flex-row items-center gap-2 mb-2 pb-1.5 border-b border-parchment">
                    <MaterialCommunityIcons
                      name={
                        category.iconName as keyof typeof MaterialCommunityIcons.glyphMap
                      }
                      size={16}
                      color={category.accentColor}
                    />
                    <BnText weight="bold" className="text-sm text-ink">
                      {category.nameBn}
                    </BnText>
                  </View>

                  <View className="gap-1.5">
                    {record.players.map((player) => {
                      const entry = activeRound.answers[player.id]?.[categoryId];
                      const isEmpty = !entry || entry.validation === 'empty';
                      const isCorrect = entry?.validation === 'correct';

                      return (
                        <View
                          key={player.id}
                          className="flex-row items-center justify-between py-1"
                        >
                          <View className="flex-row items-center gap-2 flex-1 pr-2">
                            <BnText
                              weight="semibold"
                              className="text-xs text-slateMuted w-24"
                              numberOfLines={1}
                            >
                              {player.name}
                            </BnText>
                            <BnText
                              weight={isEmpty ? 'regular' : 'medium'}
                              className={`text-sm flex-1 ${
                                isEmpty
                                  ? 'text-slateLight italic'
                                  : isCorrect
                                    ? 'text-ink'
                                    : 'text-crimson line-through'
                              }`}
                            >
                              {isEmpty ? 'খালি' : entry.rawText}
                            </BnText>
                          </View>

                          <View
                            className={`px-2.5 py-0.5 rounded-lg ${
                              isCorrect
                                ? entry.isDuplicateMatch
                                  ? 'bg-amberSoft'
                                  : 'bg-emeraldSoft'
                                : 'bg-sand'
                            }`}
                          >
                            <BnText
                              weight="bold"
                              className={`text-xs ${
                                isCorrect
                                  ? entry.isDuplicateMatch
                                    ? 'text-amberWarm'
                                    : 'text-emeraldDark'
                                  : 'text-slateMuted'
                              }`}
                            >
                              {isCorrect
                                ? `+${toBengaliDigits(entry.points)}`
                                : '০'}
                            </BnText>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}
