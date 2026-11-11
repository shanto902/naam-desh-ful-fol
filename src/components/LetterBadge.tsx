import React from 'react';
import { View } from 'react-native';

import { BnText } from './BnText';

interface LetterBadgeProps {
  letter: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LetterBadge({
  letter,
  label = 'নির্বাচিত বর্ণ',
  size = 'lg',
}: LetterBadgeProps) {
  const outerSize =
    size === 'lg' ? 'w-28 h-28' : size === 'md' ? 'w-20 h-20' : 'w-14 h-14';
  const innerSize =
    size === 'lg' ? 'w-24 h-24' : size === 'md' ? 'w-16 h-16' : 'w-11 h-11';
  const fontStyle =
    size === 'lg'
      ? { fontSize: 52, lineHeight: 72 }
      : size === 'md'
        ? { fontSize: 36, lineHeight: 50 }
        : { fontSize: 24, lineHeight: 34 };

  return (
    <View className="items-center">
      {label ? (
        <BnText weight="semibold" className="text-xs text-slateMuted mb-1.5">
          {label}
        </BnText>
      ) : null}
      <View
        className={`${outerSize} rounded-full bg-amberSoft border-2 border-marigold/40 items-center justify-center shadow-sm`}
      >
        <View
          className={`${innerSize} rounded-full bg-emeraldBrand border-2 border-white items-center justify-center`}
        >
          <BnText weight="bold" className="text-white" style={fontStyle}>
            {letter}
          </BnText>
        </View>
      </View>
    </View>
  );
}
