import React from 'react';
import { Platform, Text, TextProps } from 'react-native';

import { AppFonts } from '../constants/theme';

export type FontWeightVariant = 'regular' | 'medium' | 'semibold' | 'bold';

interface BnTextProps extends TextProps {
  weight?: FontWeightVariant;
  className?: string;
  inline?: boolean;
}

function shouldPadTrailingSpace(children: React.ReactNode, inline: boolean): boolean {
  if (Platform.OS !== 'android' || inline) return false;
  if (typeof children === 'string') {
    const trimmed = children.trim();
    return trimmed.length > 1 || /\s/.test(trimmed);
  }
  if (typeof children === 'number') {
    return false;
  }
  return Boolean(children);
}

export function BnText({
  weight = 'regular',
  inline = false,
  style,
  children,
  ...rest
}: BnTextProps) {
  const addAndroidBuffer = shouldPadTrailingSpace(children, inline);

  return (
    <Text
      textBreakStrategy="simple"
      android_hyphenationFrequency="none"
      maxFontSizeMultiplier={1.25}
      {...rest}
      style={[
        {
          fontFamily: AppFonts[weight],
          fontWeight: 'normal',
        },
        style,
      ]}
    >
      {children}
      {addAndroidBuffer ? '  ' : null}
    </Text>
  );
}
