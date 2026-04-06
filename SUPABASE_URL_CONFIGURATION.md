# Supabase URL Configuration Guide

## 🚨 CRITICAL: Fix "Application Taken Offline" Error

If you're seeing "This application has been taken offline" when clicking email verification links, you need to configure the Site URL and Redirect URLs in Supabase.

---

## 📍 Step-by-Step Configuration

### Step 1: Access Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project: **InvoxaPro (aexewhy21fr5)**
3. Navigate to: **Authentication** → **URL Configuration**

---

### Step 2: Configure Site URL

The **Site URL** is where Supabase will redirect users after email verification, password reset, etc.

#### For Development (Local Testing):
```
Site URL: http://localhost:5173
```

#### For Production (Your Domain):
```
Site URL: https://your-domain.com
```

**Example:**
```
Site URL: https://invoxapro.com
```

---

### Step 3: Configure Redirect URLs

Add all URLs where your application can be accessed. This prevents the "application taken offline" error.

#### For Development:
```
Redirect URLs:
http://localhost:5173/**
http://localhost:5173/verify-email
http://localhost:5173/login
http://127.0.0.1:5173/**
```

#### For Production:
```
Redirect URLs:
https://your-domain.com/**
https://your-domain.com/verify-email
https://your-domain.com/login
https://www.your-domain.com/**
```

**Important:** 
- Use `/**` wildcard to allow all paths under your domain
- Add both `www` and non-`www` versions if applicable
- Add separate entries for each specific path you want to allow

---

### Step 4: Configure Email Templates Redirect

1. Go to: **Authentication** → **Email Templates**
2. For each template (Confirm Signup, Reset Password, etc.), ensure the redirect URL is correct

#### Confirm Signup Template:
```html
<a href="{{ .ConfirmationURL }}">Verify Email</a>
```

The `{{ .ConfirmationURL }}` will automatically use your configured Site URL.

---

## 🔧 Complete Configuration Example

### Development Environment:

```
Site URL: http://localhost:5173

Redirect URLs:
http://localhost:5173/**
http://127.0.0.1:5173/**
```

### Production Environment:

```
Site URL: https://invoxapro.com

Redirect URLs:
https://invoxapro.com/**
https://www.invoxapro.com/**
```

---

## 📧 Email Verification Flow (After Configuration)

### How It Works:

1. **User Signs Up:**
   - User enters username, email, and password
   - System sends verification email to user's email address

2. **User Receives Email:**
   - Email contains a verification link like:
     ```
     https://your-project.supabase.co/auth/v1/verify?token=xxx&type=signup&redirect_to=https://your-domain.com/verify-email
     ```

3. **User Clicks Link:**
   - Supabase verifies the token
   - Redirects to: `https://your-domain.com/verify-email#access_token=xxx&type=signup`

4. **VerifyEmailPage Handles Callback:**
   - Extracts `access_token` and `type` from URL hash
   - Calls `supabase.auth.getUser(accessToken)` to verify
   - Shows success message
   - User clicks "Continue to Login"

5. **User Logs In:**
   - Email is now verified (`email_confirmed_at` is set)
   - Login succeeds
   - User is redirected to dashboard

---

## 🧪 Testing the Configuration

### Test 1: Verify Email Link Works

1. Create a new account with a real email address
2. Check your inbox for verification email
3. Click the verification link
4. **Expected:** You should see the "Email Verified!" page (not "application taken offline")
5. Click "Continue to Login"
6. Login with your credentials
7. **Expected:** Login succeeds and you're redirected to dashboard

### Test 2: Resend Verification Email

1. Create account but don't verify
2. Try to login - should be blocked
3. Click "Resend verification email"
4. Check inbox for new email
5. Click verification link
6. **Expected:** Verification succeeds

### Test 3: Password Reset

1. Go to login page
2. Click "Forgot password?"
3. Enter your email or username
4. Check inbox for password reset email
5. Click reset link
6. **Expected:** You should see password reset page (not "application taken offline")

---

## 🚨 Common Issues and Solutions

### Issue 1: "Application has been taken offline"

**Cause:** Site URL or Redirect URLs not configured correctly

**Solution:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set Site URL to your application URL
3. Add your application URL to Redirect URLs with `/**` wildcard
4. Save changes
5. Try verification link again

---

### Issue 2: Verification link redirects to wrong URL

**Cause:** Site URL is set to wrong domain

**Solution:**
1. Check Site URL in Supabase Dashboard
2. Ensure it matches your actual application URL
3. For local development, use `http://localhost:5173`
4. For production, use your actual domain

---

### Issue 3: "Invalid or expired verification link"

**Cause:** Token has expired (24 hours) or already used

**Solution:**
1. Go to login page
2. Click "Resend verification email"
3. Check inbox for new email
4. Click new verification link within 24 hours

---

### Issue 4: Verification succeeds but login still blocked

**Cause:** Email confirmation not properly recorded

**Solution:**
1. Check Supabase Dashboard → Authentication → Users
2. Find your user
3. Check if "Email Confirmed" is true
4. If false, manually confirm the email in dashboard
5. Or delete the user and sign up again

---

## 📱 Mobile App Configuration (Future)

If you plan to support mobile apps:

```
Redirect URLs:
https://your-domain.com/**
myapp://callback
myapp://verify-email
```

---

## 🔐 Security Best Practices

1. **Always use HTTPS in production**
   - Never use `http://` for Site URL in production
   - Use `https://` to ensure secure communication

2. **Limit Redirect URLs**
   - Only add URLs you control
   - Don't use wildcards like `*` without your domain
   - Be specific with allowed paths

3. **Regularly Review Configuration**
   - Check URL configuration monthly
   - Remove old/unused URLs
   - Update when domain changes

4. **Test After Changes**
   - Always test email verification after changing URLs
   - Test password reset flow
   - Test on both development and production

---

## 📝 Configuration Checklist

Before going live, ensure:

- [ ] Site URL is set to your production domain
- [ ] Redirect URLs include your production domain with `/**`
- [ ] Both `www` and non-`www` versions are added (if applicable)
- [ ] Email templates use `{{ .ConfirmationURL }}`
- [ ] SMTP settings are configured (see EMAIL_CONFIGURATION_GUIDE.md)
- [ ] Test email verification with real email
- [ ] Test password reset flow
- [ ] Test resend verification email
- [ ] Verify all links work without "application taken offline" error

---

## 🎯 Quick Fix Summary

**Problem:** "Application has been taken offline" error

**Solution:**
1. Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to: `https://your-domain.com` (or `http://localhost:5173` for dev)
3. Add to **Redirect URLs**: `https://your-domain.com/**`
4. Save changes
5. Test verification link again

---

## 📞 Need Help?

If you're still experiencing issues:

1. Check Supabase Auth Logs:
   - Dashboard → Logs → Auth Logs
   - Look for verification errors

2. Verify URL Configuration:
   - Dashboard → Authentication → URL Configuration
   - Ensure Site URL and Redirect URLs are correct

3. Test with Different Email:
   - Sometimes email providers cache links
   - Try with a different email address

4. Clear Browser Cache:
   - Cached redirects can cause issues
   - Clear cache and try again

5. Check Email Template:
   - Dashboard → Authentication → Email Templates
   - Ensure `{{ .ConfirmationURL }}` is used correctly

---

**Last Updated:** March 21, 2026  
**Application:** InvoxaPro (Internal Billing Management System)  
**Project ID:** aexewhy21fr5

---

## 🔗 Related Documentation

- [EMAIL_CONFIGURATION_GUIDE.md](./EMAIL_CONFIGURATION_GUIDE.md) - Configure sender email and SMTP
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
