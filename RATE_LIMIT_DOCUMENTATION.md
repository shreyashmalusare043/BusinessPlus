# Rate Limit Handling Documentation

## Overview
InvoxaPro implements graceful rate limit handling to protect against abuse while providing a smooth user experience. When users exceed Supabase's authentication rate limits, the system automatically displays a countdown timer and temporarily disables authentication actions.

---

## 🔒 What is Rate Limiting?

Rate limiting is a security feature that prevents abuse by limiting the number of authentication requests a user can make within a specific time period. Supabase Auth implements rate limiting to protect against:

- Brute force login attempts
- Spam account creation
- Email flooding (verification/reset emails)
- Denial of service attacks

---

## ⏱️ Rate Limit Behavior

### Default Supabase Rate Limits:
- **Email sending**: 3-4 emails per hour per email address
- **Login attempts**: Multiple failed attempts trigger cooldown
- **Signup attempts**: Multiple signups from same IP trigger cooldown
- **Password reset**: Multiple reset requests trigger cooldown

### Cooldown Period:
- **Duration**: 60 seconds
- **Applies to**: All authentication actions (login, signup, resend verification, password reset)
- **Automatic reset**: Countdown automatically expires after 60 seconds

---

## 🎨 User Experience

### When Rate Limit is Hit:

1. **Error Message**:
   ```
   Too many attempts. Please wait 60 seconds before trying again.
   ```

2. **Button State**:
   - Button text changes to: `Wait 60s`, `Wait 59s`, `Wait 58s`, etc.
   - Clock icon (⏰) appears on the button
   - Button is disabled and cannot be clicked

3. **Visual Feedback**:
   - Countdown message appears below the button
   - Real-time countdown updates every second
   - Clear indication of remaining wait time

4. **After Cooldown**:
   - Button automatically re-enables
   - Text returns to normal: "Login", "Create Account", etc.
   - User can try again

---

## 🔧 Implementation Details

### Pages with Rate Limit Handling:

1. **LoginPage.tsx**:
   - Login form
   - Signup form
   - Resend verification email button

2. **ForgotPasswordPage.tsx**:
   - Password reset form

### Technical Implementation:

```typescript
// State management
const [rateLimitCooldown, setRateLimitCooldown] = useState(0);

// Countdown timer
useEffect(() => {
  if (rateLimitCooldown > 0) {
    const timer = setTimeout(() => {
      setRateLimitCooldown(rateLimitCooldown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [rateLimitCooldown]);

// Error detection
const handleRateLimitError = (error: any) => {
  if (error.message?.includes('rate limit') || 
      error.message?.includes('too many requests')) {
    setRateLimitCooldown(60);
    toast.error('Too many attempts. Please wait 60 seconds before trying again.');
    return true;
  }
  return false;
};

// Button state
<Button 
  type="submit" 
  disabled={loading || rateLimitCooldown > 0}
>
  {rateLimitCooldown > 0 && <Clock className="mr-2 h-4 w-4" />}
  {rateLimitCooldown > 0 ? `Wait ${rateLimitCooldown}s` : 'Login'}
</Button>
```

---

## 📊 Rate Limit Scenarios

### Scenario 1: Multiple Login Attempts
**Trigger**: User tries to login with wrong password multiple times  
**Result**: After 3-5 failed attempts, rate limit kicks in  
**User sees**: "Wait 60s" on Login button  
**Resolution**: Wait 60 seconds, then try again with correct password

### Scenario 2: Resending Verification Emails
**Trigger**: User clicks "Resend verification email" multiple times  
**Result**: After 3-4 resend attempts, rate limit kicks in  
**User sees**: "Wait 60s to resend" on Resend button  
**Resolution**: Wait 60 seconds, then resend email

### Scenario 3: Multiple Signup Attempts
**Trigger**: User tries to create multiple accounts quickly  
**Result**: After 2-3 signup attempts, rate limit kicks in  
**User sees**: "Wait 60s" on Create Account button  
**Resolution**: Wait 60 seconds, then complete signup

### Scenario 4: Password Reset Spam
**Trigger**: User requests password reset multiple times  
**Result**: After 3-4 reset requests, rate limit kicks in  
**User sees**: "Wait 60s" on Send Reset Link button  
**Resolution**: Wait 60 seconds, then request reset

---

## 🛡️ Security Benefits

1. **Prevents Brute Force Attacks**:
   - Limits login attempts to prevent password guessing
   - Forces attackers to wait between attempts

