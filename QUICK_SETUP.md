# 🚀 Quick Setup Guide - LyraBiz

## ✅ What's Changed

### Authentication System
- ❌ **REMOVED:** Two-step email verification
- ✅ **ENABLED:** Direct signup and login
- ✅ **ADDED:** Welcome email on first signup
- ✅ Users can login immediately after signup

---

## 📧 Email Configuration (Optional)

### Option 1: Resend (Recommended)
1. Sign up at https://resend.com
2. Get API key
3. Add to Supabase:
   - Go to: **Supabase Dashboard → Project Settings → Edge Functions → Secrets**
   - Add: `RESEND_API_KEY` = `your_api_key`
   - Add: `GMAIL_USER` = `shreyashmalusare043@gmail.com`

### Option 2: Gmail SMTP
1. Enable 2FA on Gmail
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Add to Supabase Secrets:
   - `GMAIL_USER` = `shreyashmalusare043@gmail.com`
   - `GMAIL_APP_PASSWORD` = `your_16_char_password`

**Note:** Email is optional. App works without it, but users won't receive welcome emails.

---

## 💳 Razorpay Configuration (Required for Payments)

### Step 1: Get Your Razorpay Key
1. Login to https://dashboard.razorpay.com/
2. Go to **Settings → API Keys**
3. Copy your **Key ID** (e.g., `rzp_test_1234567890abcd`)

### Step 2: Update the Code
**File:** `src/pages/SubscriptionPage.tsx`  
**Line:** 125 (look for the big comment block)

**Find this:**
```typescript
key: 'rzp_test_YOUR_KEY_ID', // ← REPLACE THIS WITH YOUR RAZORPAY KEY
```

**Replace with:**
```typescript
key: 'rzp_test_1234567890abcd', // ← Your actual Razorpay key
```

### Step 3: Test
Use these test cards:
- **Card:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **UPI:** success@razorpay

---

## 🎯 Quick Test Checklist

### Test Signup & Login
- [ ] Sign up with new account
- [ ] Check if welcome email arrives (if email configured)
- [ ] Login immediately (no verification needed)
- [ ] Complete company setup

### Test Payment
- [ ] Click "Upgrade to Premium"
- [ ] Select Monthly or Yearly plan
- [ ] Razorpay modal opens
- [ ] Use test card: 4111 1111 1111 1111
- [ ] Payment succeeds
- [ ] Subscription activated
- [ ] Watermarks removed from bills

---

## 📍 Important File Locations

| What | Where | Line |
|------|-------|------|
| **Razorpay Key** | `src/pages/SubscriptionPage.tsx` | 125 |
| Login Logic | `src/pages/LoginPage.tsx` | 48 |
| Signup Logic | `src/pages/LoginPage.tsx` | 76 |
| Welcome Email | `supabase/functions/send-welcome-email/index.ts` | - |

---

## 🔧 Troubleshooting

### "Payment not working"
→ Check if Razorpay key is updated in `SubscriptionPage.tsx` line 125

### "Welcome email not received"
→ Email service is optional. Check Supabase secrets if you want emails.

### "Can't login after signup"
→ This should work now. Check browser console for errors.

---

## 📞 Need Help?

1. Check `CONFIGURATION_GUIDE.md` for detailed instructions
2. Check browser console for errors
3. Check Supabase logs
4. Check Razorpay dashboard for payment logs

---

**Ready to go!** Just update the Razorpay key and you're all set! 🎉
