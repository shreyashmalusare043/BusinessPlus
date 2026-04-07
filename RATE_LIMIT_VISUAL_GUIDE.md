# Rate Limit Feature - Visual Guide

## 🎨 What Users See

### Normal State (No Rate Limit)

```
┌─────────────────────────────────────┐
│         Login to InvoxaPro          │
├─────────────────────────────────────┤
│                                     │
│  Username or Email:                 │
│  ┌───────────────────────────────┐ │
│  │ john_doe                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  Password:                          │
│  ┌───────────────────────────────┐ │
│  │ ••••••••                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │         Login                 │ │ ← Normal button
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

### Rate Limit Triggered (Countdown Active)

```
┌─────────────────────────────────────┐
│         Login to InvoxaPro          │
├─────────────────────────────────────┤
│                                     │
│  Username or Email:                 │
│  ┌───────────────────────────────┐ │
│  │ john_doe                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  Password:                          │
│  ┌───────────────────────────────┐ │
│  │ ••••••••                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ⏰  Wait 45s                 │ │ ← Disabled with countdown
│  └───────────────────────────────┘ │
│                                     │
│  Too many attempts. Please wait     │
│  45 seconds before trying again.    │ ← Countdown message
│                                     │
└─────────────────────────────────────┘
```

---

### Toast Notification

```
┌─────────────────────────────────────┐
│  ⚠️  Too many attempts. Please      │
│      wait 60 seconds before         │
│      trying again.                  │
└─────────────────────────────────────┘
```

---

## 🔄 Countdown Animation

### Countdown Sequence (Updates Every Second)

```
Initial:  ⏰ Wait 60s
After 1s: ⏰ Wait 59s
After 2s: ⏰ Wait 58s
After 3s: ⏰ Wait 57s
...
After 57s: ⏰ Wait 3s
After 58s: ⏰ Wait 2s
After 59s: ⏰ Wait 1s
After 60s: Login  ← Button re-enabled
```

---

## 📱 All Forms with Rate Limit

### 1. Login Form

```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐ │
│  │  ⏰  Wait 45s                 │ │ ← Login button
│  └───────────────────────────────┘ │
│                                     │
│  Too many attempts. Please wait     │
│  45 seconds before trying again.    │
└─────────────────────────────────────┘
```

### 2. Signup Form

```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐ │
│  │  ⏰  Wait 38s                 │ │ ← Create Account button
│  └───────────────────────────────┘ │
│                                     │
│  Too many attempts. Please wait     │
│  38 seconds before trying again.    │
└─────────────────────────────────────┘
```

### 3. Resend Verification Email

```
┌─────────────────────────────────────┐
│  Didn't receive verification email? │
│  Wait 52s to resend                 │ ← Resend button (disabled)
└─────────────────────────────────────┘
```

### 4. Password Reset Form

```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐ │
│  │  ⏰  Wait 29s                 │ │ ← Send Reset Link button
│  └───────────────────────────────┘ │
│                                     │
│  Too many attempts. Please wait     │
│  29 seconds before trying again.    │
└─────────────────────────────────────┘
```

---

## 🎭 Button States

### State 1: Normal (Active)
```
┌───────────────────────────────┐
│         Login                 │  ← Blue, clickable
└───────────────────────────────┘
```

### State 2: Loading
```
┌───────────────────────────────┐
│  ⏳  Logging in...            │  ← Blue, disabled, spinner
└───────────────────────────────┘
```

### State 3: Rate Limited
```
┌───────────────────────────────┐
│  ⏰  Wait 45s                 │  ← Gray, disabled, clock icon
└───────────────────────────────┘
```

---

## 🎨 Color Scheme

### Normal Button
- Background: Primary blue (#0066cc)
- Text: White
- State: Enabled
- Cursor: Pointer

### Rate Limited Button
- Background: Muted gray (#e5e7eb)
- Text: Muted foreground (#6b7280)
- State: Disabled
- Cursor: Not-allowed
- Icon: Clock (⏰)

---

## 📊 User Journey

### Scenario: Multiple Failed Login Attempts

```
Step 1: User enters wrong password
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐ │
│  │         Login                 │ │ ← Click
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
Result: ❌ "Invalid credentials"

