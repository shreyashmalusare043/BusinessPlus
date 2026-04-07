# 🚀 Quick Start: Email Verification Setup

## ⚡ Fix "Application Taken Offline" Error (5 Minutes)

### Step 1: Configure URLs in Supabase
1. Open: https://supabase.com/dashboard
2. Select project: **InvoxaPro (aexewhy21fr5)**
3. Go to: **Authentication** → **URL Configuration**

### Step 2: Set Site URL
**For Development:**
```
Site URL: http://localhost:5173
```

**For Production:**
```
Site URL: https://your-actual-domain.com
```

### Step 3: Add Redirect URLs
**For Development:**
```
http://localhost:5173/**
```

**For Production:**
```
https://your-actual-domain.com/**
```

### Step 4: Save and Test
1. Click **Save**
2. Create a new test account
3. Check email and click verification link
4. Should see "Email Verified!" page (not "application taken offline")
5. Click "Continue to Login"
6. Login successfully

---

## 📧 Configure Sender Email (Optional - 10 Minutes)

### Option 1: Use Gmail (Easiest)
1. Go to: **Authentication** → **Settings** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Fill in:
   ```
   Host: smtp.gmail.com
   Port: 587
   User: your-email@gmail.com
   Password: [Create App Password in Google Account]
   Sender Email: noreply@yourdomain.com
   Sender Name: InvoxaPro
   ```
4. Save

### Option 2: Use Supabase Default
- No configuration needed
- Emails sent from Supabase's servers
- Works immediately

---

## ✅ Verification Flow (How It Works)

1. **User Signs Up** → Enters username, email, password
2. **Email Sent** → Verification email sent to user's real email
3. **User Clicks Link** → Opens verification page
4. **Email Verified** → Shows success message
5. **User Logs In** → Can now access the system

---

## 🔧 Troubleshooting

### Problem: "Application taken offline"
**Solution:** Configure Site URL and Redirect URLs (see Step 1-3 above)

### Problem: Not receiving emails
**Solution:** Check spam folder or configure custom SMTP

### Problem: "Invalid verification link"
**Solution:** Link expired (24 hours). Click "Resend verification email" on login page

### Problem: "Too many attempts. Please wait 60 seconds"
**Solution:** Rate limit triggered. Wait for countdown timer to reach 0, then try again. See RATE_LIMIT_DOCUMENTATION.md for details.

---

## 📚 Full Documentation

- **SUPABASE_URL_CONFIGURATION.md** - Complete URL setup guide
- **EMAIL_CONFIGURATION_GUIDE.md** - Complete email setup guide
- **RATE_LIMIT_DOCUMENTATION.md** - Rate limit handling and troubleshooting
- **TODO.md** - Full implementation details

---

## 🎯 Current Status

✅ Email verification is MANDATORY  
✅ Users receive emails on real addresses  
✅ Verification page handles Supabase callback  
✅ Login blocked until email verified  
✅ Resend verification email available  
✅ Rate limit handling with countdown timer  
✅ Complete documentation provided  

⚠️ **ACTION REQUIRED:**  
Configure Site URL and Redirect URLs in Supabase Dashboard (5 minutes)

---

**Last Updated:** March 21, 2026  
**Application:** InvoxaPro
