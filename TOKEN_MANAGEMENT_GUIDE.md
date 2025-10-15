# Token Management & Expiration Strategy

## Current Issue: Why Tokens Expire in Development

### Root Cause
Your tokens are set to expire after **30 minutes** (see `config.py:18`). When you:
1. Work on local machine, take a break
2. Come back after 30+ minutes
3. Frontend still has the old token in localStorage
4. API calls fail with "Could not validate credentials"

### Why This Happens
- **Backend**: JWT tokens have an `exp` (expiration) timestamp
- **Frontend**: Stores token in localStorage, which persists even after closing browser
- **Problem**: Frontend doesn't detect expiration until API call fails

---

## Solution Strategy

### Development Environment (Local Work)
**Option 1: Longer Token Expiry** (Quick Fix)
- Increase token expiry to 8-24 hours for development
- Prevents interruptions during coding sessions

**Option 2: Token Refresh Mechanism** (Production-Ready)
- Implement refresh tokens (long-lived)
- Auto-refresh access tokens (short-lived)
- Seamless user experience

### Production Environment (Live System)
**Must-Have Features:**
1. **Refresh Token Pattern**
   - Access Token: 30 minutes (short-lived, secure)
   - Refresh Token: 7-30 days (long-lived, stored securely)
   - Auto-refresh before access token expires

2. **Axios Interceptor**
   - Detect 401 errors
   - Attempt token refresh
   - Retry failed request
   - Logout if refresh fails

3. **Token Expiry Validation**
   - Check token expiry before each API call
   - Preemptively refresh if about to expire

---

## Implementation Plan

### Phase 1: Development Quick Fix (Now)
✅ Increase token expiry to 8 hours for local development
✅ Add environment-based configuration

### Phase 2: Production Token Refresh (Before Launch)
🔲 Implement refresh token endpoint
🔲 Add axios interceptor for 401 handling
🔲 Store refresh token securely
🔲 Auto-refresh logic

### Phase 3: Mobile App Considerations
🔲 Secure token storage (react-native-keychain)
🔲 Background token refresh
🔲 Biometric re-authentication

---

## Immediate Fix for Development

### Backend Changes
1. Create `.env` file with longer token expiry
2. Use environment variables for configuration

### Frontend Changes
1. Add axios interceptor to handle 401 errors
2. Clear localStorage and redirect to login on token expiry
3. Optional: Show "Session expired" message

---

## Best Practices for Production

### Security
- Access tokens: 15-30 minutes (balance security vs UX)
- Refresh tokens: 7-14 days (mobile), 1 day (web)
- HTTPS only in production
- Secure HTTP-only cookies for refresh tokens (web)
- Encrypted storage for refresh tokens (mobile)

### User Experience
- Silent token refresh (users don't notice)
- Background refresh for mobile apps
- Grace period for API calls during refresh
- Clear session expiry messages
- Option to "Remember me" for longer sessions

### Monitoring
- Log token refresh failures
- Track token expiry patterns
- Alert on unusual token activity
- Monitor 401 error rates

---

## Configuration Recommendations

### Development
```env
ACCESS_TOKEN_EXPIRE_MINUTES=480  # 8 hours
REFRESH_TOKEN_EXPIRE_DAYS=30     # 30 days
```

### Staging
```env
ACCESS_TOKEN_EXPIRE_MINUTES=120  # 2 hours
REFRESH_TOKEN_EXPIRE_DAYS=7      # 7 days
```

### Production
```env
ACCESS_TOKEN_EXPIRE_MINUTES=30   # 30 minutes
REFRESH_TOKEN_EXPIRE_DAYS=14     # 14 days
```

---

## Summary

**Why you see token issues locally:**
- 30-minute expiry + localStorage persistence + work breaks = expired tokens

**Quick fix (now):**
- Increase development token expiry to 8 hours

**Production solution (before launch):**
- Implement refresh token pattern
- Add 401 interceptor with auto-refresh
- Graceful session management

**Key benefit:**
- Development: Fewer interruptions
- Production: Secure + seamless user experience
