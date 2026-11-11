import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import { AppColors } from '../constants/theme';
import { BnText } from './BnText';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
}

export function AppHeader({
  title,
  subtitle,
  onBackPress,
  showBack = true,
  rightSlot,
}: AppHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View className="flex-row items-center justify-between px-4 pt-2 pb-3 border-b border-parchment bg-ivory">
      <View className="flex-row items-center flex-1 gap-3">
        {showBack && (
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="ফিরে যান"
            className="w-10 h-10 rounded-full bg-surface border border-parchment items-center justify-center active:opacity-75"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color={AppColors.ink}
            />
          </Pressable>
        )}
        <View className="flex-1">
          <BnText
            weight="bold"
            className="text-xl text-ink w-full"
            style={{ lineHeight: 32 }}
            numberOfLines={1}
          >
            {title}
          </BnText>
          {subtitle ? (
            <BnText
              weight="medium"
              className="text-xs text-slateMuted w-full"
              style={{ lineHeight: 20 }}
              numberOfLines={1}
            >
              {subtitle}
            </BnText>
          ) : null}
        </View>
      </View>
      {rightSlot ? <View className="ml-2">{rightSlot}</View> : null}
    </View>
  );
}
