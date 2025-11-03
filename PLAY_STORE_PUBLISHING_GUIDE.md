# Google Play Store Publishing Guide - Sparky v1.0.6

## 📋 Publishing Checklist Status

**App Information:**
- **App Name**: Sparky
- **Package**: com.sparked.sparky
- **Version**: 1.0.6 (versionCode: 6)
- **APK Size**: 68 MB
- **Status**: ✅ Production Ready

---

## 🎯 Step 1: Google Play Developer Account Setup

### Create Developer Account (One-time, $25 USD fee)

1. **Go to Google Play Console**
   - Visit: https://play.google.com/console/signup
   - Sign in with your Google account (use a business/organization account if available)

2. **Pay Registration Fee**
   - One-time fee: **$25 USD**
   - Payment via credit/debit card
   - Account activated immediately after payment

3. **Complete Account Information**
   - Developer name: "SparkEd" (or your organization name)
   - Email address: Contact email for support
   - Phone number: For account verification
   - Address: Business/Developer address

4. **Accept Agreements**
   - Play Developer Distribution Agreement
   - US export laws compliance
   - Content policy guidelines

**Estimated Time**: 30-45 minutes

---

## 🔐 Step 2: Generate Signed App Bundle (AAB)

Google Play requires a signed Android App Bundle (.aab) for publishing. This is different from the APK.

### 2.1 Create Upload Keystore (First Time Only)

**IMPORTANT**: Keep this keystore safe! You'll need it for all future updates.

