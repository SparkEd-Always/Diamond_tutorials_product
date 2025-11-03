#!/bin/bash

# ====================================
# Sparky AAB Generation Script
# ====================================
# Generates signed Android App Bundle for Play Store
# Version: 1.0.0

set -e  # Exit on error

echo ""
echo "🚀 Sparky AAB Generation Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if keystore exists
KEYSTORE_PATH="android/app/sparky-upload-key.keystore"

if [ ! -f "$KEYSTORE_PATH" ]; then
    echo -e "${RED}❌ ERROR: Keystore not found!${NC}"
    echo ""
    echo "You need to create an upload keystore first."
    echo "Run this command:"
    echo ""
    echo "cd android/app && keytool -genkeypair -v \\"
    echo "  -storetype PKCS12 \\"
    echo "  -keystore sparky-upload-key.keystore \\"
    echo "  -alias sparky-key-alias \\"
    echo "  -keyalg RSA \\"
    echo "  -keysize 2048 \\"
    echo "  -validity 10000"
    echo ""
    echo "Then follow the instructions in GENERATE_AAB_INSTRUCTIONS.md"
    exit 1
fi

# Check if gradle.properties is configured
GRADLE_PROPS="android/gradle.properties"
if ! grep -q "SPARKY_UPLOAD_STORE_FILE" "$GRADLE_PROPS"; then
    echo -e "${RED}❌ ERROR: gradle.properties not configured!${NC}"
    echo ""
    echo "Add these lines to $GRADLE_PROPS:"
    echo ""
    echo "SPARKY_UPLOAD_STORE_FILE=sparky-upload-key.keystore"
    echo "SPARKY_UPLOAD_KEY_ALIAS=sparky-key-alias"
    echo "SPARKY_UPLOAD_STORE_PASSWORD=your_password_here"
    echo "SPARKY_UPLOAD_KEY_PASSWORD=your_password_here"
    echo ""
    exit 1
fi

# Check if passwords are set (not default)
if grep -q "YOUR_PASSWORD_HERE" "$GRADLE_PROPS"; then
    echo -e "${RED}❌ ERROR: Passwords not configured in gradle.properties!${NC}"
    echo ""
    echo "Edit $GRADLE_PROPS and replace YOUR_PASSWORD_HERE with your actual keystore password"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Keystore found${NC}"
echo -e "${GREEN}✅ Gradle properties configured${NC}"
echo ""

# Check app version
APP_VERSION=$(grep '"version"' app.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
VERSION_CODE=$(grep '"versionCode"' app.json | head -1 | sed 's/.*"versionCode": \(.*\).*/\1/')

echo "📦 Building AAB for:"
echo "   App: Sparky"
echo "   Version: $APP_VERSION"
echo "   Version Code: $VERSION_CODE"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean > /dev/null 2>&1
cd ..
echo -e "${GREEN}✅ Clean complete${NC}"

echo ""
echo "🔨 Building App Bundle (this may take 3-5 minutes)..."
echo ""

cd android
./gradlew bundleRelease
cd ..

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""

# Check if AAB was generated
AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"
if [ ! -f "$AAB_PATH" ]; then
    echo -e "${RED}❌ ERROR: AAB file not found at $AAB_PATH${NC}"
    exit 1
fi

# Get AAB size
AAB_SIZE=$(ls -lh "$AAB_PATH" | awk '{print $5}')

echo "📦 App Bundle Information:"
echo "   Location: $AAB_PATH"
echo "   Size: $AAB_SIZE"
echo ""

# Copy to easy-to-find location
OUTPUT_DIR="../../.."
OUTPUT_FILE="$OUTPUT_DIR/Sparky-v${APP_VERSION}-playstore.aab"

cp "$AAB_PATH" "$OUTPUT_FILE"

echo -e "${GREEN}✅ AAB copied to:${NC}"
echo "   $OUTPUT_FILE"
echo ""

# Show final instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 SUCCESS! Your App Bundle is ready for Play Store!"
echo ""
echo "📤 Next Steps:"
echo ""
echo "1. Go to Google Play Console:"
echo "   https://play.google.com/console"
echo ""
echo "2. Create new app or open existing app"
echo ""
echo "3. Go to Production → Create Release"
echo ""
echo "4. Upload this file:"
echo "   $(basename $OUTPUT_FILE)"
echo ""
echo "5. Complete store listing and submit for review"
echo ""
echo "📖 Full instructions: PLAY_STORE_PUBLISHING_GUIDE.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
