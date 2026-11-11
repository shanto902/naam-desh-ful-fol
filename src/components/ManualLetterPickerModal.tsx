import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BENGALI_ALPHABET } from '../constants/alphabet';
import { AppColors } from '../constants/theme';
import { BnText } from './BnText';
import { Portal } from './Portal';

interface ManualLetterPickerModalProps {
  visible: boolean;
  selectedLetter: string | null;
  usedLetters?: string[];
  title?: string;
  subtitle?: string;
  onSelect: (letter: string) => void;
  onClose?: () => void;
  dismissible?: boolean;
}

export function ManualLetterPickerModal({
  visible,
  selectedLetter,
  usedLetters = [],
  title = 'একটি বাংলা বর্ণ নির্বাচন করুন',
  subtitle = 'রাউন্ডের জন্য আপনার পছন্দের বর্ণটি বেছে নিন',
  onSelect,
  onClose,
  dismissible = true,
}: ManualLetterPickerModalProps) {
  const insets = useSafeAreaInsets();
  const usedSet = new Set(usedLetters);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dismissible && onClose) {
        onClose();
      }
      return true;
    });
    return () => sub.remove();
  }, [visible, dismissible, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <View style={styles.backdrop}>
        {dismissible && onClose ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        ) : null}

        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <BnText weight="bold" style={styles.title}>
                {title}
              </BnText>
              <BnText style={styles.subtitle}>{subtitle}</BnText>
            </View>
            {dismissible && onClose ? (
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={AppColors.ink}
                />
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={[
              styles.grid,
              { paddingBottom: Math.max(24, insets.bottom + 16) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {BENGALI_ALPHABET.map((item) => {
              const isSelected = selectedLetter === item.char;
              const isUsed = usedSet.has(item.char);
              return (
                <Pressable
                  key={item.char}
                  onPress={() => onSelect(item.char)}
                  style={({ pressed }) => [
                    styles.tile,
                    isSelected
                      ? styles.tileSelected
                      : isUsed
                        ? styles.tileUsed
                        : styles.tileIdle,
                    pressed && styles.pressed,
                  ]}
                >
                  <BnText
                    weight="bold"
                    style={[
                      styles.tileText,
                      isSelected ? styles.tileTextSelected : styles.tileTextIdle,
                    ]}
                  >
                    {item.char}
                  </BnText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.56)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    backgroundColor: AppColors.ivory,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '82%',
    borderTopWidth: 1,
    borderColor: AppColors.parchment,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.parchment,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    lineHeight: 28,
    color: AppColors.ink,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 19,
    color: AppColors.slateMuted,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flexGrow: 0,
    flexShrink: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  tileSelected: {
    backgroundColor: AppColors.emerald,
    borderColor: AppColors.emeraldDark,
  },
  tileUsed: {
    backgroundColor: AppColors.amberSoft,
    borderColor: 'rgba(217, 119, 6, 0.4)',
  },
  tileIdle: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.parchment,
  },
  tileText: {
    fontSize: 18,
    lineHeight: 26,
  },
  tileTextSelected: {
    color: '#FFFFFF',
  },
  tileTextIdle: {
    color: AppColors.ink,
  },
  pressed: {
    opacity: 0.82,
  },
});
