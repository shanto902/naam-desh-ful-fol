import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "../components/AppHeader";
import { BnText } from "../components/BnText";
import { LetterConfigModal } from "../components/LetterConfigModal";
import { ManualLetterPickerModal } from "../components/ManualLetterPickerModal";
import { PrimaryButton } from "../components/PrimaryButton";
import {
  ALL_CATEGORY_IDS,
  CLASSIC_FOUR_CATEGORY_IDS,
  DEFAULT_CATEGORIES,
} from "../constants/categories";
import {
  AppColors,
  AppFonts,
  MAX_PLAYERS,
  MIN_CATEGORIES,
  MIN_PLAYERS,
  ROUND_COUNTS,
  ROUND_DURATIONS,
} from "../constants/theme";
import { useGame } from "../context/GameContext";
import { normalizeBengaliAnswer } from "../engine/bengaliText";
import {
  DEFAULT_SETUP_PREFS,
  loadSetupPreferences,
  saveSetupPreferences,
} from "../storage/gameStorage";
import { CategoryId, LetterMode, Player, RoundDuration } from "../types/game";
import { toBengaliDigits } from "../utils/bengali";

interface DraftPlayer {
  id: string;
  name: string;
}

function makePlayer(index: number, name?: string): DraftPlayer {
  return {
    id: `p_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 6)}`,
    name: name ?? `খেলোয়াড় ${toBengaliDigits(index + 1)}`,
  };
}