```bash
cd ~/AVM/product/AVM-code/frontend/mobile-app/android/app

# Generate keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore sparky-upload-key.keystore \
  -alias sparky-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**When prompted, enter:**
- **Keystore password**: Choose a strong password (save this!)
- **Key password**: Use the same password as keystore
- **First and Last name**: SparkEd / Your Name
- **Organizational unit**: Development
- **Organization**: SparkEd
- **City**: Your City
- **State**: Your State
- **Country code**: IN

**⚠️ CRITICAL**: Backup this keystore file and passwords securely!
- Store in password manager (1Password, LastPass, etc.)
- Keep multiple backups (cloud + local)
- If you lose this, you can NEVER update the app on Play Store!

### 2.2 Configure Gradle for Signed Builds

**Edit `android/gradle.properties`:**

Add these lines at the end:
```properties
SPARKY_UPLOAD_STORE_FILE=sparky-upload-key.keystore
SPARKY_UPLOAD_KEY_ALIAS=sparky-key-alias
SPARKY_UPLOAD_STORE_PASSWORD=your_keystore_password_here
SPARKY_UPLOAD_KEY_PASSWORD=your_key_password_here
```

**⚠️ Security**: Add `gradle.properties` to `.gitignore` to avoid committing passwords!

**Edit `android/app/build.gradle`:**

Find the `android { ... }` block and add:

```gradle
android {
    ...

    signingConfigs {
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
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 2.3 Build App Bundle (AAB)

```bash
cd ~/AVM/product/AVM-code/frontend/mobile-app

# Clean previous builds
cd android && ./gradlew clean && cd ..

# Build App Bundle
npx expo run:android --variant release --no-install

# Or directly with Gradle
cd android && ./gradlew bundleRelease && cd ..
```

**Output file location:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

**Rename for clarity:**
```bash
cp android/app/build/outputs/bundle/release/app-release.aab \
   ~/AVM/product/AVM-code/Sparky-v1.0.6-release.aab
```

**Estimated Time**: 15-20 minutes

---

## 📸 Step 3: Prepare Visual Assets

### Required Assets

Google Play Store requires specific graphics in exact dimensions:

#### 3.1 App Icon (Already Created ✅)
- **Size**: 512 x 512 px
- **Format**: PNG (32-bit)
- **Current**: SparkEd logo (already in app)
- **Action**: Export icon at 512x512 from Figma/design tool

#### 3.2 Feature Graphic (Required)
- **Size**: 1024 x 500 px
- **Format**: PNG or JPEG
- **Purpose**: Banner shown at top of store listing
- **Content Ideas**:
  - Sparky logo with tagline
  - "Smart Tutorial Management for Indian Schools"
  - Screenshot collage with branding

#### 3.3 Screenshots (Minimum 2, Recommended 4-8)
- **Size**: Phone screenshots (various sizes accepted)
- **Recommended**: 1080 x 1920 px (9:16 ratio)
- **Format**: PNG or JPEG

**Screenshots to Capture:**

1. **Teacher Home Screen**
   - Shows: Dashboard with attendance, messages, students menu
   - Caption: "Teacher Dashboard - Manage attendance & communicate"

2. **Attendance Marking**
   - Shows: Student list with present/absent toggles
   - Caption: "Quick Attendance Marking"

3. **Parent Messages**
   - Shows: Message inbox with notifications
   - Caption: "Stay Connected - Receive Important Updates"

4. **Attendance History**
   - Shows: Calendar view with attendance records
   - Caption: "Track Student Attendance History"

5. **Login Screen**
   - Shows: OTP login with SparkEd branding
   - Caption: "Secure OTP-Based Login"

**How to Capture Screenshots:**

```bash
# Connect physical device or start emulator
adb devices

# Install APK
adb install ~/AVM/product/AVM-code/Sparky-v1.0.6-FINAL-20251103.apk

# Open app, navigate to each screen, then:
# Method 1: Device screenshot (Power + Volume Down)
# Method 2: ADB command
adb exec-out screencap -p > screenshot1.png

# Or use Android Studio Device File Explorer
```

**Screenshot Editing (Optional but Recommended):**
- Add device frame (use https://mockuphone.com)
- Add captions/text overlay
- Ensure consistent branding colors (#2C4E8A blue)

#### 3.4 Optional Assets (Recommended)

**Promo Video** (Optional):
- **Duration**: 30 seconds - 2 minutes
- **Format**: MP4, MOV, or AVI
- **Content**: App walkthrough, key features demo
- **Note**: Increases conversion rate by 30%

**TV Banner** (Not needed for phone-only app)

**Estimated Time**: 2-3 hours (including screenshot capture and editing)

---

## 📝 Step 4: Write Store Listing Content

### 4.1 App Title
**Max 50 characters**

**Options:**
- "Sparky - Smart Tutorial Management" (37 chars) ✅ Recommended
- "Sparky - School & Tutorial Manager" (35 chars)
- "Sparky by SparkEd - Tutorial App" (33 chars)

### 4.2 Short Description
**Max 80 characters**

**Recommended:**
"Smart attendance & communication app for tutorials and schools in India" (73 chars) ✅

### 4.3 Full Description
**Max 4000 characters**

```markdown
Sparky - The Complete Tutorial Management App for Indian Schools 🎓

Sparky is a smart, zero-maintenance mobile app designed specifically for tutorial centers and small schools across India. Built by SparkEd, Sparky helps teachers, parents, and admins stay connected and organized.

✅ KEY FEATURES

📋 Smart Attendance Management
• Teachers mark attendance in seconds with one-tap interface
• Real-time attendance tracking and history
• Automated parent notifications
• Admin approval workflow for accuracy

📱 Instant Parent Communication
• Push notifications for attendance updates
• Direct messaging between teachers and parents
• Important announcements and notices
• Read receipts and delivery tracking

👨‍🏫 Teacher Tools
• Student list with quick search
• Class-wise attendance marking
• Communication history
• Attendance reports and analytics

👪 Parent Features
• View child's attendance history
• Receive instant notifications
• Stay updated with school announcements
• Secure OTP-based login

🔐 Security & Privacy
• OTP-based authentication (no passwords to remember)
• Optional PIN/biometric lock
• Secure data encryption
• Privacy-first design

🎨 Modern Design
• Clean, intuitive interface
• Fast and responsive
• Works offline (sync when online)
• Designed for Indian users

🏫 PERFECT FOR:
• Tutorial centers
• Coaching classes
• Small private schools
• After-school programs
• Educational institutions

💰 AFFORDABLE PRICING
Starting at just ₹29/student/month - affordable for every tutorial!

🇮🇳 MADE FOR INDIA
• Supports Indian phone numbers
• Rupee (₹) currency
• Works with Indian mobile networks
• Optimized for Indian internet speeds

📞 SUPPORT
Need help? Contact us at support@sparked.in

---

About SparkEd:
SparkEd builds modern, affordable educational technology for Indian schools and tutorials. Our mission is to make school management effortless so educators can focus on teaching.

Visit: https://sparky-avm.com

---

Download Sparky today and experience stress-free tutorial management! 🚀
```

### 4.4 App Category
**Primary Category**: Education
**Secondary Category** (optional): Productivity

### 4.5 Tags/Keywords
education, attendance, school, tutorial, teacher, parent, communication, student, coaching, classes, management

### 4.6 Contact Details
- **Email**: support@sparked.in (or your support email)
- **Phone**: +91-XXXXXXXXXX (optional but recommended)
- **Website**: https://sparky-avm.com
- **Privacy Policy URL**: (Create in Step 5)

**Estimated Time**: 1-2 hours

---

## 🔒 Step 5: Create Privacy Policy

Google Play requires a publicly accessible privacy policy for all apps.

### Option 1: Use Privacy Policy Generator (Fastest)

**Recommended Tool**: https://app-privacy-policy-generator.nisrulz.com/

**Steps:**
1. Go to the generator
2. Fill in:
   - App name: Sparky
   - Developer name: SparkEd
   - Contact email: support@sparked.in
   - App description: Tutorial management app
3. Select data collected:
   - ✅ Phone number (for OTP login)
   - ✅ Device information (push tokens)
   - ✅ Usage data (attendance records)
   - ❌ Location (not collected)
   - ❌ Contacts (not collected)
4. Select third-party services:
   - ✅ Firebase (for push notifications)
   - ❌ Google Analytics (if not using)
5. Generate and download HTML

### Option 2: Host Privacy Policy (Required)

**Option A: Host on GitHub Pages (Free)**

```bash
cd ~/AVM/product

# Create privacy policy file
cat > privacy-policy.html <<'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sparky - Privacy Policy</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 { color: #2C4E8A; }
        h2 { color: #203C64; margin-top: 30px; }
    </style>
</head>
<body>
    <h1>Privacy Policy for Sparky</h1>
    <p><strong>Effective Date:</strong> November 3, 2025</p>

    <h2>1. Introduction</h2>
    <p>Sparky ("we," "our," or "the App") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.</p>

    <h2>2. Information We Collect</h2>
    <p><strong>Personal Information:</strong></p>
    <ul>
        <li>Phone number (for authentication via OTP)</li>
        <li>Name and profile information (teachers, parents, students)</li>
        <li>Attendance records</li>
        <li>Communication messages</li>
    </ul>

    <p><strong>Technical Information:</strong></p>
    <ul>
        <li>Device push notification tokens</li>
        <li>Device type and operating system version</li>
        <li>App usage statistics</li>
    </ul>

    <h2>3. How We Use Your Information</h2>
    <ul>
        <li>Provide authentication and secure login via OTP</li>
        <li>Track and manage student attendance</li>
        <li>Facilitate communication between teachers and parents</li>
        <li>Send push notifications for attendance updates and messages</li>
        <li>Improve app functionality and user experience</li>
    </ul>

    <h2>4. Data Sharing</h2>
    <p>We do not sell, trade, or share your personal information with third parties except:</p>
    <ul>
        <li><strong>Firebase Cloud Messaging:</strong> For delivering push notifications</li>
        <li><strong>Service Providers:</strong> For hosting and backend infrastructure</li>
        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
    </ul>

    <h2>5. Data Security</h2>
    <p>We implement industry-standard security measures including:</p>
    <ul>
        <li>Encrypted data transmission (HTTPS/SSL)</li>
        <li>Secure authentication with OTP and optional PIN/biometric</li>
        <li>Regular security audits and updates</li>
        <li>Limited access to personal data by authorized personnel only</li>
    </ul>

    <h2>6. Data Retention</h2>
    <p>We retain your data for as long as necessary to provide our services. You can request deletion of your account and associated data by contacting us.</p>

    <h2>7. Children's Privacy</h2>
    <p>Our app is designed for use by educational institutions. Student information is collected and managed by authorized school administrators, teachers, and parents only.</p>

    <h2>8. Your Rights</h2>
    <p>You have the right to:</p>
    <ul>
        <li>Access your personal information</li>
        <li>Correct inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Opt-out of non-essential communications</li>
    </ul>

    <h2>9. Third-Party Services</h2>
    <p>Our app uses:</p>
    <ul>
        <li><strong>Firebase Cloud Messaging:</strong> For push notifications (<a href="https://firebase.google.com/support/privacy">Privacy Policy</a>)</li>
        <li><strong>Railway (Backend Hosting):</strong> For secure data storage</li>
    </ul>

    <h2>10. Changes to This Policy</h2>
    <p>We may update this Privacy Policy periodically. Changes will be posted in the app and on this page with an updated effective date.</p>

    <h2>11. Contact Us</h2>
    <p>If you have questions about this Privacy Policy, contact us:</p>
    <ul>
        <li><strong>Email:</strong> support@sparked.in</li>
        <li><strong>Website:</strong> https://sparky-avm.com</li>
    </ul>

    <hr>
    <p style="text-align: center; color: #6B7280; font-size: 14px;">© 2025 Sparky from SparkEd. All rights reserved.</p>
</body>
</html>
EOF

# Add to git
git add privacy-policy.html
git commit -m "Add privacy policy for Play Store submission"
git push
```

**Enable GitHub Pages:**
1. Go to GitHub repository settings
2. Pages → Source → Select "main" branch → Save
3. Privacy Policy URL: `https://sparked-org.github.io/product/privacy-policy.html`

**Option B: Host on Your Website**

Upload `privacy-policy.html` to your website:
- URL: `https://sparky-avm.com/privacy-policy`

**Estimated Time**: 1 hour

---

## 🎮 Step 6: Upload to Play Console

### 6.1 Create New App

1. **Go to Play Console**
   - https://play.google.com/console
   - Click "Create app"

2. **Fill Basic Information**
   - **App name**: Sparky
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**:
     - ✅ I confirm this app complies with Google Play policies
     - ✅ I confirm this app complies with US export laws
   - Click "Create app"

### 6.2 Set Up App (Dashboard)

**Complete these sections** (Play Console will show checklist):

#### A. Store Presence

**Main Store Listing:**
1. **App details**
   - App name: Sparky
   - Short description: (from Step 4.2)
   - Full description: (from Step 4.3)

2. **Graphics**
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG
   - Phone screenshots: Upload 2-8 screenshots

3. **Categorization**
   - App category: Education
   - Tags: education, attendance, school, etc.

4. **Contact details**
   - Email: support@sparked.in
   - Phone: (optional)
   - Website: https://sparky-avm.com
   - Privacy policy: https://sparked-org.github.io/product/privacy-policy.html

5. Save changes

#### B. App Content

**1. Privacy Policy**
- URL: (Already provided in Store Listing)
- Click "Save"

**2. Ads**
- Does your app contain ads? **No**
- Click "Save"

**3. Content Ratings**
- Click "Start questionnaire"
- **Category**: Education
- **Questions**:
  - Violence: No
  - Sexual content: No
  - Language: No
  - Controlled substances: No
  - Gambling: No
  - User-generated content: No (messages are within school context)
  - User communication: Yes (parent-teacher messaging)
  - User location sharing: No
  - Purchases: No
- Submit questionnaire
- **Result**: Likely rating: "Everyone" or "Everyone 10+"

**4. Target Audience**
- **Age groups**: 13-17, 18+ (parents and teachers)
- **Is your app designed for children?**: No (designed for educational institutions)
- Click "Save"

**5. News App**
- Is this a news app? **No**

**6. COVID-19 Contact Tracing and Status Apps**
- Is this a COVID-19 app? **No**

**7. Data Safety**
- **Does your app collect or share user data?**: Yes
- **Data types collected**:
  - Personal info: Name, Phone number
  - Messages: In-app messages (teacher-parent communication)
  - App activity: App interactions (attendance records)
- **Data usage**:
  - App functionality: Account management, communication
  - Fraud prevention: Authentication
- **Data sharing**: No (not shared with third parties except service providers)
- **Encryption**: Yes (data encrypted in transit)
- **Can users request deletion?**: Yes
- Click "Save"

#### C. Release

**1. Countries/Regions**
- Select countries: **India** (primary), or "All countries" if targeting globally
- Click "Save"

**2. Production Track**
- Click "Create new release"

**3. App Integrity**
- **App signing by Google Play**: Recommended (Google manages signing)
  - Google will re-sign your AAB with a Play-managed key
  - Automatically enabled for new apps
- OR **Use your own key** (advanced, not recommended)

**4. Upload App Bundle**
- Click "Upload"
- Select: `Sparky-v1.0.6-release.aab`
- Wait for processing (2-5 minutes)

**5. Release Details**
- **Release name**: "1.0.6 - Initial Release" (or "v1.0.6")
- **Release notes** (English):
  ```
  Initial release of Sparky - Smart Tutorial Management App

  Features:
  • Teacher attendance marking with one-tap interface
  • Parent notifications for attendance updates
  • In-app messaging between teachers and parents
  • Attendance history and reports
  • Secure OTP-based authentication
  • Modern, intuitive design

  Built specifically for Indian tutorial centers and schools.
  ```

**6. Rollout Percentage**
- For first release: **100%** (full rollout)
- OR start with smaller % (10%, 20%) for gradual rollout

**7. Review Release**
- Click "Review release"
- Check all details
- Click "Start rollout to Production"

### 6.3 Submit for Review

After clicking "Start rollout to Production":
- **Status changes to**: "In review"
- **Review time**: Typically 1-7 days (average 2-3 days)
- **Email notification**: When review completes

---

## ✅ Step 7: Post-Submission

### 7.1 Review Status

**Possible Outcomes:**

1. **Approved ✅**
   - App goes live within 1-2 hours
   - Available on Play Store: `https://play.google.com/store/apps/details?id=com.sparked.sparky`
   - Share link with users!

2. **Rejected ❌**
   - Email explains reason (policy violation, technical issue, etc.)
   - Fix issues
   - Upload new version
   - Re-submit (usually faster review second time)

### 7.2 Monitor Performance

**Play Console Dashboard provides:**
- Install statistics
- User ratings and reviews
- Crash reports (if any)
- Device compatibility reports
- Performance metrics

### 7.3 Update Process (Future)

**For v1.0.7, v1.0.8, etc.:**

1. Update version in `app.json`:
   ```json
   "version": "1.0.7",
   "android": {
     "versionCode": 7
   }
   ```

2. Build new AAB:
   ```bash
   cd android && ./gradlew bundleRelease
   ```

3. Go to Play Console → Production → "Create new release"
4. Upload new AAB
5. Add release notes
6. Submit for review

**Note**: Updates typically review faster (1-2 days)

---

## 📊 Timeline Estimate

| Step | Description | Time |
|------|-------------|------|
| 1 | Create Developer Account | 30-45 min |
| 2 | Generate Signed AAB | 15-20 min |
| 3 | Prepare Screenshots & Graphics | 2-3 hours |
| 4 | Write Store Listing | 1-2 hours |
| 5 | Create Privacy Policy | 1 hour |
| 6 | Upload & Configure Play Console | 1-2 hours |
| 7 | Wait for Review | 1-7 days |
| **Total Active Work** | **6-9 hours** |
| **Total Calendar Time** | **2-8 days** |

---

## ⚠️ Common Issues & Solutions

### Issue 1: "App not signed with upload key"
**Solution**: Make sure you're using the signed AAB (not unsigned APK)

### Issue 2: "Version code already used"
**Solution**: Increment versionCode in app.json

### Issue 3: "Icon does not meet requirements"
**Solution**: Export icon as 512x512 PNG, ensure no transparency

### Issue 4: "Privacy policy not accessible"
**Solution**: Verify privacy policy URL is publicly accessible (test in incognito mode)

### Issue 5: "Target SDK version too low"
**Solution**: Update `android/build.gradle` targetSdkVersion to 34 (latest)

### Issue 6: "App crashes on startup"
**Solution**: Test AAB on physical device before submission
```bash
# Install AAB locally for testing
bundletool build-apks --bundle=app-release.aab --output=app.apks --mode=universal
bundletool install-apks --apks=app.apks
```

---

## 📞 Support & Resources

**Google Play Console Help:**
- https://support.google.com/googleplay/android-developer

**Play Policy Center:**
- https://play.google.com/about/developer-content-policy/

**Common Rejection Reasons:**
- https://support.google.com/googleplay/android-developer/answer/9876937

**Expo Documentation (App Signing):**
- https://docs.expo.dev/distribution/app-stores/

**Contact Play Support:**
- Play Console → Help → Contact Support

---

## 🎉 Launch Checklist

Before going live, verify:

- [ ] Developer account created and verified
- [ ] App signed with upload keystore
- [ ] AAB generated successfully
- [ ] All screenshots captured (minimum 2)
- [ ] Feature graphic created (1024x500)
- [ ] App icon ready (512x512)
- [ ] Store listing written and reviewed
- [ ] Privacy policy created and hosted
- [ ] Privacy policy URL accessible
- [ ] Content rating completed
- [ ] Target countries selected
- [ ] Release notes written
- [ ] AAB uploaded to Play Console
- [ ] All required sections completed (green checkmarks)
- [ ] App submitted for review
- [ ] Notification email received from Google

**Post-Launch:**
- [ ] App approved and live
- [ ] Play Store link shared with users
- [ ] Monitoring reviews and ratings
- [ ] Responding to user feedback
- [ ] Planning next update (v1.0.7)

---

**Good luck with your Play Store launch! 🚀**

*Document created: November 3, 2025*
*Last updated: November 3, 2025*
*Status: Ready for submission*
