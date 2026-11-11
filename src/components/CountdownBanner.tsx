import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, Platform, View } from 'react-native';

import { AppColors } from '../constants/theme';
import { formatBengaliClock } from '../utils/bengali';
import { BnText } from './BnText';

interface CountdownBannerProps {
  durationSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  onTimeUp: () => void;
}

export function CountdownBanner({
  durationSeconds,
  isRunning,
  isPaused,
  onTimeUp,
}: CountdownBannerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const remainingMsRef = useRef(durationSeconds * 1000);
  const endTimeRef = useRef<number | null>(null);
  const firedRef = useRef(false);
  const lastHapticSecRef = useRef<number | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (!isRunning) {
      endTimeRef.current = null;
      return;
    }

    if (isPaused) {
      if (endTimeRef.current !== null) {
        remainingMsRef.current = Math.max(0, endTimeRef.current - Date.now());
        endTimeRef.current = null;
      }
      return;
    }

    if (firedRef.current) {
      return;
    }

    endTimeRef.current = Date.now() + remainingMsRef.current;

    const syncClock = () => {
      if (endTimeRef.current === null || firedRef.current) return;
      const msLeft = Math.max(0, endTimeRef.current - Date.now());
      remainingMsRef.current = msLeft;
      const secsLeft = Math.ceil(msLeft / 1000);
      setRemainingSeconds(secsLeft);

      if (
        Platform.OS !== 'web' &&
        secsLeft > 0 &&
        secsLeft <= 5 &&
        lastHapticSecRef.current !== secsLeft
      ) {
        lastHapticSecRef.current = secsLeft;
        Haptics.selectionAsync().catch(() => {});
      }

      if (msLeft <= 0 && !firedRef.current) {
        firedRef.current = true;
        endTimeRef.current = null;
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
            () => {}
          );
        }
        onTimeUpRef.current();
      }
    };

    const immediateTimer = setTimeout(syncClock, 0);
    const interval = setInterval(syncClock, 150);

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncClock();
      }
    });

    return () => {
      clearTimeout(immediateTimer);
      clearInterval(interval);
      appStateSub.remove();
    };
  }, [isRunning, isPaused]);

  const progressRatio =
    durationSeconds > 0
      ? Math.max(0, Math.min(1, remainingSeconds / durationSeconds))
      : 0;

  const isUrgent = remainingSeconds <= 10;
  const isWarning =
    remainingSeconds > 10 &&
    remainingSeconds <= Math.floor(durationSeconds * 0.4);

  const barColor = isUrgent
    ? AppColors.crimson
    : isWarning
      ? AppColors.amber
      : AppColors.emerald;

  const pillBg = isUrgent
    ? 'bg-crimsonSoft border-crimson/30'
    : isWarning
      ? 'bg-amberSoft border-amber/30'
      : 'bg-emeraldSoft border-emeraldBrand/30';

  const textColor = isUrgent
    ? 'text-crimson'
    : isWarning
      ? 'text-amberWarm'
      : 'text-emeraldDark';

  return (
    <View className={`rounded-2xl px-3.5 py-2.5 border ${pillBg}`}>
      <View className="flex-row items-center justify-between mb-1.5 gap-2">
        <View className="flex-row items-center gap-1.5 flex-1">
          <MaterialCommunityIcons
            name={isUrgent ? 'timer-alert-outline' : 'timer-outline'}
            size={18}
            color={barColor}
          />
          <BnText
            weight="semibold"
            className={`text-xs flex-1 ${textColor}`}
            style={{ lineHeight: 20 }}
          >
            {remainingSeconds <= 0
              ? 'সময় শেষ!'
              : isPaused
                ? 'সময় স্থগিত'
                : isUrgent
                  ? 'সময় প্রায় শেষ!'
                  : 'অবশিষ্ট সময়'}
          </BnText>
        </View>
        <BnText
          weight="bold"
          className={`text-lg ${textColor}`}
          style={{ lineHeight: 28 }}
        >
          {formatBengaliClock(remainingSeconds)}
        </BnText>
      </View>

      <View className="h-2 rounded-full bg-white/80 overflow-hidden">
        <View
          style={{
            width: `${Math.round(progressRatio * 100)}%`,
            backgroundColor: barColor,
          }}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
}
