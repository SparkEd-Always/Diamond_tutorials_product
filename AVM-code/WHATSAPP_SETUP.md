# WhatsApp Business API Setup Guide

## Prerequisites
- Meta Business Account
- Facebook Developer Account
- A phone number for WhatsApp Business

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

### 6. Test Phone Number Format
WhatsApp requires phone numbers in E.164 format:
- Include country code without + symbol
- Example: `919876543210` (for India +91-9876543210)

### 7. Testing the Setup

#### Test with Meta's Test Number (Development)
1. Go to "WhatsApp" > "API Setup" in your app
2. Add test recipient phone numbers (up to 5)
3. The test recipients will receive a WhatsApp message to opt-in
4. Once opted-in, you can send test messages

#### Import Teachers and Test
1. Create a test Excel file with teacher data
2. Ensure phone numbers are in E.164 format (e.g., 919876543210)
3. Upload via the Import page
4. Check the backend logs for WhatsApp API responses

### 8. Verify It's Working

After importing teachers, check:
1. Backend logs: `✅ Credentials sent to [Teacher Name] at [phone]`
2. Teachers should receive WhatsApp messages with login credentials

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
