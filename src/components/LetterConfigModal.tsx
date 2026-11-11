import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BENGALI_ALPHABET,
  DEFAULT_ENABLED_LETTERS,
} from '../constants/alphabet';
import { AppColors, MIN_AVAILABLE_LETTERS } from '../constants/theme';
import { toBengaliDigits } from '../utils/bengali';
import { BnText } from './BnText';
import { Portal } from './Portal';

interface LetterConfigModalProps {
  visible: boolean;
  initialLetters: string[];
  onSave: (letters: string[]) => Promise<void> | void;
  onClose: () => void;
}

function LetterConfigContent({
  initialLetters,
  onSave,
  onClose,
}: Omit<LetterConfigModalProps, 'visible'>) {
  const insets = useSafeAreaInsets();
  const [selectedSet, setSelectedSet] = useState<Set<string>>(
    () => new Set(initialLetters)
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const vowels = BENGALI_ALPHABET.filter((l) => l.group === 'vowel');
  const consonants = BENGALI_ALPHABET.filter((l) => l.group === 'consonant');

  const toggleLetter = (char: string) => {
    setErrorMsg(null);
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (next.has(char)) {
        if (next.size <= MIN_AVAILABLE_LETTERS) {
          setErrorMsg(
            'র‍্যান্ডম বর্ণ নির্বাচনের জন্য কমপক্ষে ১টি বর্ণ সক্রিয় থাকতে হবে।'
          );
          return prev;
        }
        next.delete(char);
      } else {
        next.add(char);
      }
      return next;
    });
  };

  const handleRestoreDefaults = () => {
    setErrorMsg(null);
    setSelectedSet(new Set(DEFAULT_ENABLED_LETTERS));
  };

  const handleSelectAll = () => {
    setErrorMsg(null);
    setSelectedSet(new Set(BENGALI_ALPHABET.map((l) => l.char)));
  };

  const handleConfirmSave = async () => {
    if (selectedSet.size < MIN_AVAILABLE_LETTERS) {
      setErrorMsg('কমপক্ষে ১টি বর্ণ নির্বাচন করুন।');
      return;
    }
    setSaving(true);
    try {
      await onSave(Array.from(selectedSet));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const renderLetterGrid = (items: typeof BENGALI_ALPHABET) => (
    <View style={styles.grid}>
      {items.map((item) => {
        const isActive = selectedSet.has(item.char);
        return (
          <Pressable
            key={item.char}
            onPress={() => toggleLetter(item.char)}
            style={({ pressed }) => [
              styles.letterTile,
              isActive
                ? styles.letterTileActive
                : item.defaultEnabled
                  ? styles.letterTileIdle
                  : styles.letterTileRare,
              pressed && styles.pressed,
            ]}
          >
            <BnText
              weight="bold"
              style={[
                styles.letterText,
                isActive
                  ? styles.letterTextActive
                  : item.defaultEnabled
                    ? styles.letterTextIdle
                    : styles.letterTextRare,
              ]}
            >
              {item.char}
            </BnText>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.sheet}>
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <BnText weight="bold" style={styles.headerTitle}>
            বর্ণমালা কাস্টমাইজ করুন
          </BnText>
          <BnText style={styles.headerSubtitle}>
            সক্রিয় বর্ণ: {toBengaliDigits(selectedSet.size)}টি (অপ্রচলিত বর্ণ ডিফল্টভাবে বন্ধ থাকে)
          </BnText>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={20} color={AppColors.ink} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.presetRow}>
          <Pressable
            onPress={handleRestoreDefaults}
            style={({ pressed }) => [styles.presetPrimary, pressed && styles.pressed]}
          >
            <BnText weight="semibold" style={styles.presetPrimaryText}>
              ডিফল্ট বর্ণ ({toBengaliDigits(DEFAULT_ENABLED_LETTERS.length)}টি)
            </BnText>
          </Pressable>
          <Pressable
            onPress={handleSelectAll}
            style={({ pressed }) => [styles.presetSecondary, pressed && styles.pressed]}
          >
            <BnText weight="semibold" style={styles.presetSecondaryText}>
              সব বর্ণ চালু করুন
            </BnText>
          </Pressable>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <BnText weight="medium" style={styles.errorText}>
              {errorMsg}
            </BnText>
          </View>
        ) : null}

        <BnText weight="bold" style={styles.sectionTitle}>
          স্বরবর্ণ
        </BnText>
        {renderLetterGrid(vowels)}

        <BnText weight="bold" style={[styles.sectionTitle, styles.consonantHeading]}>
          ব্যঞ্জনবর্ণ
        </BnText>
        {renderLetterGrid(consonants)}

        <View style={styles.tipBox}>
          <BnText style={styles.tipText}>
            টিপস: ঙ, ঞ, ণ, ষ, ড়, ঢ়, য়, ঈ, ঊ, ঋ, ঐ, ঔ দিয়ে সাধারণত নাম বা ফলের শব্দ কম পাওয়া যায়, তাই এগুলো ডিফল্টভাবে বন্ধ রাখা হয়েছে। চাইলে ট্যাপ করে চালু করতে পারেন।
          </BnText>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(14, insets.bottom + 8) },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={onClose}
          style={styles.cancelBtn}
        >
          <BnText weight="semibold" style={styles.cancelBtnText}>
            বাতিল
          </BnText>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.84}
          onPress={handleConfirmSave}
          disabled={saving}
          style={styles.saveBtn}
        >
          <BnText weight="bold" style={styles.saveBtnText}>
            সংরক্ষণ করুন
          </BnText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function LetterConfigModal({
  visible,
  initialLetters,
  onSave,
  onClose,
}: LetterConfigModalProps) {
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <LetterConfigContent
          initialLetters={initialLetters}
          onSave={onSave}
          onClose={onClose}
        />
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
    maxHeight: '86%',
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
  headerTitle: {
    fontSize: 18,
    lineHeight: 28,
    color: AppColors.ink,
  },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 18,
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
  },
  scrollContent: {
    paddingVertical: 16,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: AppColors.emeraldSoft,
    borderWidth: 1,
    borderColor: 'rgba(13, 124, 95, 0.3)',
  },
  presetPrimaryText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: AppColors.emeraldDark,
  },
  presetSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.parchment,
  },
  presetSecondaryText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: AppColors.ink,
  },
  errorBox: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: AppColors.crimsonSoft,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  errorText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: AppColors.crimson,
  },
  sectionTitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: AppColors.ink,
    marginBottom: 8,
  },
  consonantHeading: {
    marginTop: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  letterTile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  letterTileActive: {
    backgroundColor: AppColors.emerald,
    borderColor: AppColors.emeraldDark,
  },
  letterTileIdle: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.parchment,
  },
  letterTileRare: {
    backgroundColor: 'rgba(245, 239, 226, 0.75)',
    borderColor: AppColors.parchment,
  },
  letterText: {
    fontSize: 18,
    lineHeight: 26,
  },
  letterTextActive: {
    color: '#FFFFFF',
  },
  letterTextIdle: {
    color: AppColors.ink,
  },
  letterTextRare: {
    color: AppColors.slateLight,
  },
  tipBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: AppColors.amberSoft,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.22)',
  },
  tipText: {
    fontSize: 12,
    lineHeight: 19,
    color: AppColors.slateMuted,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: AppColors.parchment,
    backgroundColor: AppColors.surface,
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: AppColors.sand,
    borderWidth: 1,
    borderColor: AppColors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14.5,
    lineHeight: 22,
    color: AppColors.ink,
  },
  saveBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: AppColors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.82,
  },
});
