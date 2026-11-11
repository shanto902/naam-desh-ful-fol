import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppColors } from '../constants/theme';
import { Category, Player } from '../types/game';
import { toBengaliDigits } from '../utils/bengali';
import { BnText } from './BnText';

interface TurnHandoffStageProps {
  currentPlayer: Player;
  players: Player[];
  currentPlayerIndex: number;
  currentRoundNumber: number;
  totalRounds: number;
  roundDuration: number;
  categories: Category[];
  onStartTurn: () => void;
  onRequestExit: () => void;
}

const SPARKLE_SPOTS = [
  { left: '9%', top: 20, size: 12, color: '#FDE047', delay: 0 },
  { left: '87%', top: 26, size: 13, color: '#A7F3D0', delay: 220 },
  { left: '14%', top: 158, size: 10, color: '#FDBA74', delay: 360 },
  { left: '84%', top: 152, size: 11, color: '#FDE047', delay: 140 },
] as const;

function SparkleSpot({
  left,
  top,
  size,
  color,
  delay,
}: (typeof SPARKLE_SPOTS)[number]) {
  const opacity = useSharedValue(0.35);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1150, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.35, { duration: 1150, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.18, { duration: 1150, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.85, { duration: 1150, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [delay, opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: left as `${number}%`,
          top,
        },
        animStyle,
      ]}
    >
      <MaterialCommunityIcons name="star-four-points" size={size} color={color} />
    </Animated.View>
  );
}

/**
 * Lively pass-the-phone handoff screen before the active player's turn timer starts.
 */