Step 2: User tries again (2nd attempt)
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐ │
│  │         Login                 │ │ ← Click
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
Result: ❌ "Invalid credentials"

Step 3: User tries again (3rd attempt)
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐ │
│  │         Login                 │ │ ← Click
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
Result: ❌ "Invalid credentials"

Step 4: User tries again (4th attempt)
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐ │
│  │         Login                 │ │ ← Click
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
Result: ❌ "Invalid credentials"

Step 5: User tries again (5th attempt)
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐ │
│  │         Login                 │ │ ← Click
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
Result: ⚠️ RATE LIMIT TRIGGERED!

Step 6: Rate limit active
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐ │
│  │  ⏰  Wait 60s                 │ │ ← Disabled
│  └───────────────────────────────┘ │
│                                     │
│  Too many attempts. Please wait     │
│  60 seconds before trying again.    │
└─────────────────────────────────────┘

Step 7: Wait 60 seconds (countdown updates every second)
⏰ Wait 60s → 59s → 58s → ... → 3s → 2s → 1s

Step 8: Countdown complete
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐ │
│  │         Login                 │ │ ← Re-enabled!
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
Result: ✅ User can try again
```

---

## 🎯 Key Visual Elements

### 1. Clock Icon (⏰)
- Appears on button during cooldown
- Indicates time-based restriction
- Universally recognized symbol

### 2. Countdown Timer
- Shows exact seconds remaining
- Updates in real-time
- Counts down to 0

### 3. Disabled State
- Gray background
- Muted text color
- Not-allowed cursor
- No hover effects

### 4. Countdown Message
- Below the button
- Explains why action is blocked
- Shows remaining time
- Muted text color

### 5. Toast Notification
- Appears at top/bottom of screen
- Warning icon (⚠️)
- Clear error message
- Auto-dismisses after 5 seconds

---

## 📱 Responsive Design

### Desktop View
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  ⏰  Wait 45s                             │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Too many attempts. Please wait 45 seconds     │
│  before trying again.                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Mobile View
```
┌───────────────────────┐
│                       │
│  ┌─────────────────┐ │
│  │  ⏰  Wait 45s   │ │
│  └─────────────────┘ │
│                       │
│  Too many attempts.   │
│  Please wait 45       │
│  seconds before       │
│  trying again.        │
│                       │
└───────────────────────┘
```

---

## 🎬 Animation Timeline

```
Time: 0s
Event: Rate limit triggered
Action: Show toast notification
Button: Changes to "⏰ Wait 60s"
Message: Appears below button

Time: 1s
Button: Updates to "⏰ Wait 59s"
Message: Updates to "59 seconds"

Time: 2s
Button: Updates to "⏰ Wait 58s"
Message: Updates to "58 seconds"

...

Time: 59s
Button: Updates to "⏰ Wait 1s"
Message: Updates to "1 second"

Time: 60s
Button: Changes to "Login"
Message: Disappears
State: Re-enabled
```

---

## 🎨 CSS Classes Used

### Button States
```css
/* Normal state */
.button-normal {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  cursor: pointer;
}

/* Disabled state (rate limited) */
.button-disabled {
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  cursor: not-allowed;
  opacity: 0.5;
}

/* Loading state */
.button-loading {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  cursor: wait;
}
```

### Countdown Message
```css
.countdown-message {
  font-size: 0.875rem;
  text-align: center;
  color: hsl(var(--muted-foreground));
  margin-top: 0.5rem;
}
```

---

## ✅ Accessibility

### Screen Reader Announcements
```
"Login button, disabled, wait 45 seconds"
"Too many attempts. Please wait 45 seconds before trying again"
```

### Keyboard Navigation
- Tab: Focus moves to next element (button is disabled)
- Enter/Space: No action (button is disabled)
- Escape: Closes any open dialogs

### Visual Indicators
- ✅ Color change (blue → gray)
- ✅ Icon change (none → clock)
- ✅ Text change (Login → Wait Xs)
- ✅ Cursor change (pointer → not-allowed)
- ✅ Message appears below button

---

**Last Updated:** March 21, 2026  
**Application:** InvoxaPro (Internal Billing Management System)  
**Feature:** Rate Limit Handling with Countdown Timer