2. **Prevents Email Spam**:
   - Limits verification/reset emails to prevent inbox flooding
   - Protects email reputation

3. **Prevents Account Creation Spam**:
   - Limits signup attempts to prevent fake account creation
   - Reduces database pollution

4. **Protects Server Resources**:
   - Prevents excessive API calls
   - Reduces server load

---

## 🎯 Best Practices for Users

### To Avoid Rate Limits:

1. **Double-check credentials before submitting**:
   - Verify username/email is correct
   - Ensure password is typed correctly
   - Use password manager to avoid typos

2. **Don't spam buttons**:
   - Click submit button only once
   - Wait for response before trying again
   - Don't repeatedly click "Resend verification email"

3. **Check spam folder first**:
   - Verification emails might be in spam
   - Check spam before requesting resend

4. **Use correct email address**:
   - Ensure email is typed correctly during signup
   - Verify email before submitting

---

## 🔧 Adjusting Rate Limits (Admin)

Rate limits are configured in Supabase Dashboard. To adjust:

### Option 1: Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard
2. Select project: **InvoxaPro (aexewhy21fr5)**
3. Navigate to: **Authentication** → **Rate Limits**
4. Adjust limits as needed:
   - Email rate limit (emails per hour)
   - Authentication rate limit (attempts per minute)
   - Anonymous sign-ins rate limit

### Option 2: Contact Supabase Support
For custom rate limit configurations, contact Supabase support with your requirements.

---

## 🧪 Testing Rate Limits

### Test 1: Login Rate Limit
1. Try to login with wrong password 5 times quickly
2. **Expected**: After 3-5 attempts, see "Wait 60s" on Login button
3. Wait for countdown to reach 0
4. **Expected**: Button re-enables automatically

### Test 2: Resend Verification Rate Limit
1. Click "Resend verification email" 4 times quickly
2. **Expected**: After 3-4 clicks, see "Wait 60s to resend"
3. Wait for countdown to reach 0
4. **Expected**: Button re-enables automatically

### Test 3: Signup Rate Limit
1. Try to create multiple accounts quickly
2. **Expected**: After 2-3 attempts, see "Wait 60s" on Create Account button
3. Wait for countdown to reach 0
4. **Expected**: Button re-enables automatically

---

## 🐛 Troubleshooting

### Issue: Rate limit triggered too easily

**Possible Causes**:
- Multiple users behind same IP (office/school network)
- Browser extensions interfering with requests
- Network issues causing request retries

**Solutions**:
1. Wait for cooldown to expire (60 seconds)
2. Try from different network/device
3. Disable browser extensions
4. Contact admin to adjust rate limits

---

### Issue: Countdown not appearing

**Possible Causes**:
- JavaScript disabled in browser
- Browser compatibility issue
- Cache issue

**Solutions**:
1. Enable JavaScript in browser
2. Clear browser cache and reload
3. Try different browser
4. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

### Issue: Button stays disabled after countdown

**Possible Causes**:
- Page state issue
- Browser tab was inactive during countdown

**Solutions**:
1. Refresh the page
2. Clear form and try again
3. Close and reopen browser tab

---

## 📈 Monitoring Rate Limits

### For Administrators:

1. **Check Supabase Logs**:
   - Dashboard → Logs → Auth Logs
   - Look for rate limit errors
   - Identify patterns of abuse

2. **Monitor User Reports**:
   - Track user complaints about rate limits
   - Adjust limits if legitimate users are affected

3. **Review Rate Limit Settings**:
   - Periodically review rate limit configuration
   - Adjust based on usage patterns
   - Balance security vs. user experience

---

## 🎓 User Education

### Inform Users:

1. **During Onboarding**:
   - Explain rate limits in welcome email
   - Provide tips to avoid triggering limits

2. **In Help Documentation**:
   - Document rate limit behavior
   - Provide troubleshooting steps

3. **Error Messages**:
   - Clear, user-friendly error messages
   - Explain why rate limit was triggered
   - Tell users exactly how long to wait

---

## 📝 Summary

✅ **Implemented**: Graceful rate limit handling with countdown timer  
✅ **Coverage**: Login, Signup, Resend Verification, Password Reset  
✅ **User Experience**: Clear visual feedback with exact wait time  
✅ **Security**: Protects against brute force and spam attacks  
✅ **Automatic**: Countdown expires and re-enables buttons automatically  
✅ **Consistent**: Same behavior across all authentication actions  

---

**Last Updated:** March 21, 2026  
**Application:** InvoxaPro (Internal Billing Management System)  
**Project ID:** aexewhy21fr5
