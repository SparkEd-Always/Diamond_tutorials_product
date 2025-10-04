# WhatsApp Business API Setup Guide

## 📱 Your Configuration
- **Business Phone Number:** +91 9380668711 (This will send messages to parents)
- **Test Mode:** DISABLED (Sending to real parent numbers)

## Parent Phone Numbers (Registered in System)
1. +91 9986660025 - Rahul Sharma (Class 7)
2. +91 8105198350 - Priya Patel (Class 8)
3. +91 8123001495 - Arjun Kumar (Class 9)

## Prerequisites
- Meta Business Account
- Facebook Developer Account
- Phone number +91 9380668711 (must have access to receive verification code)

## Step-by-Step Setup

### 1. Create Meta Business Account
1. Go to https://business.facebook.com
2. Click "Create Account"
3. Follow the prompts to set up your business

### 2. Create Facebook App
1. Go to https://developers.facebook.com
2. Click "My Apps" > "Create App"
3. Select "Business" as the app type
4. Fill in app details:
   - App Name: "AVM Tutorial Management"
   - Contact Email: Your email
   - Business Account: Select your business

### 3. Add WhatsApp Product
1. In your app dashboard, find "WhatsApp" in the Products section
2. Click "Set Up"
3. Follow the setup wizard

### 4. Get Your Credentials

#### Access Token
1. In your app dashboard, go to "WhatsApp" > "API Setup"
2. Copy the "Temporary access token" (for testing)
3. For production, generate a permanent token:
   - Go to "Business Settings" > "System Users"
   - Create a system user
   - Generate a permanent token with `whatsapp_business_messaging` permission

#### Phone Number ID
1. In "WhatsApp" > "API Setup"
2. You'll see "Phone number ID" under your test number
3. Copy this ID

#### Verify Token
1. Create a secure random string (e.g., `avm_whatsapp_verify_2024_secure`)
2. Use this for webhook verification

### 5. Update Backend Configuration

Edit `/Users/koustubskulkarni/AVM/product/AVM-code/backend/.env`:

```env
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_API_VERSION=v17.0
WHATSAPP_VERIFY_TOKEN=avm_whatsapp_verify_2024_secure
```

### 6. Register Your Business Phone Number
1. In "WhatsApp" > "API Setup", click "Add phone number"
2. **Enter:** +91 9380668711
3. You'll receive a verification code via SMS
4. Enter the code to verify
5. Complete the business profile setup

**Important:** This number (+91 9380668711) will be the sender for all WhatsApp messages to parents.

### 6.1. Phone Number Format
All phone numbers are already formatted correctly in the database:
- Business: +919380668711
- Parent 1: +919986660025
- Parent 2: +918105198350
- Parent 3: +918123001495

### 7. Testing the Setup

#### Important: Add Test Recipients First
Before you can send messages, you need to add the parent phone numbers as test recipients:

1. Go to "WhatsApp" > "API Setup" in your Meta app
2. Scroll to "Send and receive messages" section
3. Click "Add phone number" under test recipients
4. Add these numbers one by one:
   - +91 9986660025
   - +91 8105198350
   - +91 8123001495
5. Each parent will receive an opt-in message on WhatsApp
6. **Parents must accept/reply** to the opt-in message before receiving attendance notifications

#### Test Attendance Notification
1. Log into the admin panel (http://localhost:3000)
2. Navigate to Attendance page
3. Mark attendance for a student (e.g., Rahul Sharma - Class 7)
4. Select status (Present/Absent) and add remarks
5. Click Submit
6. Parent at +91 9986660025 should receive WhatsApp message

### 8. Verify It's Working

Check these to confirm successful setup:
1. **Backend logs**: Look for `✅ Credentials sent to...` or WhatsApp API success messages
2. **Parent's WhatsApp**: They should receive formatted attendance message
3. **No errors**: Backend should not show "Invalid access token" or API errors

**Sample Message Parent Receives:**
```
📚 AVM Tutorial - Daily Update

🎓 Student: Rahul Sharma (AVM-STU-001)
📅 Date: 02 Oct 2025
✅ Attendance: Present
📝 Remarks: Good behavior

💬 Reply to this chat for any queries.
```

### 9. Webhook Setup (Optional, for two-way messaging)

If you want to receive messages from teachers:

1. In your app, go to "WhatsApp" > "Configuration"
2. Add webhook URL: `https://your-domain.com/api/v1/whatsapp/webhook`
3. Add verify token (same as `WHATSAPP_VERIFY_TOKEN`)
4. Subscribe to webhook events

## Common Issues

### Issue: "Invalid access token"
- **Solution**: Regenerate token in Meta Business Manager
- Ensure token has `whatsapp_business_messaging` permission

### Issue: "Phone number not registered"
- **Solution**: Add phone number as test recipient in Meta dashboard
- Wait for recipient to accept opt-in message

### Issue: "Message not delivered"
- **Solution**:
  - Verify phone number format (E.164)
  - Check if number is on WhatsApp
  - Ensure number has opted-in (for test mode)

### Issue: "Rate limit exceeded"
- **Solution**:
  - Test numbers have message limits (50/day)
  - For production, verify your business

## Production Deployment

For production use:
1. Complete Meta Business Verification
2. Add official business phone number
3. Generate permanent access token
4. Set up proper error handling and logging
5. Implement rate limiting
6. Add message templates (for marketing messages)

## Message Format

Teachers receive messages in this format:
```
🎓 AVM Tutorial - Teacher Account Created

👤 Name: [Teacher Name]
📧 Email: [Email]
🔑 Username: [Username]
🔐 Password: [Password]

🌐 Login at: http://localhost:3000

⚠️ Please change your password after first login.

For any assistance, please contact the admin.
```

## Resources

- [WhatsApp Business Platform Documentation](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Business API Quick Start](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Meta Business Help Center](https://www.facebook.com/business/help)

## Support

If you encounter issues:
1. Check backend logs: `docker-compose logs backend` or console output
2. Verify credentials in `.env` file
3. Test with Meta's API Explorer
4. Check Meta Business Suite > WhatsApp Manager for message status
