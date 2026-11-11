import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../components/AppHeader';
import { BnText } from '../components/BnText';
import { PrimaryButton } from '../components/PrimaryButton';
import { AppColors } from '../constants/theme';

interface RuleCardProps {
  step: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accentBg: string;
  accentColor: string;
  bullets: string[];
}

function RuleSectionCard({
  step,
  title,
  icon,
  accentBg,
  accentColor,
  bullets,
}: RuleCardProps) {
  return (
    <View className="bg-surface rounded-3xl p-4 border border-parchment mb-3.5">
      <View className="flex-row items-center gap-3 mb-2.5">
        <View
          style={{ backgroundColor: accentBg }}
          className="w-10 h-10 rounded-2xl items-center justify-center"
        >
          <MaterialCommunityIcons name={icon} size={22} color={accentColor} />
        </View>
        <View className="flex-1">
          <BnText weight="semibold" className="text-xs text-slateMuted">
            নিয়ম {step}
          </BnText>
          <BnText weight="bold" className="text-base text-ink">
            {title}
          </BnText>
        </View>
      </View>
      <View className="gap-1.5 pl-1">
        {bullets.map((line, index) => (
          <View key={index} className="flex-row items-start gap-2">
            <BnText weight="bold" className="text-sm text-emeraldBrand mt-0.5">
              •
            </BnText>
            <BnText className="text-sm text-ink/90 leading-6 flex-1">
              {line}
            </BnText>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function RulesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <AppHeader
        title="খেলার নিয়ম"
        subtitle="নাম, দেশ, ফুল, ফল খেলার সম্পূর্ণ নির্দেশিকা"
      />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <RuleSectionCard
          step="১"
          title="খেলার পদ্ধতি"
          icon="account-group-outline"
          accentBg={AppColors.indigoSoft}
          accentColor={AppColors.indigo}
          bullets={[
            'সর্বনিম্ন ২ জন থেকে সর্বোচ্চ ৬ জন খেলোয়াড় একসাথে একটি ফোনেই খেলতে পারবেন।',
            'খেলার শুরুতে খেলোয়াড়দের নাম, পছন্দের বিভাগসমূহ (যেমন: দেশের নাম, ফুলের নাম, ফলের নাম), সময়সীমা ও রাউন্ড সংখ্যা নির্ধারণ করুন।',
            'প্রতি রাউন্ডে সবাই পালাক্রমে ফোন হাতে নিয়ে একই নির্ধারিত বাংলা বর্ণ দিয়ে উত্তর লিখবেন।',
            'একজনের উত্তর জমা দেওয়ার পর পরবর্তী খেলোয়াড়ের পালা শুরু হবে, যাতে কেউ অন্যের উত্তর দেখে না ফেলেন।',
          ]}
        />

        <RuleSectionCard
          step="২"
          title="বর্ণ নির্বাচন"
          icon="alphabetical-variant"
          accentBg={AppColors.emeraldSoft}
          accentColor={AppColors.emerald}
          bullets={[
            'র‍্যান্ডম বর্ণ মোডে খেলা নিজে থেকেই কার্যকর বাংলা বর্ণমালা থেকে একটি বর্ণ বেছে নেবে।',
            'যেসব বর্ণ দিয়ে প্রচলিত শব্দ পাওয়া কঠিন (যেমন: ঙ, ঞ, ণ, ড়, ঢ়), সেগুলো ডিফল্টভাবে বাদ রাখা হয়েছে।',
            'আপনি চাইলে সেটআপ থেকে "বর্ণ কাস্টমাইজ করুন" অপশনে গিয়ে নিজের পছন্দমতো বর্ণ চালু বা বন্ধ করতে পারবেন।',
            'এছাড়া "নিজে বর্ণ নির্বাচন করুন" মোডে খেলোয়াড়রা নিজেরাই রাউন্ডের বর্ণ বেছে নিতে পারবেন।',
          ]}
        />

        <RuleSectionCard
          step="৩"
          title="সময়সীমা ও টাইমার"
          icon="timer-sand"
          accentBg={AppColors.marigoldSoft}
          accentColor={AppColors.marigold}
          bullets={[
            'প্রতি রাউন্ডের জন্য ৩০, ৪৫, ৬০, ৯০ অথবা ১২০ সেকেন্ড সময় নির্বাচন করা যায়।',
            'খেলোয়াড় "আমার পালা শুরু করুন" বাটনে চাপ দেওয়ার সাথে সাথেই টাইমার চালু হয়।',
            'নির্ধারিত সময় শেষ হয়ে গেলে সাথে সাথেই সব ইনপুট বক্স লক হয়ে যাবে এবং আপনার লেখা উত্তরগুলো সুরক্ষিত থাকবে।',
            'সময় শেষ হওয়ার আগেই চাইলে "জমা দিন" বাটনে চাপ দিয়ে (নিশ্চিত করে) উত্তর জমা দেওয়া যাবে।',
          ]}
        />

        {/* Scoring Visual Card */}
        <View className="bg-surface rounded-3xl p-4 border border-parchment mb-3.5">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 rounded-2xl bg-amberSoft items-center justify-center">
              <MaterialCommunityIcons
                name="star-circle-outline"
                size={22}
                color={AppColors.amber}
              />
            </View>
            <View className="flex-1">
              <BnText weight="semibold" className="text-xs text-slateMuted">
                নিয়ম ৪
              </BnText>
              <BnText weight="bold" className="text-base text-ink">
                পয়েন্ট হিসাবের নিয়ম
              </BnText>
            </View>
          </View>

          <View className="gap-2.5">
            <View className="flex-row items-center justify-between p-3 rounded-2xl bg-emeraldSoft border border-emeraldBrand/25">
              <View className="flex-1 pr-2">
                <BnText weight="bold" className="text-sm text-emeraldDark">
                  সঠিক ও অনন্য উত্তর
                </BnText>
                <BnText className="text-xs text-slateMuted">
                  অন্য কোনো খেলোয়াড়ের সাথে না মিললে
                </BnText>
              </View>
              <View className="px-3 py-1 rounded-full bg-emeraldBrand">
                <BnText weight="bold" className="text-sm text-white">
                  ১০ পয়েন্ট
                </BnText>
              </View>
            </View>

            <View className="flex-row items-center justify-between p-3 rounded-2xl bg-amberSoft border border-amber/25">
              <View className="flex-1 pr-2">
                <BnText weight="bold" className="text-sm text-amberWarm">
                  সঠিক কিন্তু মিলে যাওয়া উত্তর
                </BnText>
                <BnText className="text-xs text-slateMuted">
                  একাধিক খেলোয়াড়ের সঠিক উত্তর একই হলে
                </BnText>
              </View>
              <View className="px-3 py-1 rounded-full bg-amber">
                <BnText weight="bold" className="text-sm text-white">
                  ৫ পয়েন্ট
                </BnText>
              </View>
            </View>

            <View className="flex-row items-center justify-between p-3 rounded-2xl bg-crimsonSoft border border-crimson/20">
              <View className="flex-1 pr-2">
                <BnText weight="bold" className="text-sm text-crimson">
                  ভুল বা খালি উত্তর
                </BnText>
                <BnText className="text-xs text-slateMuted">
                  উত্তর না লিখলে অথবা ভুল হিসেবে চিহ্নিত হলে
                </BnText>
              </View>
              <View className="px-3 py-1 rounded-full bg-crimson">
                <BnText weight="bold" className="text-sm text-white">
                  ০ পয়েন্ট
                </BnText>
              </View>
            </View>
          </View>
        </View>

        <RuleSectionCard
          step="৫"
          title="উত্তর যাচাই ও ফলাফল"
          icon="check-decagram-outline"
          accentBg={AppColors.emeraldSoft}
          accentColor={AppColors.emerald}
          bullets={[
            'রাউন্ডের সব খেলোয়াড় উত্তর জমা দেওয়ার পর বিভাগ অনুযায়ী সবার উত্তর একসাথে দেখানো হবে।',
            'খেলোয়াড়রা আলোচনা করে প্রতিটি উত্তরকে ম্যানুয়ালি "সঠিক" বা "ভুল" হিসেবে চিহ্নিত করবেন।',
            'যাচাই পরিবর্তনের সাথে সাথেই স্বয়ংক্রিয়ভাবে পয়েন্ট (১০, ৫ বা ০) হিসাব হয়ে যাবে।',
            'সব রাউন্ড শেষে সর্বোচ্চ পয়েন্ট অর্জনকারী খেলোয়াড় বিজয়ী হবেন এবং ফলাফল অফলাইনে সংরক্ষিত থাকবে।',
          ]}
        />

        <View className="mt-2">
          <PrimaryButton
            label="এখনই খেলা শুরু করুন"
            iconName="play-circle"
            onPress={() => router.replace('/setup')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