export default function SetupScreen() {
  const router = useRouter();
  const { availableLetters, updateAvailableLetters, startMatch } = useGame();

  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [players, setPlayers] = useState<DraftPlayer[]>(() =>
    DEFAULT_SETUP_PREFS.playerNames.map((n, idx) => makePlayer(idx, n)),
  );
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>(
    DEFAULT_SETUP_PREFS.categoryIds,
  );
  const [roundDuration, setRoundDuration] = useState<RoundDuration>(
    DEFAULT_SETUP_PREFS.roundDuration,
  );
  const [totalRounds, setTotalRounds] = useState<number>(
    DEFAULT_SETUP_PREFS.totalRounds,
  );
  const [letterMode, setLetterMode] = useState<LetterMode>(
    DEFAULT_SETUP_PREFS.letterMode,
  );
  const [manualLetter, setManualLetter] = useState<string>("ক");

  const [letterConfigOpen, setLetterConfigOpen] = useState(false);
  const [manualPickerOpen, setManualPickerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    let active = true;
    loadSetupPreferences()
      .then((prefs) => {
        if (!active) return;
        setPlayers(prefs.playerNames.map((name, idx) => makePlayer(idx, name)));
        setSelectedCategories(prefs.categoryIds);
        setRoundDuration(prefs.roundDuration);
        setTotalRounds(prefs.totalRounds);
        setLetterMode(prefs.letterMode);
        setLoadingPrefs(false);
      })
      .catch(() => {
        if (active) setLoadingPrefs(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAddPlayer = () => {
    setErrorMessage(null);
    if (players.length >= MAX_PLAYERS) return;
    setPlayers((prev) => [...prev, makePlayer(prev.length)]);
  };

  const handleRemovePlayer = (id: string) => {
    setErrorMessage(null);
    if (players.length <= MIN_PLAYERS) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleChangePlayerName = (id: string, name: string) => {
    setErrorMessage(null);
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const toggleCategory = (categoryId: CategoryId) => {
    setErrorMessage(null);
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        if (prev.length <= MIN_CATEGORIES) {
          setErrorMessage("কমপক্ষে ১টি বিভাগ নির্বাচন করতে হবে।");
          return prev;
        }
        return prev.filter((id) => id !== categoryId);
      }
      const nextSet = new Set([...prev, categoryId]);
      return ALL_CATEGORY_IDS.filter((id) => nextSet.has(id));
    });
  };

  const handleSelectAllCategories = () => {
    setErrorMessage(null);
    setSelectedCategories([...ALL_CATEGORY_IDS]);
  };

  const handleSelectClassicFour = () => {
    setErrorMessage(null);
    setSelectedCategories([...CLASSIC_FOUR_CATEGORY_IDS]);
  };

  const handleSelectLetterMode = (mode: LetterMode) => {
    setErrorMessage(null);
    setLetterMode(mode);
    if (mode === "manual" && !manualLetter) {
      setManualLetter("ক");
    }
  };

  const handleStartGame = async () => {
    if (isStarting) return;
    setErrorMessage(null);

    const cleanedPlayers: Player[] = players.map((p) => ({
      id: p.id,
      name: p.name.trim(),
    }));

    if (
      cleanedPlayers.length < MIN_PLAYERS ||
      cleanedPlayers.length > MAX_PLAYERS
    ) {
      setErrorMessage("২ থেকে ৬ জন খেলোয়াড় থাকতে হবে।");
      return;
    }

    if (cleanedPlayers.some((p) => p.name.length === 0)) {
      setErrorMessage("দয়া করে সব খেলোয়াড়ের নাম লিখুন।");
      return;
    }

    const seenNames = new Set<string>();
    for (const p of cleanedPlayers) {
      const normalized = normalizeBengaliAnswer(p.name);
      if (seenNames.has(normalized)) {
        setErrorMessage("প্রতিটি খেলোয়াড়ের নাম আলাদা হতে হবে।");
        return;
      }
      seenNames.add(normalized);
    }

    if (selectedCategories.length < MIN_CATEGORIES) {
      setErrorMessage("কমপক্ষে ১টি বিভাগ নির্বাচন করুন।");
      return;
    }

    if (letterMode === "manual" && !manualLetter) {
      setErrorMessage("একটি বাংলা বর্ণ নির্বাচন করুন।");
      return;
    }

    setIsStarting(true);
    try {
      await saveSetupPreferences({
        playerNames: cleanedPlayers.map((p) => p.name),
        categoryIds: selectedCategories,
        roundDuration,
        totalRounds,
        letterMode,
      });

      startMatch({
        players: cleanedPlayers,
        categoryIds: selectedCategories,
        roundDuration,
        letterMode,
        manualLetter: letterMode === "manual" ? manualLetter : null,
        totalRounds,
        availableLetters,
      });

      router.push("/game");
    } finally {
      setIsStarting(false);
    }
  };

  if (loadingPrefs) {
    return (
      <SafeAreaView className="flex-1 bg-ivory">
        <AppHeader title="নতুন খেলা সেটআপ" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={AppColors.emerald} />
          <BnText className="text-sm text-slateMuted mt-3">
            সেটআপ লোড হচ্ছে...
          </BnText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <AppHeader
        title="নতুন খেলা সেটআপ"
        subtitle="খেলোয়াড়, বিভাগ ও সময় নির্ধারণ করুন"
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Players Section */}
          <View className="bg-surface rounded-3xl p-4 border border-parchment mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-xl bg-indigoSoft items-center justify-center">
                  <MaterialCommunityIcons
                    name="account-group"
                    size={18}
                    color={AppColors.indigo}
                  />
                </View>
                <View>
                  <BnText weight="bold" className="text-base text-ink">
                    খেলোয়াড় তালিকা
                  </BnText>
                  <BnText className="text-xs text-slateMuted">
                    সর্বনিম্ন ২ জন, সর্বোচ্চ ৬ জন (
                    {toBengaliDigits(players.length)}/৬)
                  </BnText>
                </View>
              </View>
            </View>

            <View className="gap-2.5">
              {players.map((player, index) => (
                <View
                  key={player.id}
                  className="flex-row items-center gap-2 bg-ivory rounded-2xl px-3 py-2 border border-parchment"
                >
                  <View className="w-7 h-7 rounded-full bg-emeraldSoft items-center justify-center">
                    <BnText weight="bold" className="text-xs text-emeraldDark">
                      {toBengaliDigits(index + 1)}
                    </BnText>
                  </View>
                  <TextInput
                    value={player.name}
                    onChangeText={(text) =>
                      handleChangePlayerName(player.id, text)
                    }
                    placeholder={`খেলোয়াড় ${toBengaliDigits(index + 1)}-এর নাম`}
                    placeholderTextColor={AppColors.slateLight}
                    maxLength={24}
                    style={{
                      flex: 1,
                      fontFamily: AppFonts.medium,
                      fontSize: 15,
                      color: AppColors.ink,
                      paddingVertical: 6,
                    }}
                  />
                  {players.length > MIN_PLAYERS ? (
                    <Pressable
                      onPress={() => handleRemovePlayer(player.id)}
                      accessibilityRole="button"
                      accessibilityLabel="খেলোয়াড় সরান"
                      className="w-8 h-8 rounded-xl bg-crimsonSoft items-center justify-center active:opacity-75"
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={17}
                        color={AppColors.crimson}
                      />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>

            {players.length < MAX_PLAYERS ? (
              <Pressable
                onPress={handleAddPlayer}
                className="mt-3 py-2.5 px-4 rounded-2xl border border-dashed border-emeraldBrand bg-emeraldSoft/50 flex-row items-center justify-center gap-1.5 active:opacity-80"
              >
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={18}
                  color={AppColors.emeraldDark}
                />
                <BnText weight="semibold" className="text-sm text-emeraldDark">
                  খেলোয়াড় যোগ করুন
                </BnText>
              </Pressable>
            ) : null}
          </View>

          {/* Categories Section */}
          <View className="bg-surface rounded-3xl p-4 border border-parchment mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2 flex-1">
                <View className="w-8 h-8 rounded-xl bg-emeraldSoft items-center justify-center">
                  <MaterialCommunityIcons
                    name="shape-outline"
                    size={18}
                    color={AppColors.emerald}
                  />
                </View>
                <View>
                  <BnText weight="bold" className="text-base text-ink">
                    বিভাগ নির্বাচন
                  </BnText>
                  <BnText className="text-xs text-slateMuted">
                    নির্বাচিত: {toBengaliDigits(selectedCategories.length)}টি
                    বিভাগ
                  </BnText>
                </View>
              </View>
            </View>

            <View className="flex-row gap-2 mb-3">
              <Pressable
                onPress={handleSelectAllCategories}
                className="px-3 py-1.5 rounded-xl bg-emeraldSoft border border-emeraldBrand/25 active:opacity-80"
              >
                <BnText weight="semibold" className="text-xs text-emeraldDark">
                  সবগুলো ({toBengaliDigits(DEFAULT_CATEGORIES.length)}টি)
                </BnText>
              </Pressable>
              <Pressable
                onPress={handleSelectClassicFour}
                className="px-3 py-1.5 rounded-xl bg-amberSoft border border-amber/25 active:opacity-80"
              >
                <BnText weight="semibold" className="text-xs text-amberWarm">
                  ক্লাসিক ৪টি
                </BnText>
              </Pressable>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {DEFAULT_CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => toggleCategory(category.id)}
                    style={{ width: "48.5%" }}
                    className={`rounded-2xl p-3 border flex-row items-center justify-between ${
                      isSelected
                        ? "bg-emeraldSoft/80 border-emeraldBrand"
                        : "bg-ivory border-parchment"
                    } active:opacity-80`}
                  >
                    <View className="flex-row items-center gap-2 flex-1 pr-1">
                      <View
                        style={{ backgroundColor: category.bgColor }}
                        className="w-8 h-8 rounded-xl items-center justify-center"
                      >
                        <MaterialCommunityIcons
                          name={
                            category.iconName as keyof typeof MaterialCommunityIcons.glyphMap
                          }
                          size={17}
                          color={category.accentColor}
                        />
                      </View>
                      <BnText
                        weight={isSelected ? "bold" : "medium"}
                        className="text-sm text-ink flex-1"
                        numberOfLines={1}
                      >
                        {category.nameBn}
                      </BnText>
                    </View>
                    <MaterialCommunityIcons
                      name={isSelected ? "check-circle" : "circle-outline"}
                      size={18}
                      color={
                        isSelected ? AppColors.emerald : AppColors.slateLight
                      }
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Timer Duration */}
          <View className="bg-surface rounded-3xl p-4 border border-parchment mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-xl bg-marigoldSoft items-center justify-center">
                <MaterialCommunityIcons
                  name="timer-outline"
                  size={18}
                  color={AppColors.marigold}
                />
              </View>
              <View>
                <BnText weight="bold" className="text-base text-ink">
                  প্রতি রাউন্ডের সময়সীমা
                </BnText>
                <BnText className="text-xs text-slateMuted">
                  প্রতিটি খেলোয়াড়ের উত্তর লেখার সময়
                </BnText>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {ROUND_DURATIONS.map((duration) => {
                const active = roundDuration === duration;
                return (
                  <Pressable
                    key={duration}
                    onPress={() => setRoundDuration(duration)}
                    className={`px-4 py-2.5 rounded-2xl border ${
                      active
                        ? "bg-emeraldBrand border-emeraldDark"
                        : "bg-ivory border-parchment"
                    } active:opacity-80`}
                  >
                    <BnText
                      weight="bold"
                      className={`text-sm ${active ? "text-white" : "text-ink"}`}
                    >
                      {toBengaliDigits(duration)} সেকেন্ড
                    </BnText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Round Count */}
          <View className="bg-surface rounded-3xl p-4 border border-parchment mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-xl bg-amberSoft items-center justify-center">
                <MaterialCommunityIcons
                  name="repeat"
                  size={18}
                  color={AppColors.amber}
                />
              </View>
              <View>
                <BnText weight="bold" className="text-base text-ink">
                  রাউন্ড সংখ্যা
                </BnText>
                <BnText className="text-xs text-slateMuted">
                  এক ম্যাচে কয়টি রাউন্ড খেলা হবে
                </BnText>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {ROUND_COUNTS.map((count) => {
                const active = totalRounds === count;
                return (
                  <Pressable
                    key={count}
                    onPress={() => setTotalRounds(count)}
                    className={`px-4 py-2.5 rounded-2xl border ${
                      active
                        ? "bg-emeraldBrand border-emeraldDark"
                        : "bg-ivory border-parchment"
                    } active:opacity-80`}
                  >
                    <BnText
                      weight="bold"
                      className={`text-sm ${active ? "text-white" : "text-ink"}`}
                    >
                      {toBengaliDigits(count)} রাউন্ড
                    </BnText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Letter Selection Mode */}
          <View className="bg-surface rounded-3xl p-4 border border-parchment mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-xl bg-emeraldSoft items-center justify-center">
                <MaterialCommunityIcons
                  name="alphabetical-variant"
                  size={18}
                  color={AppColors.emerald}
                />
              </View>
              <View>
                <BnText weight="bold" className="text-base text-ink">
                  বর্ণ নির্বাচনের ধরন
                </BnText>
                <BnText className="text-xs text-slateMuted">
                  রাউন্ডের শুরুতে কীভাবে বাংলা বর্ণ ঠিক হবে
                </BnText>
              </View>
            </View>

            <View className="gap-2.5">
              <Pressable
                onPress={() => handleSelectLetterMode("random")}
                className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                  letterMode === "random"
                    ? "bg-emeraldSoft/80 border-emeraldBrand"
                    : "bg-ivory border-parchment"
                }`}
              >
                <View className="flex-row items-center gap-2.5 flex-1">
                  <MaterialCommunityIcons
                    name="dice-multiple-outline"
                    size={22}
                    color={
                      letterMode === "random"
                        ? AppColors.emeraldDark
                        : AppColors.slateMuted
                    }
                  />
                  <View className="flex-1">
                    <BnText weight="bold" className="text-sm text-ink">
                      র‍্যান্ডম বাংলা বর্ণ
                    </BnText>
                    <BnText className="text-xs text-slateMuted">
                      সক্রিয় বর্ণমালা থেকে স্বয়ংক্রিয়ভাবে বর্ণ আসবে
                    </BnText>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name={
                    letterMode === "random"
                      ? "radiobox-marked"
                      : "radiobox-blank"
                  }
                  size={20}
                  color={
                    letterMode === "random"
                      ? AppColors.emerald
                      : AppColors.slateLight
                  }
                />
              </Pressable>

              {letterMode === "random" ? (
                <View className="flex-row items-center justify-between bg-sand/70 rounded-2xl px-3.5 py-2.5 border border-parchment">
                  <BnText weight="medium" className="text-xs text-slateMuted">
                    সক্রিয় বর্ণ: {toBengaliDigits(availableLetters.length)}টি
                  </BnText>
                  <Pressable
                    onPress={() => setLetterConfigOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-surface border border-parchment active:opacity-80"
                  >
                    <BnText weight="bold" className="text-xs text-emeraldDark">
                      বর্ণ কাস্টমাইজ করুন
                    </BnText>
                  </Pressable>
                </View>
              ) : null}

              <Pressable
                onPress={() => handleSelectLetterMode("manual")}
                className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                  letterMode === "manual"
                    ? "bg-emeraldSoft/80 border-emeraldBrand"
                    : "bg-ivory border-parchment"
                }`}
              >
                <View className="flex-row items-center gap-2.5 flex-1">
                  <MaterialCommunityIcons
                    name="hand-pointing-up"
                    size={22}
                    color={
                      letterMode === "manual"
                        ? AppColors.emeraldDark
                        : AppColors.slateMuted
                    }
                  />
                  <View className="flex-1">
                    <BnText weight="bold" className="text-sm text-ink">
                      নিজে বর্ণ নির্বাচন করুন
                    </BnText>
                    <BnText className="text-xs text-slateMuted">
                      পছন্দের নির্দিষ্ট বাংলা বর্ণ বেছে নিয়ে খেলুন
                    </BnText>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name={
                    letterMode === "manual"
                      ? "radiobox-marked"
                      : "radiobox-blank"
                  }
                  size={20}
                  color={
                    letterMode === "manual"
                      ? AppColors.emerald
                      : AppColors.slateLight
                  }
                />
              </Pressable>

              {letterMode === "manual" ? (
                <View className="flex-row items-center justify-between bg-sand/70 rounded-2xl px-3.5 py-2.5 border border-parchment">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-10 h-10 rounded-full bg-emeraldBrand items-center justify-center">
                      <BnText weight="bold" className="text-lg text-white">
                        {manualLetter}
                      </BnText>
                    </View>
                    <BnText weight="medium" className="text-xs text-ink">
                      প্রথম রাউন্ডের বর্ণ: {manualLetter}
                    </BnText>
                  </View>
                  <Pressable
                    onPress={() => setManualPickerOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-surface border border-parchment active:opacity-80"
                  >
                    <BnText weight="bold" className="text-xs text-emeraldDark">
                      বর্ণ পরিবর্তন করুন
                    </BnText>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>

          {errorMessage ? (
            <View className="mb-4 p-3.5 rounded-2xl bg-crimsonSoft border border-crimson/30 flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={20}
                color={AppColors.crimson}
              />
              <BnText weight="semibold" className="text-sm text-crimson flex-1">
                {errorMessage}
              </BnText>
            </View>
          ) : null}

          <PrimaryButton
            label="খেলা শুরু করুন"
            iconName="play"
            variant="primary"
            loading={isStarting}
            onPress={handleStartGame}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <LetterConfigModal
        visible={letterConfigOpen}
        initialLetters={availableLetters}
        onSave={async (letters) => {
          await updateAvailableLetters(letters);
        }}
        onClose={() => setLetterConfigOpen(false)}
      />

      <ManualLetterPickerModal
        visible={manualPickerOpen}
        selectedLetter={manualLetter}
        onSelect={(letter) => {
          setManualLetter(letter);
          setManualPickerOpen(false);
        }}
        onClose={() => setManualPickerOpen(false)}
      />
    </SafeAreaView>
  );
}
