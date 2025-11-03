# Generate Signed Android App Bundle (AAB) for Play Store

## ⚠️ IMPORTANT: One-Time Setup Required

Before generating the AAB, you need to create an upload keystore. This is a **critical** file that you must keep safe forever!

---

## Step 1: Generate Upload Keystore (First Time Only)

Run this command in your terminal:

```bash
cd ~/AVM/product/AVM-code/frontend/mobile-app/android/app

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore sparky-upload-key.keystore \
  -alias sparky-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**You will be prompted for:**

1. **Enter keystore password**: Choose a strong password (e.g., `Sparky@2025Secure!`)
2. **Re-enter password**: Same password again
3. **First and Last name**: SparkEd (or your name)
4. **Organizational unit**: Development
5. **Organization**: SparkEd
6. **City**: Your City
7. **State**: Your State (e.g., Karnataka)
8. **Country code**: IN
9. **Is the information correct?**: Type `yes`

### 🔐 CRITICAL: Save Your Passwords!

Create a file to save your keystore details (DO NOT commit this to Git!):

```bash
# Create password file (will be ignored by Git)
cat > ~/AVM/product/AVM-code/frontend/mobile-app/android/keystore-info.txt <<EOF
SPARKY KEYSTORE INFORMATION
===========================

⚠️ KEEP THIS FILE SAFE! NEVER SHARE OR COMMIT TO GIT!

Keystore File: android/app/sparky-upload-key.keystore
Keystore Password: [WRITE YOUR PASSWORD HERE]
Key Alias: sparky-key-alias
Key Password: [SAME AS KEYSTORE PASSWORD]

Created: $(date)

BACKUP LOCATIONS:
1. Local: ~/AVM/product/AVM-code/frontend/mobile-app/android/app/
2. Cloud: [Add your backup location]
3. Password Manager: [Add to 1Password/LastPass]

⚠️ IF YOU LOSE THIS KEYSTORE OR PASSWORD, YOU CAN NEVER UPDATE YOUR APP ON PLAY STORE!
EOF

echo ""
echo "✅ Keystore created successfully!"
echo ""
echo "📝 IMPORTANT: Edit this file and add your password:"
echo "   ~/AVM/product/AVM-code/frontend/mobile-app/android/keystore-info.txt"
echo ""
```

### 📦 Backup Your Keystore

```bash
# Create backup directory
mkdir -p ~/AVM/product/backups/keystore

# Copy keystore to backup location
cp ~/AVM/product/AVM-code/frontend/mobile-app/android/app/sparky-upload-key.keystore \
   ~/AVM/product/backups/keystore/sparky-upload-key-backup-$(date +%Y%m%d).keystore

echo "✅ Keystore backed up to: ~/AVM/product/backups/keystore/"
```

---

## Step 2: Configure Gradle for Signed Builds

### 2.1 Update gradle.properties

Add signing configuration (REPLACE `YOUR_PASSWORD_HERE` with your actual password):

```bash
cat >> ~/AVM/product/AVM-code/frontend/mobile-app/android/gradle.properties <<'EOF'

# ===== RELEASE SIGNING CONFIGURATION =====
# ⚠️ NEVER COMMIT THIS FILE WITH REAL PASSWORDS!
SPARKY_UPLOAD_STORE_FILE=sparky-upload-key.keystore
SPARKY_UPLOAD_KEY_ALIAS=sparky-key-alias
SPARKY_UPLOAD_STORE_PASSWORD=YOUR_PASSWORD_HERE
SPARKY_UPLOAD_KEY_PASSWORD=YOUR_PASSWORD_HERE
EOF

echo ""
echo "⚠️  IMPORTANT: Edit gradle.properties and replace YOUR_PASSWORD_HERE with your actual password!"
echo ""
```

**MANUAL STEP REQUIRED:**
1. Open file: `android/gradle.properties`
2. Find the last 4 lines you just added
3. Replace `YOUR_PASSWORD_HERE` with your actual keystore password
4. Save the file

### 2.2 Update .gitignore (Security)

```bash
# Ensure gradle.properties is in .gitignore
cat >> ~/AVM/product/AVM-code/frontend/mobile-app/.gitignore <<'EOF'

# Keystore files - NEVER COMMIT THESE!
*.keystore
!debug.keystore
android/keystore-info.txt
android/gradle.properties
EOF

echo "✅ Security: gradle.properties added to .gitignore"
```

### 2.3 Update build.gradle

This script will update your build.gradle to use the upload keystore for release builds:

```bash
cd ~/AVM/product/AVM-code/frontend/mobile-app/android/app

# Backup current build.gradle
cp build.gradle build.gradle.backup

cat > build.gradle.signing-config <<'GRADLE_CONFIG'
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('SPARKY_UPLOAD_STORE_FILE')) {
                storeFile file(SPARKY_UPLOAD_STORE_FILE)
                storePassword SPARKY_UPLOAD_STORE_PASSWORD
                keyAlias SPARKY_UPLOAD_KEY_ALIAS
                keyPassword SPARKY_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            def enableShrinkResources = findProperty('android.enableShrinkResourcesInReleaseBuilds') ?: 'false'
            shrinkResources enableShrinkResources.toBoolean()
            minifyEnabled enableMinifyInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            def enablePngCrunchInRelease = findProperty('android.enablePngCrunchInReleaseBuilds') ?: 'true'
            crunchPngs enablePngCrunchInRelease.toBoolean()
        }
    }
