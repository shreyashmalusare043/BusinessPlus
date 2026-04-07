# LyraBiz Configuration Guide

## Email System (Welcome Emails)

### Current Setup
- ✅ Two-step email verification: **DISABLED**
- ✅ Direct signup and login: **ENABLED**
- ✅ Welcome email on signup: **ENABLED**
- ✅ Users can login immediately after signup

### How It Works
1. User signs up with username, email, and password
2. Account is created immediately
3. Welcome email is sent to user's email address
4. User can login right away (no verification required)

### Email Service Configuration

To send welcome emails, you need to configure an email service. Choose one:

#### Option 1: Resend (Recommended - Easiest)
1. Create free account at https://resend.com
2. Get your API key from dashboard
3. Go to Supabase Dashboard → Your Project → Project Settings → Edge Functions → Secrets
4. Add secret:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key (e.g., `re_123abc...`)
5. (Optional) Add sender email:
   - Name: `GMAIL_USER`
   - Value: `shreyashmalusare043@gmail.com`

**Free Tier:** 100 emails/day, 3,000 emails/month

#### Option 2: Gmail SMTP
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Add to Supabase secrets:
   - `GMAIL_USER` = `shreyashmalusare043@gmail.com`
   - `GMAIL_APP_PASSWORD` = Your 16-character app password

**Limit:** 500 emails/day

### Testing Without Email Service
If you haven't configured an email service yet:
- Signup will still work
- Users can login immediately
- Welcome email just won't be sent (no error shown to user)
- Configure email service when ready for production

---

## Razorpay Payment Gateway Configuration

### Where to Enter Razorpay API Key

**File Location:** `/workspace/app-aexewhy21fr5/src/pages/SubscriptionPage.tsx`

**Line Number:** 116

**Current Code:**
```typescript
key: 'rzp_test_YOUR_KEY_ID', // Replace with actual Razorpay key
```

**How to Update:**

1. **Get Your Razorpay API Key:**
   - Login to Razorpay Dashboard: https://dashboard.razorpay.com/
   - Go to Settings → API Keys
   - Copy your **Key ID** (starts with `rzp_test_` for test mode or `rzp_live_` for live mode)

2. **Update the Code:**
   - Open file: `src/pages/SubscriptionPage.tsx`
   - Find line 116
   - Replace `'rzp_test_YOUR_KEY_ID'` with your actual key
   - Example: `key: 'rzp_test_1234567890abcd',`

3. **Test Mode vs Live Mode:**
   - **Test Mode:** Use `rzp_test_...` key for testing (no real money charged)
   - **Live Mode:** Use `rzp_live_...` key for production (real payments)

**Example:**
```typescript
const options = {
  key: 'rzp_test_1234567890abcd', // Your actual Razorpay test key
  amount: amount * 100,
  currency: 'INR',
  name: 'LyraBiz',
  // ... rest of the code
};
```

### Razorpay Setup Checklist

- [ ] Create Razorpay account at https://razorpay.com
- [ ] Complete KYC verification (required for live mode)
- [ ] Get API Key from Dashboard → Settings → API Keys
- [ ] Update `SubscriptionPage.tsx` line 116 with your key
- [ ] Test payment flow with test key
- [ ] Switch to live key when ready for production

### Payment Flow

1. User clicks "Upgrade to Premium" or selects a plan
2. Transaction is created in database
3. Razorpay checkout modal opens
4. User completes payment (Card/UPI/Net Banking)
5. Payment success → Subscription activated
6. User gets premium features (no watermarks)

### Razorpay Test Cards

For testing payments in test mode:

| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4111 1111 1111 1111 | Any | Future | Success |
| 4012 0010 3714 1112 | Any | Future | Success |
| 5555 5555 5555 4444 | Any | Future | Success |

**Test UPI ID:** success@razorpay

---

## Quick Start Guide

### 1. Configure Email Service (Optional but Recommended)
```bash
# Add to Supabase Edge Function Secrets:
RESEND_API_KEY=re_your_api_key_here
GMAIL_USER=shreyashmalusare043@gmail.com
```

### 2. Configure Razorpay (Required for Payments)
```typescript
// File: src/pages/SubscriptionPage.tsx (Line 116)
key: 'rzp_test_your_actual_key_here',
```

### 3. Test the System
1. Sign up with a new account
2. Check if welcome email arrives (if configured)
3. Login immediately (no verification needed)
4. Try upgrading to premium
5. Test payment with Razorpay test card

---

## Important Notes

### Email System
- ✅ No email verification required
- ✅ Users can login immediately after signup
- ✅ Welcome email is sent but not required
- ✅ Email service is optional (app works without it)

### Razorpay Integration
- ⚠️ **Required** for subscription payments
- ⚠️ Must update API key in code
- ⚠️ Test with test key before going live
- ⚠️ Complete KYC for live payments

### Security
- All payments are processed securely by Razorpay
- User passwords are hashed by Supabase
- API keys should never be committed to Git
- Use environment variables for production

---

## Support

### Email Issues
- Check Supabase Edge Function logs
- Verify API key is correct
- Check spam folder for welcome emails
- Email service is optional - app works without it

### Payment Issues
- Verify Razorpay key is correct
- Check Razorpay dashboard for transaction logs
- Use test cards for testing
- Contact Razorpay support for payment issues

### General Issues
- Check browser console for errors
- Check Supabase logs
- Verify all secrets are configured
- Test in incognito mode

---

## File Locations Reference

| Feature | File Path | Line |
|---------|-----------|------|
| Razorpay Key | `src/pages/SubscriptionPage.tsx` | 116 |
| Login Logic | `src/pages/LoginPage.tsx` | 48-74 |
| Signup Logic | `src/pages/LoginPage.tsx` | 76-116 |
| Welcome Email | `supabase/functions/send-welcome-email/index.ts` | - |
| Email Secrets | Supabase Dashboard → Edge Functions → Secrets | - |

---

**Last Updated:** 2026-03-21
