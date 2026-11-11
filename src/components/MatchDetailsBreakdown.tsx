import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { CATEGORY_MAP } from '../constants/categories';
import { AppColors } from '../constants/theme';
import { MatchRecord } from '../types/game';
import { getBengaliOrdinal, toBengaliDigits } from '../utils/bengali';
import { BnText } from './BnText';

interface MatchDetailsBreakdownProps {
  record: MatchRecord;
}

function getRankBadgeColors(rank: number) {
  switch (rank) {
    case 1:
      return {
        bg: AppColors.goldSoft,
        border: AppColors.gold,
        text: AppColors.amber,
      };
    case 2:
      return {
        bg: AppColors.indigoSoft,
        border: '#A5B4FC',
        text: AppColors.indigo,
      };
    case 3:
      return {
        bg: AppColors.marigoldSoft,
        border: '#FDBA74',
        text: AppColors.marigold,
      };
    default:
      return {
        bg: AppColors.sand,
        border: AppColors.parchment,
        text: AppColors.slateMuted,
      };
  }
}

export function MatchDetailsBreakdown({ record }: MatchDetailsBreakdownProps) {
  const [selectedRoundIdx, setSelectedRoundIdx] = useState(0);
  const activeRound = record.rounds[selectedRoundIdx] ?? record.rounds[0];

  return (
    <View style={styles.container}>
      {/* Rankings & Total Scores */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="podium-gold"
            size={20}
            color={AppColors.amber}
          />
          <BnText weight="bold" style={styles.sectionTitle}>
            খেলোয়াড়দের অবস্থান ও মোট স্কোর
          </BnText>
        </View>

        <View style={styles.standingsList}>
          {record.standings.map((standing) => {
            const rankColors = getRankBadgeColors(standing.rank);
            const isWinner = record.winnerIds.includes(standing.playerId);

            return (
              <View
                key={standing.playerId}
                style={[
                  styles.standingRow,
                  isWinner ? styles.standingRowWinner : styles.standingRowNormal,
                ]}
              >
                <View style={styles.standingLeft}>
                  <View
                    style={[
                      styles.rankBadge,
                      {
                        backgroundColor: rankColors.bg,
                        borderColor: rankColors.border,
                      },
                    ]}
                  >
                    <BnText
                      weight="bold"
                      style={[styles.rankText, { color: rankColors.text }]}
                    >
                      {getBengaliOrdinal(standing.rank)}
                    </BnText>
                  </View>

                  <View style={styles.playerInfo}>
                    <View style={styles.playerNameRow}>
                      <BnText weight="bold" style={styles.playerName}>
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
                    <BnText style={styles.playerStats}>
                      সঠিক: {toBengaliDigits(standing.correctCount)}টি • একক:{' '}
                      {toBengaliDigits(standing.uniqueCount)} • যৌথ:{' '}
                      {toBengaliDigits(standing.sharedCount)}
                    </BnText>
                  </View>
                </View>

                <View style={styles.scoreBox}>
                  <BnText weight="bold" style={styles.scoreValue}>
                    {toBengaliDigits(standing.totalScore)}
                  </BnText>
                  <BnText style={styles.scoreUnit}>পয়েন্ট</BnText>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Round Switcher (if multiple rounds) */}
      {record.rounds.length > 1 ? (
        <View>
          <BnText weight="bold" style={styles.roundSwitchHeading}>
            রাউন্ড অনুযায়ী উত্তর দেখুন
          </BnText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.roundTabsRow}>
              {record.rounds.map((round, idx) => {
                const active = idx === selectedRoundIdx;
                return (
                  <Pressable
                    key={round.roundNumber}
                    onPress={() => setSelectedRoundIdx(idx)}
                    style={[
                      styles.roundTab,
                      active ? styles.roundTabActive : styles.roundTabIdle,
                    ]}
                  >
                    <BnText
                      weight="bold"
                      style={[
                        styles.roundTabText,
                        active
                          ? styles.roundTabTextActive
                          : styles.roundTabTextIdle,
                      ]}
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
        <View style={styles.sectionCard}>
          <View style={styles.categorySectionHeader}>
            <View style={styles.categoryHeaderLeft}>
              <MaterialCommunityIcons
                name="format-list-checks"
                size={20}
                color={AppColors.emerald}
              />
              <BnText weight="bold" style={styles.sectionTitle}>
                বিভাগ অনুযায়ী উত্তর ও পয়েন্ট
              </BnText>
            </View>
            <View style={styles.letterPill}>
              <BnText weight="bold" style={styles.letterPillText}>
                বর্ণ: {activeRound.letter}
              </BnText>
            </View>
          </View>

          <View style={styles.categoriesList}>
            {record.categoryIds.map((categoryId) => {
              const category = CATEGORY_MAP[categoryId];
              if (!category) return null;

              return (
                <View key={categoryId} style={styles.categoryCard}>
                  <View style={styles.categoryCardHeader}>
                    <MaterialCommunityIcons
                      name={
                        category.iconName as keyof typeof MaterialCommunityIcons.glyphMap
                      }
                      size={16}
                      color={category.accentColor}
                    />
                    <BnText weight="bold" style={styles.categoryName}>
                      {category.nameBn}
                    </BnText>
                  </View>

                  <View style={styles.answersList}>
                    {record.players.map((player) => {
                      const entry = activeRound.answers[player.id]?.[categoryId];
                      const isEmpty = !entry || entry.validation === 'empty';
                      const isCorrect = entry?.validation === 'correct';

                      return (
                        <View key={player.id} style={styles.answerRow}>
                          <View style={styles.answerLeft}>
                            <BnText
                              weight="semibold"
                              numberOfLines={1}
                              style={styles.answerPlayer}
                            >
                              {player.name}
                            </BnText>
                            <BnText
                              weight={isEmpty ? 'regular' : 'medium'}
                              style={[
                                styles.answerText,
                                isEmpty
                                  ? styles.answerEmpty
                                  : isCorrect
                                    ? styles.answerCorrect
                                    : styles.answerIncorrect,
                              ]}
                            >
                              {isEmpty ? 'খালি' : entry.rawText}
                            </BnText>
                          </View>

                          <View
                            style={[
                              styles.ptsBadge,
                              isCorrect
                                ? entry.isDuplicateMatch
                                  ? styles.ptsSharedBg
                                  : styles.ptsUniqueBg
                                : styles.ptsZeroBg,
                            ]}
                          >
                            <BnText
                              weight="bold"
                              style={[
                                styles.ptsText,
                                isCorrect
                                  ? entry.isDuplicateMatch
                                    ? styles.ptsSharedText
                                    : styles.ptsUniqueText
                                  : styles.ptsZeroText,
                              ]}
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

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.parchment,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
    color: AppColors.ink,
  },
  standingsList: {
    gap: 10,
  },
  standingRow: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  standingRowWinner: {
    backgroundColor: 'rgba(227, 245, 238, 0.65)',
    borderColor: 'rgba(13, 124, 95, 0.4)',
  },
  standingRowNormal: {
    backgroundColor: AppColors.ivory,
    borderColor: AppColors.parchment,
  },
  standingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    lineHeight: 22,
  },
  playerInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    fontSize: 16,
    lineHeight: 26,
    color: AppColors.ink,
    flexShrink: 1,
  },
  playerStats: {
    fontSize: 12,
    lineHeight: 20,
    color: AppColors.slateMuted,
  },
  scoreBox: {
    minWidth: 58,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.parchment,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 17,
    lineHeight: 26,
    color: AppColors.emeraldDark,
  },
  scoreUnit: {
    fontSize: 10.5,
    lineHeight: 16,
    color: AppColors.slateMuted,
  },
  roundSwitchHeading: {
    fontSize: 14.5,
    lineHeight: 24,
    color: AppColors.ink,
    marginBottom: 8,
  },
  roundTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roundTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  roundTabActive: {
    backgroundColor: AppColors.emerald,
    borderColor: AppColors.emeraldDark,
  },
  roundTabIdle: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.parchment,
  },
  roundTabText: {
    fontSize: 13,
    lineHeight: 21,
  },
  roundTabTextActive: {
    color: '#FFFFFF',
  },
  roundTabTextIdle: {
    color: AppColors.ink,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  letterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: AppColors.emeraldSoft,
  },
  letterPillText: {
    fontSize: 12.5,
    lineHeight: 20,
    color: AppColors.emeraldDark,
  },
  categoriesList: {
    gap: 12,
  },
  categoryCard: {
    borderRadius: 16,
    backgroundColor: AppColors.ivory,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.parchment,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.parchment,
  },
  categoryName: {
    flex: 1,
    fontSize: 14.5,
    lineHeight: 23,
    color: AppColors.ink,
  },
  answersList: {
    gap: 6,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
    gap: 8,
  },
  answerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  answerPlayer: {
    width: 92,
    fontSize: 12.5,
    lineHeight: 20,
    color: AppColors.slateMuted,
  },
  answerText: {
    flex: 1,
    fontSize: 14.5,
    lineHeight: 24,
  },
  answerEmpty: {
    color: AppColors.slateLight,
    fontStyle: 'italic',
  },
  answerCorrect: {
    color: AppColors.ink,
  },
  answerIncorrect: {
    color: AppColors.crimson,
    textDecorationLine: 'line-through',
  },
  ptsBadge: {
    minWidth: 42,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignItems: 'center',
  },
  ptsUniqueBg: {
    backgroundColor: AppColors.emeraldSoft,
  },
  ptsSharedBg: {
    backgroundColor: AppColors.amberSoft,
  },
  ptsZeroBg: {
    backgroundColor: AppColors.sand,
  },
  ptsText: {
    fontSize: 12.5,
    lineHeight: 20,
  },
  ptsUniqueText: {
    color: AppColors.emeraldDark,
  },
  ptsSharedText: {
    color: AppColors.amber,
  },
  ptsZeroText: {
    color: AppColors.slateMuted,
  },
});