GRADLE_CONFIG

echo "✅ Signing configuration created in build.gradle.signing-config"
echo ""
echo "⚠️  MANUAL STEP: You need to replace the signingConfigs and buildTypes blocks in build.gradle"
echo "   File: ~/AVM/product/AVM-code/frontend/mobile-app/android/app/build.gradle"
echo "   Lines: 100-123 (approximately)"
echo ""
echo "   Reference file: build.gradle.signing-config (shows what to replace)"
echo ""
```

---

## Step 3: Update App Version

Make sure your app.json has the correct version:

```bash
cd ~/AVM/product/AVM-code/frontend/mobile-app

# Check current version
cat app.json | grep -A 5 '"version"'

# If needed, update version to 1.0.6
# (Should already be correct based on your v1.0.6 APK)
```

Expected output:
```json
"version": "1.0.6",
"android": {
  "versionCode": 6,
  ...
}
```

---

## Step 4: Build Signed AAB

Now you're ready to build the App Bundle!

```bash
cd ~/AVM/product/AVM-code/frontend/mobile-app

# Clean previous builds
cd android && ./gradlew clean && cd ..

# Build App Bundle (AAB)
cd android && ./gradlew bundleRelease && cd ..
```

**Build process takes 3-5 minutes**. You'll see output like:
```
> Task :app:bundleReleaseJsAndAssets
...
> Task :app:bundleRelease

BUILD SUCCESSFUL in 4m 23s
```

### Output Location

```bash
# AAB file location
ls -lh android/app/build/outputs/bundle/release/

# Expected: app-release.aab (30-50 MB)
```

### Rename and Copy AAB

```bash
# Copy to easy location with descriptive name
cp android/app/build/outputs/bundle/release/app-release.aab \
   ~/AVM/product/AVM-code/Sparky-v1.0.6-release.aab

echo ""
echo "✅ SUCCESS! App Bundle created:"
echo "   ~/AVM/product/AVM-code/Sparky-v1.0.6-release.aab"
echo ""
echo "File size:"
ls -lh ~/AVM/product/AVM-code/Sparky-v1.0.6-release.aab
```

---

## Step 5: Verify AAB (Optional but Recommended)

Install bundletool to test your AAB locally:

```bash
# Download bundletool
cd ~/Downloads
curl -L -o bundletool.jar https://github.com/google/bundletool/releases/latest/download/bundletool-all.jar

# Generate APKs from AAB (for testing)
java -jar bundletool.jar build-apks \
  --bundle=~/AVM/product/AVM-code/Sparky-v1.0.6-release.aab \
  --output=~/AVM/product/AVM-code/Sparky-v1.0.6-test.apks \
  --mode=universal

# Extract universal APK
unzip -p ~/AVM/product/AVM-code/Sparky-v1.0.6-test.apks universal.apk \
  > ~/AVM/product/AVM-code/Sparky-v1.0.6-from-aab.apk

echo "✅ Test APK generated from AAB"

# Install on device to test
adb install ~/AVM/product/AVM-code/Sparky-v1.0.6-from-aab.apk

echo "✅ Test installation complete - verify app works correctly"
```

---

## ✅ Checklist

Before uploading to Play Store, verify:

- [ ] Keystore created (`sparky-upload-key.keystore` exists)
- [ ] Keystore password saved securely
- [ ] Keystore backed up to safe location
- [ ] gradle.properties updated with passwords
- [ ] gradle.properties added to .gitignore
- [ ] build.gradle updated with release signing config
- [ ] App version is 1.0.6 (versionCode: 6)
- [ ] AAB built successfully (`Sparky-v1.0.6-release.aab`)
- [ ] AAB file size is 30-50 MB
- [ ] (Optional) Tested AAB by installing generated APK

---

## 🚨 Troubleshooting

### Error: "Keystore file does not exist"
**Solution**: Check file path in gradle.properties. Should be `sparky-upload-key.keystore` (relative path from android/app/)

### Error: "Keystore password incorrect"
**Solution**: Double-check password in gradle.properties matches the one you set during keytool generation

### Error: "BUILD FAILED"
**Solution**: Run `cd android && ./gradlew clean && cd ..` then try again

### Error: "Cannot find module '@expo/cli'"
**Solution**: Run `npm install` in mobile-app directory

### AAB file too large (>100 MB)
**Solution**: This is normal for React Native apps. Play Store accepts up to 150 MB.

---

## 📤 Next Steps

Once AAB is generated:

1. **Create Play Store Developer Account** ($25 one-time fee)
   - https://play.google.com/console/signup

2. **Upload AAB to Play Console**
   - Go to Play Console → Create App
   - Production → Create Release
   - Upload `Sparky-v1.0.6-release.aab`

3. **Complete Store Listing**
   - See `PLAY_STORE_PUBLISHING_GUIDE.md` for detailed instructions

---

**🎉 You're now ready to publish to Google Play Store!**

*Created: November 3, 2025*
*Status: Ready for execution*
