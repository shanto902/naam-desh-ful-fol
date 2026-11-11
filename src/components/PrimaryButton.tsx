import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { AppColors } from '../constants/theme';
import { BnText } from './BnText';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: ViewStyle;
  size?: 'md' | 'lg';
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { container: ViewStyle; textColor: string; iconColor: string }
> = {
  primary: {
    container: {
      backgroundColor: AppColors.emerald,
      borderColor: AppColors.emeraldDark,
      borderWidth: 1,
    },
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  secondary: {
    container: {
      backgroundColor: AppColors.marigold,
      borderColor: AppColors.marigold,
      borderWidth: 1,
    },
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  outline: {
    container: {
      backgroundColor: AppColors.surface,
      borderColor: AppColors.parchment,
      borderWidth: 1.5,
    },
    textColor: AppColors.ink,
    iconColor: AppColors.emerald,
  },
  danger: {
    container: {
      backgroundColor: AppColors.crimson,
      borderColor: AppColors.crimson,
      borderWidth: 1,
    },
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 1,
    },
    textColor: AppColors.emerald,
    iconColor: AppColors.emerald,
  },
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  iconName,
  disabled = false,
  loading = false,
  style,
  size = 'lg',
}: PrimaryButtonProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.base,
        size === 'lg' ? styles.sizeLg : styles.sizeMd,
        variantStyle.container,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.iconColor}
          style={styles.spinner}
        />
      ) : iconName ? (
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name={iconName}
            size={size === 'lg' ? 21 : 18}
            color={variantStyle.iconColor}
          />
        </View>
      ) : null}
      <BnText
        weight="bold"
        style={[
          styles.label,
          {
            color: variantStyle.textColor,
            fontSize: size === 'lg' ? 16 : 14,
            lineHeight: size === 'lg' ? 27 : 24,
          },
        ]}
      >
        {label}
      </BnText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeLg: {
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sizeMd: {
    minHeight: 44,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  spinner: {
    marginRight: 8,
  },
  iconWrap: {
    marginRight: 8,
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
  },
});
