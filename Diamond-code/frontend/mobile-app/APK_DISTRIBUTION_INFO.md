# Sparky Mobile App - APK Distribution Guide

## 📱 APK Build Information

**Version:** 1.0.0
**Build Date:** October 27, 2025
**File Size:** 69 MB
**Platform:** Android (API 24+)
**File Name:** `Sparky-v1.0.0-20251027.apk`

---

## 🌐 Local Network Access

### Your Local Network Details
- **Local IP Address:** `192.168.29.16`
- **Server Port:** `8888`
- **HTTP Server:** Python SimpleHTTPServer (Running)

### Download URLs

**From any device on the same WiFi network, visit:**

#### Option 1: Download Page (Recommended)
```
http://192.168.29.16:8888/download.html
```
This page provides:
- APK download button
- Build information
- Installation instructions
- Clean, professional interface

#### Option 2: Direct APK Download
```
http://192.168.29.16:8888/Sparky-v1.0.0-20251027.apk
```

#### Option 3: File Browser
```
http://192.168.29.16:8888/
```
Browse all files and select the APK

---

## 📲 Installation Instructions

### For Android Devices

1. **Connect to the same WiFi network** as your computer (192.168.29.x network)

2. **Open the download page** on your Android device:
   - Open Chrome/Browser
   - Navigate to: `http://192.168.29.16:8888/download.html`
   - Tap the "Download APK" button

3. **Enable Unknown Sources** (if prompted):
   - Go to: Settings → Security → Unknown Sources
   - Or: Settings → Apps → Special Access → Install Unknown Apps
   - Enable for your browser (Chrome, Firefox, etc.)

4. **Install the APK**:
   - Open the downloaded APK from notifications or Downloads folder
   - Tap "Install"
   - Wait for installation to complete

5. **Launch Sparky**:
   - Find the Sparky app in your app drawer
   - Open and sign in with your credentials

---

## 🚀 Latest Changes in This Build

✅ **Updated SparkEd Logo** - New logo without padding
✅ **Fixed Icon Display** - Removed orange tint from login screen icon
✅ **Improved UI** - Removed blue background from copyright text
✅ **Better UX** - Changed OTP message to simple "OTP sent"

---

## 🛠️ Server Management

### Check Server Status
The HTTP server is currently running in the background.

### Stop the Server
To stop the server when done distributing:
```bash
# Find the server process
lsof -ti:8888 | xargs kill

# Or force kill if needed
lsof -ti:8888 | xargs kill -9
```

### Restart the Server
If you need to restart distribution later:
```bash
cd /Users/koustubskulkarni/AVM/product/AVM-code/frontend/mobile-app
python3 -m http.server 8888
```

---

## 🔒 Security Notes

- This server is **only accessible on your local network** (WiFi)
- Not exposed to the internet
- Stop the server when distribution is complete
- The APK is unsigned (development build)
- Users will need to enable "Install from Unknown Sources"

---

## 📋 APK File Location

**Full Path:**
```
/Users/koustubskulkarni/AVM/product/AVM-code/frontend/mobile-app/Sparky-v1.0.0-20251027.apk
```

**Original Build Output:**
```
/Users/koustubskulkarni/AVM/product/AVM-code/frontend/mobile-app/android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔄 Rebuilding APK

To build a new APK with future changes:

```bash
cd /Users/koustubskulkarni/AVM/product/AVM-code/frontend/mobile-app

# Clean previous build
npx expo prebuild --platform android --clean

# Build release APK
cd android && ./gradlew assembleRelease

# Copy and rename APK
cd ..
cp android/app/build/outputs/apk/release/app-release.apk .
mv app-release.apk Sparky-v1.0.0-$(date +%Y%m%d).apk

# Start distribution server
python3 -m http.server 8888
```

---

## 📞 API Configuration

The app is configured to connect to:
```
https://product-production-afd1.up.railway.app
```

If you need to change the API endpoint, edit:
```
/Users/koustubskulkarni/AVM/product/AVM-code/frontend/mobile-app/app.json
```

Look for the `extra.apiUrl` field.

---

## ✅ Quick Reference Card

**Share this with testers:**

```
🔗 Download Link: http://192.168.29.16:8888/download.html

📝 Requirements:
   - Android 7.0+ (API 24)
   - Same WiFi network (192.168.29.x)
   - ~70 MB free space

🔐 Test Credentials:
   - Check with admin for login details

💡 Support:
   - Contact: tech support team
```

---

**Generated:** October 27, 2025
**Server Status:** ✅ Running on port 8888
**Distribution Ready:** ✅ Yes
