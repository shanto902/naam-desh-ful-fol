#!/usr/bin/env bash
set -e

APP_NAME="Naam Desh Ful Fol"
APK_FILENAME="NaamDeshFulFol-release.apk"
AAB_FILENAME="NaamDeshFulFol-release.aab"
OUTPUT_DIR="build-output"

# Automatically detect Android SDK location
if [ -z "$ANDROID_HOME" ]; then
  if [ -f "android/local.properties" ]; then
    SDK_DIR=$(grep -E '^sdk\.dir=' android/local.properties | cut -d'=' -f2 | tr -d '\r')
    if [ -n "$SDK_DIR" ]; then
      export ANDROID_HOME="$SDK_DIR"
    fi
  fi
fi

if [ -z "$ANDROID_HOME" ]; then
  if [ -d "$HOME/Android/Sdk" ]; then
    export ANDROID_HOME="$HOME/Android/Sdk"
  elif [ -d "/home/$USER/Android/Sdk" ]; then
    export ANDROID_HOME="/home/$USER/Android/Sdk"
  fi
fi

if [ -n "$ANDROID_HOME" ]; then
  export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
fi

# Prevent EAS Doctor from blocking builds
export EAS_BUILD_DISABLE_EXPO_DOCTOR_STEP=1

# Ensure local builds include tablet/emulator x86_64 ABIs even if ~/.gradle/gradle.properties restricts ABIs
export ORG_GRADLE_PROJECT_reactNativeArchitectures="armeabi-v7a,arm64-v8a,x86,x86_64"

# Redirect temporary folder to persistent user disk (prevents 'Disk quota exceeded' on /tmp tmpfs)
export TMPDIR="${HOME}/.eas-tmp"
mkdir -p "$TMPDIR" 2>/dev/null || true

# Stop stale Gradle daemons that might hold file locks or corrupted caches
(cd android 2>/dev/null && ./gradlew --stop 2>/dev/null || true)

echo "============================================="
echo "    $APP_NAME - Android Builder"
echo "============================================="
echo "Android SDK: ${ANDROID_HOME:-Not Found}"
echo "Output Dir:  $OUTPUT_DIR"
echo "Temp Dir:    $TMPDIR"
echo ""

CHOICE=$1

if [ -z "$CHOICE" ]; then
  echo "Select build type:"
  echo "  1) Play Store Bundle (.aab) - Local (EAS)"
  echo "  2) Test APK (.apk) - Local (EAS)"
  echo "  3) Test APK (.apk) - Direct Gradle (Fastest & Low Disk)"
  echo "  4) Play Store Bundle (.aab) - EAS Cloud"
  echo "  5) Exit"
  echo ""
  read -p "Enter choice [1-5]: " CHOICE
fi

case "$CHOICE" in
  1|aab|production)
    echo ""
    echo "▶ Building Play Store Bundle (.aab) locally via EAS..."
    mkdir -p "$OUTPUT_DIR"
    eas build --platform android --profile production --local --output="${OUTPUT_DIR}/${AAB_FILENAME}"
    echo "AAB Location: ${OUTPUT_DIR}/${AAB_FILENAME}"
    ;;
  2|apk|preview)
    echo ""
    echo "▶ Building Installable APK (.apk) locally via EAS..."
    mkdir -p "$OUTPUT_DIR"
    eas build --platform android --profile preview --local --output="${OUTPUT_DIR}/${APK_FILENAME}"
    echo "APK Location: ${OUTPUT_DIR}/${APK_FILENAME}"
    ;;
  3|gradle|direct)
    echo ""
    echo "▶ Building Installable APK directly with Gradle..."
    CLEAN_PREBUILD=false
    if [ "$2" = "--clean" ]; then
      CLEAN_PREBUILD=true
    fi

    NEEDS_PREBUILD=false
    if [ ! -d "android" ] || [ ! -f "android/.prebuild-stamp" ] || [ "$CLEAN_PREBUILD" = true ]; then
      NEEDS_PREBUILD=true
    elif [ "app.json" -nt "android/.prebuild-stamp" ] || [ "package.json" -nt "android/.prebuild-stamp" ]; then
      NEEDS_PREBUILD=true
    elif [ -d "assets" ] && [ -n "$(find assets -type f -newer android/.prebuild-stamp 2>/dev/null)" ]; then
      NEEDS_PREBUILD=true
    fi

    if [ "$NEEDS_PREBUILD" = true ]; then
      echo "▶ Syncing native Android config & assets (clearing image cache)..."
      rm -rf .expo/web/cache/production/images
      if [ ! -d "android" ] || [ "$CLEAN_PREBUILD" = true ]; then
        EXPO_NO_TELEMETRY=1 pnpm exec expo prebuild --platform android --no-install
      else
        EXPO_NO_TELEMETRY=1 pnpm exec expo prebuild --platform android --no-clean --no-install
        rm -rf android/app/build/intermediates/merged_res* android/app/build/intermediates/packaged_res* android/app/build/intermediates/linked_resources_binary_format android/app/build/intermediates/optimized_processed_res android/app/build/intermediates/merged_manifest* android/app/build/intermediates/packaged_manifests android/app/build/intermediates/incremental/*Resources* 2>/dev/null || true
      fi
      touch android/.prebuild-stamp
    fi
    (
      cd android
      chmod +x gradlew
      ./gradlew assembleRelease --no-daemon -PreactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
    )
    mkdir -p "$OUTPUT_DIR"
    rm -f "${OUTPUT_DIR}/AmarKhoroch-release.apk"
    APK_SRC="android/app/build/outputs/apk/release/app-release.apk"
    META_SRC="android/app/build/outputs/apk/release/output-metadata.json"
    if [ -f "$APK_SRC" ]; then
      cp "$APK_SRC" "${OUTPUT_DIR}/${APK_FILENAME}"
      if [ -f "$META_SRC" ]; then
        cp "$META_SRC" "${OUTPUT_DIR}/output-metadata.json"
      fi
      echo ""
      echo "============================================="
      echo "   BUILD SUCCESSFUL!"
      echo "============================================="
      echo "APK Location: ${OUTPUT_DIR}/${APK_FILENAME}"
      echo "File Size:    $(du -h "${OUTPUT_DIR}/${APK_FILENAME}" | cut -f1)"
      echo "Install via USB: adb install -r ${OUTPUT_DIR}/${APK_FILENAME}"
    fi
    ;;
  4|cloud)
    echo ""
    echo "▶ Building on EAS Cloud..."
    eas build --platform android --profile production
    ;;
  5|q|exit)
    echo "Build canceled."
    exit 0
    ;;
  *)
    echo "Invalid option. Use: 1 (EAS AAB), 2 (EAS APK), 3 (Direct Gradle APK), or 4 (Cloud)"
    exit 1
    ;;
esac
