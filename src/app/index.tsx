import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BnText } from "../components/BnText";
import { AppColors } from "../constants/theme";
import { useGame } from "../context/GameContext";
import { loadMatchHistory } from "../storage/gameStorage";
import { toBengaliDigits } from "../utils/bengali";

const HERO_MOTIFS = [
  {
    label: "নাম",
    icon: "account-heart" as const,
    bg: "#EEF2FF",
    color: "#4338CA",
  },
  {
    label: "দেশ",
    icon: "earth" as const,
    bg: "#E3F5EE",
    color: "#0D7C5F",
  },
  {
    label: "ফুল",
    icon: "flower-tulip" as const,
    bg: "#FCE7F3",
    color: "#DB2777",
  },
  {
    label: "ফল",
    icon: "food-apple" as const,
    bg: "#FFF0EA",
    color: "#E85D2F",
  },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { clearActiveMatch } = useGame();
  const [matchCount, setMatchCount] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      clearActiveMatch();
      loadMatchHistory()
        .then((list) => {
          if (active) setMatchCount(list.length);
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [clearActiveMatch]),
  );

  const navigateWithHaptic = (path: "/setup" | "/rules" | "/history") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Tagline Pill */}
        <View style={styles.topPillRow}>
          <View style={styles.topPill}>
            <MaterialCommunityIcons
              name="notebook-edit-outline"
              size={15}
              color={AppColors.amber}
            />
            <BnText weight="semibold" style={styles.topPillText}>
              অফলাইন বাংলা শব্দের খেলা • এক ফোনেই সবাই
            </BnText>
          </View>
        </View>

        {/* Hero Brand Card */}
        <View style={styles.heroCard}>
          {/* Subtle decorative background circles */}
          <View style={styles.decorCircleTopRight} />
          <View style={styles.decorCircleBottomLeft} />

          {/* 4 Iconic Category Motifs */}
          <View style={styles.motifRow}>
            {HERO_MOTIFS.map((item) => (
              <View key={item.label} style={styles.motifItem}>
                <View
                  style={[styles.motifCircle, { backgroundColor: item.bg }]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={item.color}
                  />
                </View>
                <BnText weight="semibold" style={styles.motifLabel}>
                  {item.label}
                </BnText>
              </View>
            ))}
          </View>

          <BnText
            weight="bold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={styles.heroTitle}
          >
            নাম, দেশ, ফুল, ফল
          </BnText>

          <BnText weight="medium" style={styles.heroSubtitle}>
            ছোটবেলার প্রিয় খেলা, এবার মোবাইলে!
          </BnText>

          {/* Compact Game Info Chips */}
          <View style={styles.heroChipsRow}>
            <View style={styles.heroChip}>
              <MaterialCommunityIcons
                name="account-group"
                size={14}
                color="#D1FAE5"
              />
              <BnText weight="semibold" style={styles.heroChipText}>
                ২–৬ খেলোয়াড়
              </BnText>
            </View>

            <View style={styles.heroChip}>
              <MaterialCommunityIcons
                name="shape-outline"
                size={14}
                color="#D1FAE5"
              />
              <BnText weight="semibold" style={styles.heroChipText}>
                ১০টি বিভাগ
              </BnText>
            </View>

            {matchCount > 0 ? (
              <View style={[styles.heroChip, styles.heroChipGold]}>
                <MaterialCommunityIcons
                  name="trophy"
                  size={13}
                  color="#FEF3C7"
                />
                <BnText weight="semibold" style={styles.heroChipGoldText}>
                  {toBengaliDigits(matchCount)}টি ম্যাচ
                </BnText>
              </View>
            ) : null}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {/* Primary Play CTA */}
          <TouchableOpacity
            onPress={() => navigateWithHaptic("/setup")}
            activeOpacity={0.86}
            accessibilityRole="button"
            accessibilityLabel="নতুন খেলা শুরু করুন"
            style={styles.primaryCta}
          >
            <View style={styles.primaryCtaIconBox}>
              <MaterialCommunityIcons
                name="play"
                size={26}
                color={AppColors.marigold}
              />
            </View>
            <View style={styles.ctaTextWrap}>
              <BnText weight="bold" style={styles.primaryCtaTitle}>
                নতুন খেলা শুরু করুন
              </BnText>
              <BnText weight="medium" style={styles.primaryCtaSub}>
                বন্ধু ও পরিবারের সাথে এখনই খেলুন
              </BnText>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Secondary Action Cards */}
          <TouchableOpacity
            onPress={() => navigateWithHaptic("/rules")}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel="খেলার নিয়ম"
            style={styles.menuCard}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: AppColors.indigoSoft },
              ]}
            >
              <MaterialCommunityIcons
                name="book-open-variant"
                size={22}
                color={AppColors.indigo}
              />
            </View>
            <View style={styles.menuTextWrap}>
              <BnText weight="bold" style={styles.menuTitle}>
                খেলার নিয়ম
              </BnText>
              <BnText style={styles.menuSubtitle}>
                বর্ণ নির্বাচন, টাইমার ও পয়েন্টের নিয়ম জানুন
              </BnText>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={AppColors.slateLight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigateWithHaptic("/history")}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel="পূর্বের খেলার ফলাফল"
            style={styles.menuCard}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: AppColors.amberSoft },
              ]}
            >
              <MaterialCommunityIcons
                name="trophy-outline"
                size={22}
                color={AppColors.amber}
              />
            </View>
            <View style={styles.menuTextWrap}>
              <BnText weight="bold" style={styles.menuTitle}>
                পূর্বের খেলার ফলাফল
              </BnText>
              <BnText style={styles.menuSubtitle}>
                {matchCount > 0
                  ? `সংরক্ষিত ${toBengaliDigits(matchCount)}টি খেলার ফলাফল ও বিজয়ী দেখুন`
                  : "আগের ম্যাচ ও স্কোরবোর্ডের ইতিহাস দেখুন"}
              </BnText>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={AppColors.slateLight}
            />
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View style={styles.footer}>
          <MaterialCommunityIcons
            name="wifi-off"
            size={14}
            color={AppColors.slateLight}
          />
          <BnText style={styles.footerText}>
            সম্পূর্ণ অফলাইন • ইন্টারনেট ছাড়াই খেলুন
          </BnText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.ivory,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 18,
  },
  topPillRow: {
    alignItems: "center",
  },
  topPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: AppColors.amberSoft,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.25)",
  },
  topPillText: {
    fontSize: 12.5,
    lineHeight: 21,
    color: AppColors.amber,
  },
  heroCard: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: AppColors.emerald,
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    overflow: "hidden",
    elevation: 6,
    shadowColor: AppColors.emeraldDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  decorCircleTopRight: {
    position: "absolute",
    top: -36,
    right: -36,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255, 255, 255, 0.09)",
  },
  decorCircleBottomLeft: {
    position: "absolute",
    bottom: -44,
    left: -30,
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
  },
  motifRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginBottom: 16,
  },
  motifItem: {
    minWidth: 52,
    alignItems: "center",
    gap: 4,
  },
  motifCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.85)",
  },
  motifLabel: {
    fontSize: 12,
    lineHeight: 20,
    color: "#ECFDF5",
    textAlign: "center",
  },
  heroTitle: {
    width: "100%",
    fontSize: 30,
    lineHeight: 50,
    color: "#FFFFFF",
    textAlign: "center",
  },
  heroSubtitle: {
    width: "100%",
    fontSize: 15.5,
    lineHeight: 26,
    color: "#D1FAE5",
    textAlign: "center",
    marginTop: 2,
  },
  heroChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  heroChipText: {
    fontSize: 12,
    lineHeight: 20,
    color: "#ECFDF5",
  },
  heroChipGold: {
    backgroundColor: "rgba(234, 179, 8, 0.22)",
    borderColor: "rgba(254, 243, 199, 0.35)",
  },
  heroChipGoldText: {
    fontSize: 12,
    lineHeight: 20,
    color: "#FEF3C7",
  },
  actionsSection: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    gap: 12,
  },
  primaryCta: {
    width: "100%",
    backgroundColor: AppColors.marigold,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    elevation: 5,
    shadowColor: "#C2410C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
  },
  primaryCtaIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTextWrap: {
    flex: 1,
  },
  primaryCtaTitle: {
    width: "100%",
    fontSize: 17.5,
    lineHeight: 29,
    color: "#FFFFFF",
  },
  primaryCtaSub: {
    width: "100%",
    fontSize: 12.5,
    lineHeight: 21,
    color: "#FFEDD5",
  },
  menuCard: {
    width: "100%",
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: AppColors.parchment,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    elevation: 1,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    width: "100%",
    fontSize: 16,
    lineHeight: 26,
    color: AppColors.ink,
  },
  menuSubtitle: {
    width: "100%",
    fontSize: 12.5,
    lineHeight: 21,
    color: AppColors.slateMuted,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 2,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 20,
    color: AppColors.slateLight,
  },
});
