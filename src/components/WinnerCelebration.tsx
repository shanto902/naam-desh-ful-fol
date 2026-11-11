import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { View } from 'react-native';
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
import { BnText } from './BnText';

interface WinnerCelebrationProps {
  winnerNames: string[];
  topScoreText: string;
}

const CONFETTI_SPOTS = [
  { left: '10%', top: 14, color: AppColors.marigold, size: 10, delay: 0 },
  { left: '22%', top: 42, color: AppColors.gold, size: 8, delay: 120 },
  { left: '78%', top: 18, color: AppColors.emerald, size: 10, delay: 200 },
  { left: '88%', top: 48, color: AppColors.indigo, size: 8, delay: 80 },
  { left: '15%', top: 82, color: AppColors.indigo, size: 9, delay: 280 },
  { left: '84%', top: 88, color: AppColors.marigold, size: 9, delay: 180 },
] as const;

function FloatingSpark({
  left,
  top,
  color,
  size,
  delay,
}: {
  left: string;
  top: number;
  color: string;
  size: number;
  delay: number;
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    opacity.value = withDelay(
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
  }, [delay, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: left as `${number}%`,
          top,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

export function WinnerCelebration({
  winnerNames,
  topScoreText,
}: WinnerCelebrationProps) {
  const scale = useSharedValue(0.7);
  const rotate = useSharedValue(-6);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 120 });
    rotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [rotate, scale]);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const isTie = winnerNames.length > 1;

  return (
    <View className="rounded-3xl bg-surface border-2 border-gold/40 p-6 items-center overflow-hidden relative shadow-sm">
      {CONFETTI_SPOTS.map((spot, idx) => (
        <FloatingSpark
          key={idx}
          left={spot.left}
          top={spot.top}
          color={spot.color}
          size={spot.size}
          delay={spot.delay}
        />
      ))}

      <Animated.View
        style={trophyStyle}
        className="w-20 h-20 rounded-full bg-goldSoft border-2 border-gold items-center justify-center mb-3"
      >
        <MaterialCommunityIcons
          name={isTie ? 'handshake' : 'trophy'}
          size={42}
          color="#CA8A04"
        />
      </Animated.View>

      <View className="px-3.5 py-1 rounded-full bg-emeraldSoft border border-emeraldBrand/20 mb-2">
        <BnText weight="bold" className="text-xs text-emeraldDark">
          {isTie ? 'যৌথ বিজয়ী!' : 'খেলার বিজয়ী'}
        </BnText>
      </View>

      <BnText weight="bold" className="text-2xl text-ink text-center leading-9">
        {winnerNames.join(' ও ')}
      </BnText>

      <BnText weight="semibold" className="text-base text-marigold mt-1">
        মোট স্কোর: {topScoreText} পয়েন্ট
      </BnText>
    </View>
  );
}
