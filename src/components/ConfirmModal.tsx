import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '../constants/theme';
import { BnText } from './BnText';
import { Portal } from './Portal';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  extraContent?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'হ্যাঁ, নিশ্চিত',
  cancelLabel = 'বাতিল করুন',
  variant = 'default',
  iconName = 'help-circle-outline',
  extraContent,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });
    return () => sub.remove();
  }, [visible, onCancel]);

  if (!visible) {
    return null;
  }

  const isDanger = variant === 'danger';
  const cardWidth = Math.min(Math.max(260, windowWidth - 44), 352);

  return (
    <Portal>
      <View
        style={[
          styles.backdrop,
          {
            paddingTop: Math.max(20, insets.top + 12),
            paddingBottom: Math.max(20, insets.bottom + 12),
          },
        ]}
      >
        <Pressable
          style={styles.backdropDismiss}
          onPress={onCancel}
          accessibilityLabel={cancelLabel}
        />

        <View style={[styles.card, { width: cardWidth }]}>
          <View style={styles.header}>
            <View
              style={[
                styles.iconOuterRing,
                isDanger ? styles.ringDanger : styles.ringDefault,
              ]}
            >
              <View
                style={[
                  styles.iconInnerCircle,
                  isDanger ? styles.circleDanger : styles.circleDefault,
                ]}
              >
                <MaterialCommunityIcons
                  name={iconName}
                  size={25}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <BnText weight="bold" style={styles.title}>
              {title}
            </BnText>

            <BnText style={styles.message}>{message}</BnText>
          </View>

          {extraContent ? <View style={styles.extraWrap}>{extraContent}</View> : null}

          <View style={styles.buttonStack}>
            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              style={[
                styles.buttonBase,
                isDanger ? styles.confirmBtnDanger : styles.confirmBtnDefault,
              ]}
            >
              <MaterialCommunityIcons
                name={isDanger ? 'exit-to-app' : 'check-bold'}
                size={19}
                color="#FFFFFF"
              />
              <BnText weight="bold" style={styles.confirmText}>
                {confirmLabel}
              </BnText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              style={[styles.buttonBase, styles.cancelBtn]}
            >
              <BnText weight="semibold" style={styles.cancelText}>
                {cancelLabel}
              </BnText>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropDismiss: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: AppColors.parchment,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
  },
  header: {
    width: '100%',
    alignItems: 'center',
  },
  iconOuterRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ringDefault: {
    backgroundColor: AppColors.emeraldSoft,
  },
  ringDanger: {
    backgroundColor: AppColors.crimsonSoft,
  },
  iconInnerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDefault: {
    backgroundColor: AppColors.emerald,
  },
  circleDanger: {
    backgroundColor: AppColors.crimson,
  },
  title: {
    width: '100%',
    fontSize: 20,
    lineHeight: 33,
    color: AppColors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    width: '100%',
    fontSize: 14.5,
    lineHeight: 24,
    color: AppColors.slateMuted,
    textAlign: 'center',
    marginBottom: 18,
  },
  extraWrap: {
    width: '100%',
    marginBottom: 18,
  },
  buttonStack: {
    width: '100%',
    gap: 10,
  },
  buttonBase: {
    width: '100%',
    minHeight: 50,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDefault: {
    backgroundColor: AppColors.emerald,
    borderWidth: 1,
    borderColor: AppColors.emeraldDark,
  },
  confirmBtnDanger: {
    backgroundColor: AppColors.crimson,
    borderWidth: 1,
    borderColor: AppColors.crimson,
  },
  cancelBtn: {
    backgroundColor: AppColors.sand,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  confirmText: {
    fontSize: 15.5,
    lineHeight: 26,
    color: '#FFFFFF',
    textAlign: 'center',
    flexShrink: 1,
  },
  cancelText: {
    fontSize: 15,
    lineHeight: 25,
    color: AppColors.ink,
    textAlign: 'center',
    flexShrink: 1,
  },
});
