import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { PlayerStanding } from '../types/game';
import { getBengaliOrdinal, toBengaliDigits } from '../utils/bengali';
import { BnText } from './BnText';

interface WinnerCelebrationProps {
  winnerNames: string[];
  topScoreText: string;
  standings?: PlayerStanding[];
}

const CONFETTI_ITEMS = [
  { left: '7%', top: 18, color: '#FDE047', w: 10, h: 10, round: true, delay: 0, drift: -10 },
  { left: '17%', top: 52, color: '#FB7185', w: 12, h: 6, round: false, delay: 140, drift: -12 },
  { left: '26%', top: 22, color: '#A5F3FC', w: 8, h: 8, round: true, delay: 240, drift: -8 },
  { left: '74%', top: 20, color: '#FDE047', w: 12, h: 6, round: false, delay: 100, drift: -11 },
  { left: '84%', top: 50, color: '#FDBA74', w: 10, h: 10, round: true, delay: 200, drift: -10 },
  { left: '91%', top: 24, color: '#C4B5FD', w: 10, h: 6, round: false, delay: 320, drift: -9 },
  { left: '11%', top: 118, color: '#6EE7B7', w: 9, h: 9, round: true, delay: 180, drift: -8 },
  { left: '88%', top: 120, color: '#FDE047', w: 11, h: 6, round: false, delay: 80, drift: -12 },
  { left: '19%', top: 162, color: '#FDBA74', w: 8, h: 8, round: true, delay: 260, drift: -9 },
  { left: '81%', top: 166, color: '#FB7185', w: 9, h: 9, round: true, delay: 160, drift: -10 },
] as const;

function ConfettiPiece({
  left,
  top,
  color,
  w,
  h,
  round,
  delay,
  drift,
}: typeof CONFETTI_ITEMS[number]) {
  const ty = useSharedValue(0);
  const rot = useSharedValue(-12);
  const op = useSharedValue(0.45);

  useEffect(() => {
    ty.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(drift, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    rot.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(18, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
          withTiming(-18, { duration: 1400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    op.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1100 }),
          withTiming(0.45, { duration: 1100 })
        ),
        -1,
        true
      )
    );
  }, [delay, drift, op, rot, ty]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }, { rotate: `${rot.value}deg` }],
    opacity: op.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: left as `${number}%`,
          top,
          width: w,
          height: h,
          borderRadius: round ? w / 2 : 3,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

function PodiumPillar({
  standing,
  height,
  tintBg,
  tintBorder,
  badgeBg,
  badgeText,
  isFirst,
}: {
  standing: PlayerStanding;
  height: number;
  tintBg: string;
  tintBorder: string;
  badgeBg: string;
  badgeText: string;
  isFirst: boolean;
}) {
  return (
    <View style={styles.podiumCol}>
      <View style={styles.podiumTop}>
        {isFirst ? (
          <MaterialCommunityIcons
            name="crown"
            size={20}
            color="#FDE047"
            style={styles.podiumCrown}
          />
        ) : null}
        <BnText
          weight="bold"
          numberOfLines={1}
          style={styles.podiumName}
        >
          {standing.playerName}
        </BnText>
      </View>

      <View
        style={[
          styles.podiumBlock,
          {
            height,
            backgroundColor: tintBg,
            borderColor: tintBorder,
          },
        ]}
      >
        <View style={[styles.podiumRankPill, { backgroundColor: badgeBg }]}>
          <BnText weight="bold" style={[styles.podiumRankText, { color: badgeText }]}>
            {getBengaliOrdinal(standing.rank)}
          </BnText>
        </View>
        <BnText weight="bold" style={styles.podiumScoreText}>
          {toBengaliDigits(standing.totalScore)}
        </BnText>
        <BnText style={styles.podiumPtsLabel}>পয়েন্ট</BnText>
      </View>
    </View>
  );
}

