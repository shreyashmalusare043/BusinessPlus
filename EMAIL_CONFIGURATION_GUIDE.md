# Email Configuration Guide for InvoxaPro

## Overview
This guide explains how to configure email settings in Supabase to send verification emails and other transactional emails from your own domain/email address.

---

## 🔧 Where to Configure Sender Email

### Option 1: Using Supabase Dashboard (Recommended for Production)

#### Step 1: Access Email Settings
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **InvoxaPro (aexewhy21fr5)**
3. Navigate to: **Authentication** → **Email Templates**

#### Step 2: Configure SMTP Settings
1. In the left sidebar, click on **Settings** → **Authentication**
2. Scroll down to **SMTP Settings** section
3. Enable **Enable Custom SMTP**
4. Fill in the following details:

```
SMTP Host: smtp.your-email-provider.com
SMTP Port: 587 (or 465 for SSL)
SMTP User: your-email@yourdomain.com
SMTP Password: your-email-password
Sender Email: noreply@yourdomain.com
Sender Name: InvoxaPro
```

#### Step 3: Common SMTP Providers Configuration

**Gmail:**
```
Host: smtp.gmail.com
Port: 587
User: your-email@gmail.com
Password: App-specific password (not your regular password)
Note: You need to enable "App Passwords" in Google Account settings
```

**Outlook/Office 365:**
```
Host: smtp.office365.com
Port: 587
User: your-email@outlook.com
Password: Your Outlook password
```

**SendGrid:**
```
Host: smtp.sendgrid.net
Port: 587
User: apikey
Password: Your SendGrid API Key
```

**Mailgun:**
```
Host: smtp.mailgun.org
Port: 587
User: postmaster@your-domain.mailgun.org
Password: Your Mailgun SMTP password
```

**AWS SES:**
```
Host: email-smtp.us-east-1.amazonaws.com (replace region)
Port: 587
User: Your SMTP username from AWS
Password: Your SMTP password from AWS
```

---

### Option 2: Using Resend (Already Configured for Welcome Emails)

The welcome email Edge Function already uses Resend. To configure:

1. Go to Supabase Dashboard → **Edge Functions** → **Secrets**
2. Add/Update these secrets:
   - `RESEND_API_KEY`: Your Resend API key (get from https://resend.com)
   - `ADMIN_EMAIL`: admin@invoxapro.com (or your preferred sender email)
   - `FROM_EMAIL`: noreply@invoxapro.com (or your verified domain email)

**Note:** For Resend to work with your custom domain:
1. Sign up at https://resend.com
2. Verify your domain by adding DNS records
3. Get your API key from the dashboard
4. Add the API key to Supabase Edge Function secrets

---

## 📧 Email Templates Configuration

### Verification Email Template

1. Go to: **Authentication** → **Email Templates** → **Confirm Signup**
2. Customize the template:

```html
<h2>Welcome to InvoxaPro!</h2>
<p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px;">
  Verify Email Address
</a>
<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't create an account, you can safely ignore this email.</p>
<br>
<p>Best regards,<br>The InvoxaPro Team</p>
```

3. Configure the **Subject Line**: `Verify your InvoxaPro account`

### Password Reset Email Template

1. Go to: **Authentication** → **Email Templates** → **Reset Password**
2. Customize the template:

```html
<h2>Reset Your Password</h2>
<p>We received a request to reset your password for your InvoxaPro account.</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px;">
  Reset Password
</a>
<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request a password reset, you can safely ignore this email.</p>
<br>
<p>Best regards,<br>The InvoxaPro Team</p>
```

3. Configure the **Subject Line**: `Reset your InvoxaPro password`

---

## 🔐 Email Verification Flow (Current Implementation)

### How It Works:

1. **User Signs Up:**
   - User enters username, email, and password
   - System creates account with real email address
   - Supabase automatically sends verification email to user's email
   - User sees message: "Account created successfully! Please check your email to verify your account."

2. **User Receives Email:**
   - Email contains verification link
   - Link is valid for 24 hours
   - User clicks the link to verify

3. **User Tries to Login:**
   - If email is NOT verified: Login is blocked with message "Please verify your email address before logging in"
   - If email IS verified: Login succeeds

4. **Resend Verification:**
   - If user didn't receive email, they can click "Didn't receive verification email? Resend" on login page
   - System sends a new verification email

5. **First Login (After Verification):**
   - System detects first login
   - Sends welcome email via Edge Function
   - User is redirected to dashboard or company setup

---

## 🧪 Testing Email Configuration

### Test Verification Email:
1. Create a new account with a real email address
2. Check your inbox for verification email
3. Click the verification link
4. Try to login - should succeed

### Test Resend Verification:
1. Create account but don't verify
2. Try to login - should be blocked
3. Click "Resend verification email"
4. Check inbox for new email

### Test Welcome Email:
1. Verify your account
2. Login for the first time
3. Check inbox for welcome email

---

## 🚨 Troubleshooting

### Emails Not Being Sent:

1. **Check SMTP Configuration:**
   - Verify all SMTP settings are correct
   - Test SMTP credentials with an email client
   - Check if SMTP port is not blocked by firewall

2. **Check Supabase Logs:**
   - Go to: **Logs** → **Auth Logs**
   - Look for email sending errors

3. **Check Spam Folder:**
   - Verification emails might be in spam
   - Add sender email to contacts

4. **Check Email Provider Limits:**
   - Some providers have daily sending limits
   - Gmail: 500 emails/day for free accounts
   - Check if you've exceeded limits

5. **Verify Domain (for custom domains):**
   - Ensure SPF, DKIM, and DMARC records are configured
   - Use tools like MXToolbox to verify DNS records

### Verification Link Not Working:

1. **Check Link Expiry:**
   - Links expire after 24 hours
   - Request a new verification email

2. **Check Redirect URL:**
   - Ensure redirect URL is configured correctly in Supabase
   - Go to: **Authentication** → **URL Configuration**
   - Add your site URL: `https://your-domain.com`

---

## 📝 Current Configuration Status

✅ **Enabled:**
- Email verification requirement
- Email confirmation before login
- Resend verification email functionality
- Welcome email on first login
- Real user email addresses (no more fake @miaoda.com)

✅ **Configured:**
- Verification email blocking unverified users
- Username and email login support
- Password reset with email lookup

⚠️ **Needs Configuration:**
- Custom SMTP settings (currently using Supabase default)
- Custom email templates (currently using Supabase default)
- Custom sender email address (currently using Supabase default)
- Resend API key for welcome emails (if using custom domain)

---

## 🎯 Recommended Next Steps

1. **Set up custom SMTP** (if you want emails from your domain)
2. **Customize email templates** to match your brand
3. **Configure Resend** for welcome emails with your domain
4. **Test all email flows** thoroughly
5. **Monitor email delivery** in Supabase logs

---

## 📞 Support

If you encounter issues:
1. Check Supabase Auth Logs
2. Check Edge Function Logs (for welcome email)
3. Verify SMTP settings
4. Test with different email providers
5. Contact Supabase support if needed

---

**Last Updated:** March 21, 2026
**Application:** InvoxaPro (Internal Billing Management System)
**Project ID:** aexewhy21fr5