export function TurnHandoffStage({
  currentPlayer,
  players,
  currentPlayerIndex,
  currentRoundNumber,
  totalRounds,
  roundDuration,
  categories,
  onStartTurn,
  onRequestExit,
}: TurnHandoffStageProps) {
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);
  const floatY = useSharedValue(0);
  const haloScale = useSharedValue(0.96);
  const haloOpacity = useSharedValue(0.45);

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 14, stiffness: 150 });
    cardOpacity.value = withTiming(1, { duration: 280 });

    floatY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    haloScale.value = withRepeat(
      withSequence(
        withTiming(1.09, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.96, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    haloOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [cardOpacity, cardScale, floatY, haloOpacity, haloScale]);

  const cardEntranceStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const floatBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const haloPulseStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ scale: haloScale.value }],
  }));

  return (
    <View style={styles.root}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onRequestExit}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="খেলা থেকে বের হন"
          style={styles.exitBtn}
        >
          <MaterialCommunityIcons
            name="exit-to-app"
            size={17}
            color={AppColors.crimson}
          />
          <BnText weight="bold" style={styles.exitBtnText}>
            বের হন
          </BnText>
        </TouchableOpacity>

        <View style={styles.roundPill}>
          <MaterialCommunityIcons
            name="flag-variant"
            size={14}
            color={AppColors.emeraldDark}
          />
          <BnText weight="bold" style={styles.roundPillText}>
            {`রাউন্ড ${toBengaliDigits(currentRoundNumber)}/${toBengaliDigits(totalRounds)}`}
          </BnText>
        </View>

        <View style={styles.timerTopPill}>
          <MaterialCommunityIcons
            name="timer-outline"
            size={14}
            color={AppColors.amber}
          />
          <BnText weight="bold" style={styles.timerTopPillText}>
            {`${toBengaliDigits(roundDuration)} সে.`}
          </BnText>
        </View>
      </View>

      {/* Main Scrollable Stage */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.spotlightCard, cardEntranceStyle]}>
          {/* Decorative shapes */}
          <View style={styles.decorCircleTopRight} />
          <View style={styles.decorCircleBottomLeft} />
          {SPARKLE_SPOTS.map((spot, idx) => (
            <SparkleSpot key={idx} {...spot} />
          ))}

          {/* Player Turn Queue Pills */}
          <View style={styles.queueWrap}>
            {players.map((player, index) => {
              const isDone = index < currentPlayerIndex;
              const isCurrent = index === currentPlayerIndex;
              return (
                <View
                  key={player.id}
                  style={[
                    styles.queueChip,
                    isCurrent && styles.queueChipActive,
                    isDone && styles.queueChipDone,
                  ]}
                >
                  {isDone ? (
                    <MaterialCommunityIcons
                      name="check"
                      size={12}
                      color="#A7F3D0"
                    />
                  ) : isCurrent ? (
                    <MaterialCommunityIcons
                      name="play"
                      size={12}
                      color="#92400E"
                    />
                  ) : null}
                  <BnText
                    weight={isCurrent ? 'bold' : 'semibold'}
                    numberOfLines={1}
                    style={[
                      styles.queueChipText,
                      isCurrent && styles.queueChipTextActive,
                      isDone && styles.queueChipTextDone,
                    ]}
                  >
                    {player.name}
                  </BnText>
                </View>
              );
            })}
          </View>

          {/* Animated Mystery Letter + Pass Phone Medallion */}
          <View style={styles.medallionZone}>
            <Animated.View style={[styles.medallionHalo, haloPulseStyle]} />
            <Animated.View style={[styles.medallionOuter, floatBadgeStyle]}>
              <View style={styles.medallionInner}>
                <BnText weight="bold" style={styles.mysteryQuestion}>
                  ?
                </BnText>
              </View>
              <View style={styles.phoneCornerBadge}>
                <MaterialCommunityIcons
                  name="cellphone-arrow-down"
                  size={15}
                  color="#FFFFFF"
                />
              </View>
            </Animated.View>
          </View>

          {/* Active Player Callout */}
          <View style={styles.turnEyebrow}>
            <MaterialCommunityIcons
              name="shimmer"
              size={14}
              color="#FEF08A"
            />
            <BnText weight="semibold" style={styles.turnEyebrowText}>
              {`এখন পালা • খেলোয়াড় ${toBengaliDigits(currentPlayerIndex + 1)}/${toBengaliDigits(players.length)}`}
            </BnText>
          </View>

          <BnText
            weight="bold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            style={styles.playerName}
          >
            {currentPlayer.name}
          </BnText>

          <BnText weight="medium" style={styles.heroPrompt}>
            ফোনটি হাতে নিন — তৈরি হলে নিচের বাটনে চাপ দিন!
          </BnText>
        </Animated.View>

        {/* Match Snapshot & Category Chips Card */}
        <View style={styles.briefCard}>
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statTile,
                {
                  backgroundColor: AppColors.indigoSoft,
                  borderColor: 'rgba(67, 56, 202, 0.16)',
                },
              ]}
            >
              <MaterialCommunityIcons
                name="lock-question"
                size={18}
                color={AppColors.indigo}
              />
              <BnText weight="bold" style={[styles.statValue, { color: AppColors.indigo }]}>
                গোপন বর্ণ
              </BnText>
              <BnText weight="medium" style={styles.statLabel}>
                চাপলেই খুলবে
              </BnText>
            </View>

            <View
              style={[
                styles.statTile,
                {
                  backgroundColor: AppColors.marigoldSoft,
                  borderColor: 'rgba(232, 93, 47, 0.18)',
                },
              ]}
            >
              <MaterialCommunityIcons
                name="timer-outline"
                size={18}
                color={AppColors.marigold}
              />
              <BnText
                weight="bold"
                style={[styles.statValue, { color: AppColors.marigold }]}
              >
                {`${toBengaliDigits(roundDuration)} সেকেন্ড`}
              </BnText>
              <BnText weight="medium" style={styles.statLabel}>
                রাউন্ড সময়
              </BnText>
            </View>

            <View
              style={[
                styles.statTile,
                {
                  backgroundColor: AppColors.emeraldSoft,
                  borderColor: 'rgba(13, 124, 95, 0.18)',
                },
              ]}
            >
              <MaterialCommunityIcons
                name="shape-outline"
                size={18}
                color={AppColors.emerald}
              />
              <BnText
                weight="bold"
                style={[styles.statValue, { color: AppColors.emeraldDark }]}
              >
                {`${toBengaliDigits(categories.length)}টি বিভাগ`}
              </BnText>
              <BnText weight="medium" style={styles.statLabel}>
                মোট উত্তর
              </BnText>
            </View>
          </View>

          <View style={styles.divider} />

          <BnText weight="semibold" style={styles.catHeading}>
            এই রাউন্ডে যেসব বিভাগ থাকছে
          </BnText>

          <View style={styles.categoriesWrap}>
            {categories.map((cat) => (
              <View
                key={cat.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: cat.bgColor,
                    borderColor: `${cat.accentColor}30`,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={cat.iconName as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={13}
                  color={cat.accentColor}
                />
                <BnText
                  weight="semibold"
                  style={[styles.categoryChipText, { color: cat.accentColor }]}
                >
                  {cat.nameBn}
                </BnText>
              </View>
            ))}
          </View>

          <View style={styles.privacyBanner}>
            <MaterialCommunityIcons
              name="eye-off-outline"
              size={16}
              color={AppColors.amber}
            />
            <BnText weight="semibold" style={styles.privacyText}>
              অন্য খেলোয়াড়রা স্ক্রিন দেখবেন না — বর্ণ এখন লুকানো আছে!
            </BnText>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Game Launch CTA */}
      <View style={styles.ctaDock}>
        <TouchableOpacity
          onPress={onStartTurn}
          activeOpacity={0.86}
          accessibilityRole="button"
          accessibilityLabel="আমার পালা শুরু করুন"
          style={styles.startButton}
        >
          <View style={styles.startIconBox}>
            <MaterialCommunityIcons
              name="play"
              size={25}
              color={AppColors.marigold}
            />
          </View>

          <View style={styles.startTextWrap}>
            <BnText weight="bold" style={styles.startTitle}>
              আমার পালা শুরু করুন
            </BnText>
            <BnText weight="medium" style={styles.startSub}>
              {`চাপ দিলেই বাংলা বর্ণ ও ${toBengaliDigits(roundDuration)} সেকেন্ড শুরু হবে`}
            </BnText>
          </View>

          <MaterialCommunityIcons
            name="arrow-right-circle"
            size={26}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.ivory,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.parchment,
    backgroundColor: AppColors.ivory,
    gap: 8,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: AppColors.surface,
    borderWidth: 1.5,
    borderColor: AppColors.parchment,
  },
  exitBtnText: {
    fontSize: 12.5,
    lineHeight: 20,
    color: AppColors.ink,
  },
  roundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: AppColors.emeraldSoft,
    borderWidth: 1,
    borderColor: 'rgba(13, 124, 95, 0.24)',
  },
  roundPillText: {
    fontSize: 12.5,
    lineHeight: 20,
    color: AppColors.emeraldDark,
  },
  timerTopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: AppColors.amberSoft,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  timerTopPillText: {
    fontSize: 12.5,
    lineHeight: 20,
    color: '#92400E',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  spotlightCard: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: AppColors.emerald,
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    elevation: 6,
    shadowColor: AppColors.emeraldDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
  },
  decorCircleTopRight: {
    position: 'absolute',
    top: -40,
    right: -32,
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  decorCircleBottomLeft: {
    position: 'absolute',
    bottom: -48,
    left: -34,
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  queueWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  queueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 128,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  queueChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FACC15',
  },
  queueChipDone: {
    backgroundColor: 'rgba(6, 78, 59, 0.55)',
    borderColor: 'rgba(167, 243, 208, 0.25)',
  },
  queueChipText: {
    fontSize: 11.5,
    lineHeight: 18,
    color: '#D1FAE5',
  },
  queueChipTextActive: {
    color: '#92400E',
  },
  queueChipTextDone: {
    color: '#A7F3D0',
  },
  medallionZone: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  medallionHalo: {
    position: 'absolute',
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: 'rgba(254, 240, 138, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(254, 240, 138, 0.38)',
  },
  medallionOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FEF3C7',
    borderWidth: 3,
    borderColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  medallionInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: AppColors.emeraldDark,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mysteryQuestion: {
    fontSize: 38,
    lineHeight: 52,
    color: '#FEF08A',
    textAlign: 'center',
  },
  phoneCornerBadge: {
    position: 'absolute',
    right: -3,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: AppColors.marigold,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    marginBottom: 4,
  },
  turnEyebrowText: {
    fontSize: 12,
    lineHeight: 20,
    color: '#ECFDF5',
  },
  playerName: {
    width: '100%',
    fontSize: 32,
    lineHeight: 52,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroPrompt: {
    width: '100%',
    fontSize: 14,
    lineHeight: 23,
    color: '#D1FAE5',
    textAlign: 'center',
    marginTop: 2,
  },
  briefCard: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1.5,
    borderColor: AppColors.parchment,
    gap: 11,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statTile: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    gap: 2,
  },
  statValue: {
    fontSize: 12.5,
    lineHeight: 20,
    textAlign: 'center',
    width: '100%',
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 17,
    color: AppColors.slateMuted,
    textAlign: 'center',
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.parchment,
  },
  catHeading: {
    fontSize: 12.5,
    lineHeight: 20,
    color: AppColors.slateMuted,
    textAlign: 'center',
    width: '100%',
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    lineHeight: 19,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: AppColors.amberSoft,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: '#92400E',
  },
  ctaDock: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: AppColors.ivory,
    borderTopWidth: 1,
    borderTopColor: AppColors.parchment,
  },
  startButton: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: AppColors.marigold,
    borderRadius: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#C2410C',
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 5,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  startIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startTextWrap: {
    flex: 1,
  },
  startTitle: {
    width: '100%',
    fontSize: 18,
    lineHeight: 30,
    color: '#FFFFFF',
  },
  startSub: {
    width: '100%',
    fontSize: 12,
    lineHeight: 19,
    color: '#FFEDD5',
  },
});