export function WinnerCelebration({
  winnerNames,
  topScoreText,
  standings = [],
}: WinnerCelebrationProps) {
  const scale = useSharedValue(0.65);
  const rotate = useSharedValue(-6);
  const haloScale = useSharedValue(0.95);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 9, stiffness: 120 });
    rotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    haloScale.value = withRepeat(
      withSequence(
        withTiming(1.09, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [haloScale, rotate, scale]);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
  }));

  const isTie = winnerNames.length > 1;
  const topThree = standings.slice(0, 3);
  const podiumOrder =
    topThree.length >= 3
      ? [topThree[1], topThree[0], topThree[2]]
      : topThree;

  return (
    <View style={styles.stage}>
      <View style={styles.glowCircleTop} />
      <View style={styles.glowCircleBottom} />

      {CONFETTI_ITEMS.map((item, idx) => (
        <ConfettiPiece key={idx} {...item} />
      ))}

      {/* Trophy & Halo */}
      <View style={styles.trophyArea}>
        <Animated.View style={[styles.trophyHalo, haloStyle]} />
        <Animated.View style={[styles.trophyCircle, trophyStyle]}>
          <MaterialCommunityIcons
            name={isTie ? 'handshake' : 'trophy'}
            size={44}
            color="#92400E"
          />
        </Animated.View>
      </View>

      {/* Winner Ribbon */}
      <View style={styles.ribbonPill}>
        <MaterialCommunityIcons name="star-four-points" size={14} color="#B45309" />
        <BnText weight="bold" style={styles.ribbonText}>
          {isTie ? 'অভিনন্দন • যৌথ বিজয়ী!' : 'অভিনন্দন • চ্যাম্পিয়ন!'}
        </BnText>
        <MaterialCommunityIcons name="star-four-points" size={14} color="#B45309" />
      </View>

      {/* Winner Name */}
      <BnText weight="bold" style={styles.winnerName}>
        {winnerNames.join(' ও ')}
      </BnText>

      {/* Score Pill */}
      <View style={styles.scorePill}>
        <BnText weight="bold" style={styles.scorePillText}>
          সর্বমোট স্কোর: {topScoreText} পয়েন্ট
        </BnText>
      </View>

      {/* Mini Podium */}
      {podiumOrder.length >= 2 ? (
        <View style={styles.podiumRow}>
          {podiumOrder.map((player) => {
            const isFirst = player.rank === 1;
            const isSecond = player.rank === 2;
            return (
              <PodiumPillar
                key={player.playerId}
                standing={player}
                height={isFirst ? 98 : isSecond ? 78 : 66}
                tintBg={
                  isFirst
                    ? 'rgba(254, 240, 138, 0.24)'
                    : isSecond
                      ? 'rgba(224, 231, 255, 0.18)'
                      : 'rgba(255, 237, 213, 0.16)'
                }
                tintBorder={
                  isFirst
                    ? '#FACC15'
                    : isSecond
                      ? 'rgba(199, 210, 254, 0.6)'
                      : 'rgba(253, 186, 116, 0.55)'
                }
                badgeBg={
                  isFirst ? '#FDE047' : isSecond ? '#E0E7FF' : '#FFEDD5'
                }
                badgeText={
                  isFirst ? '#78350F' : isSecond ? '#3730A3' : '#9A3412'
                }
                isFirst={isFirst}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: AppColors.emerald,
    borderWidth: 2,
    borderColor: '#FACC15',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: AppColors.emeraldDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
  glowCircleTop: {
    position: 'absolute',
    top: -55,
    right: -45,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  glowCircleBottom: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(250, 204, 21, 0.10)',
  },
  trophyArea: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  trophyHalo: {
    position: 'absolute',
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: 'rgba(254, 240, 138, 0.26)',
    borderWidth: 1.5,
    borderColor: 'rgba(254, 240, 138, 0.48)',
  },
  trophyCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FEF08A',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  ribbonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
    marginBottom: 10,
  },
  ribbonText: {
    fontSize: 12.5,
    lineHeight: 21,
    color: '#92400E',
  },
  winnerName: {
    width: '100%',
    fontSize: 28,
    lineHeight: 46,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scorePill: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: AppColors.marigold,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scorePillText: {
    fontSize: 15,
    lineHeight: 25,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  podiumRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
  },
  podiumTop: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 6,
  },
  podiumCrown: {
    marginBottom: 2,
  },
  podiumName: {
    width: '100%',
    fontSize: 13,
    lineHeight: 21,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  podiumBlock: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRankPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginBottom: 4,
  },
  podiumRankText: {
    fontSize: 11.5,
    lineHeight: 19,
  },
  podiumScoreText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#FFFFFF',
  },
  podiumPtsLabel: {
    fontSize: 11,
    lineHeight: 17,
    color: '#D1FAE5',
  },
});
