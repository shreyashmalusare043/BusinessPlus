# Email Verification Setup Guide for LyraBiz

## Overview
LyraBiz now uses a custom email verification system that sends verification emails to users when they sign up. This guide explains how to configure the email service.

## Current Status
- ✅ Supabase built-in email verification: **DISABLED** (to avoid rate limits)
- ✅ Custom email verification system: **ENABLED**
- ✅ Email verification database table: **CREATED**
- ✅ Edge Function for sending emails: **DEPLOYED**
- ✅ Verification page: **CREATED** (/verify-email)

## Email Service Options

### Option 1: Resend (Recommended - Easiest)
Resend is a modern email API that's easy to set up and has a generous free tier.

**Steps:**
1. Go to https://resend.com and create a free account
2. Verify your domain or use their test domain
3. Get your API key from the dashboard
4. Add the API key as a Supabase secret:
   - Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Add secret: `RESEND_API_KEY` = `your_api_key_here`
5. (Optional) Add your Gmail as the sender:
   - Add secret: `GMAIL_USER` = `shreyashmalusare043@gmail.com`

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for development and small deployments

### Option 2: Gmail SMTP (Alternative)
Use your Gmail account to send emails directly.

**Steps:**
1. Enable 2-Factor Authentication on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "LyraBiz"
   - Copy the 16-character password

3. Add secrets to Supabase:
   - `GMAIL_USER` = `shreyashmalusare043@gmail.com`
   - `GMAIL_APP_PASSWORD` = `your_16_char_app_password`

**Note:** Gmail has sending limits (500 emails/day for free accounts)

### Option 3: Other Email Services
You can also use:
- **SendGrid**: https://sendgrid.com (100 emails/day free)
- **Mailgun**: https://mailgun.com (5,000 emails/month free)
- **AWS SES**: https://aws.amazon.com/ses/ (62,000 emails/month free)

## How It Works

### Signup Flow:
1. User fills out signup form with username, email, and password
2. Account is created in Supabase Auth
3. Edge Function `send-verification-email` is called
4. Function generates a unique verification token
5. Token is stored in `email_verifications` table
6. Email is sent to user's email address with verification link
7. User clicks link → redirected to `/verify-email?token=xxx`
8. Token is verified using `verify_email_token()` function
9. User's email is marked as verified in database
10. User can now log in

### Login Flow:
1. User enters username/email and password
2. System checks if email is verified (`email_confirmed_at` field)
3. If not verified → login blocked with error message
4. If verified → login successful

## Testing Without Email Service

If you haven't set up an email service yet, you can still test:

1. **Check Edge Function Logs:**
   - The verification link is logged in the Edge Function response
   - Check browser console after signup
   - Look for: `verificationLink: "http://localhost:5173/verify-email?token=xxx"`

2. **Manual Verification:**
   - Copy the verification link from console
   - Paste it in browser to verify email

3. **Database Direct Verification:**
   ```sql
   -- Manually verify a user in Supabase SQL Editor
   UPDATE auth.users 
   SET email_confirmed_at = now() 
   WHERE email = 'username@miaoda.com';
   ```

## Troubleshooting

### "Email rate limit exceeded"
- This error comes from Supabase's built-in email service
- **Solution:** We've disabled it and use custom email service instead
- Make sure to set up Resend or Gmail SMTP

### "Verification email not received"
1. Check spam/junk folder
2. Verify email service is configured (check Supabase secrets)
3. Check Edge Function logs for errors
4. Try the manual verification method above

### "Invalid or expired verification token"
- Tokens expire after 24 hours
- User needs to sign up again
- Or manually verify using SQL (see above)

## Email Template Customization

The email template is in: `/supabase/functions/send-verification-email/index.ts`

You can customize:
- Email subject
- HTML content
- Styling
- Company branding
- Verification link expiry time (default: 24 hours)

## Security Notes

- Verification tokens are unique UUIDs
- Tokens expire after 24 hours
- Tokens can only be used once
- Email verification is required before login
- Admin accounts bypass email verification

## Support

If you need help setting up email verification:
1. Check Supabase Edge Function logs
2. Check browser console for errors
3. Verify secrets are set correctly in Supabase dashboard
4. Test with manual verification first

## Next Steps

1. **Set up Resend account** (recommended)
2. **Add API key to Supabase secrets**
3. **Test signup flow**
4. **Verify email is received**
5. **Test verification link**
6. **Test login after verification**

---

**Important:** Without an email service configured, users won't receive verification emails. Set up at least one email service option above before going to production.
