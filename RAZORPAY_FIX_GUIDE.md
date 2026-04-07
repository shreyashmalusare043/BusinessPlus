# RAZORPAY FIX - COMPLETE SETUP GUIDE

## What Was Wrong
1. ❌ Using custom transaction ID as Razorpay order_id (Razorpay needs real order IDs)
2. ❌ Hardcoded API key (security risk)
3. ❌ No backend order creation

## What I Fixed
✅ Created backend function: `create-razorpay-order` - creates real Razorpay orders
✅ Created backend function: `get-razorpay-key` - securely serves API key
✅ Updated SubscriptionPage to call backend first
✅ Now using proper Razorpay order IDs

## Setup Steps

### 1️⃣ Get Your Razorpay Credentials

1. Go to: https://dashboard.razorpay.com/
2. Login to your account
3. Click "Settings" → "API Keys"
4. Copy your:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Secret** (keep this private!)

### 2️⃣ Add Credentials to Supabase

Run in terminal (from project root):

```bash
# For test mode
supabase secrets set RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
supabase secrets set RAZORPAY_SECRET=your_secret_here

# OR for live mode (production)
supabase secrets set RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_HERE
supabase secrets set RAZORPAY_SECRET=your_secret_here
```

Replace `YOUR_KEY_HERE` and `your_secret_here` with actual values.

### 3️⃣ Deploy Supabase Functions

```bash
# Deploy the new functions
supabase functions deploy create-razorpay-order
supabase functions deploy get-razorpay-key
```

### 4️⃣ Update Your .env File

Make sure your `.env` (or `.env.local`) has:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 5️⃣ Test the Flow

1. Go to Subscription page
2. Click "Subscribe Now"
3. Agree to refund policy
4. Should show Razorpay payment modal
5. Try test card: `4111 1111 1111 1111` (test mode only)

## Troubleshooting

### Error: "Failed to create payment order"
- ✅ Check Supabase secrets are set: `supabase secrets list`
- ✅ Check functions deployed: `supabase functions list`
- ✅ Check browser console for detailed error

### Error: "Razorpay key not configured"
- Run: `supabase secrets set RAZORPAY_KEY_ID=your_key`

### Error: "Failed to create transaction record"
- ✅ Check Supabase auth is working
- ✅ Check transactions table exists
- ✅ Check your profile is authenticated

### Payment Modal Shows But Closes Immediately
- ✅ Check order_id is valid
- ✅ Check amount is > 0
- ✅ Check currency is 'INR'

## Files Changed

1. ✅ Created: `supabase/functions/create-razorpay-order/index.ts`
2. ✅ Created: `supabase/functions/get-razorpay-key/index.ts`
3. ✅ Updated: `src/pages/SubscriptionPage.tsx`

## Security Notes

🔒 API keys are now stored in Supabase Secrets (secure)
🔒 Keys never exposed to frontend
🔒 Order verification ensures legitimate payments
🔒 Always use HTTPS in production

## Test Card Numbers (Test Mode Only)

- **Visa**: 4111 1111 1111 1111
- **Mastercard**: 5555 5555 5555 5555
- Expiry: Any future date
- CVV: Any 3 digits

## Support

If issues persist:
1. Check browser DevTools → Network tab
2. Check Supabase Edge Functions logs
3. Verify Razorpay credentials are correct
