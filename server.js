import express from 'express';
import cors from 'cors';
import axios from 'axios';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Razorpay credentials
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error('❌ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in .env');
  process.exit(1);
}

console.log('✅ Razorpay credentials loaded');
console.log('   Key ID:', RAZORPAY_KEY_ID.substring(0, 10) + '...');

// Create Razorpay Order
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount, planType } = req.body;

    if (!amount || !planType) {
      return res.status(400).json({
        success: false,
        error: 'Missing amount or planType',
      });
    }

    console.log(`\n📝 Creating Razorpay order: ${planType} plan, ₹${amount}`);

    // Create order via Razorpay API
    const response = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          plan_type: planType,
        },
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );

    console.log('✅ Order created:', response.data.id);

    res.json({
      success: true,
      order_id: response.data.id,
      key: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('❌ Razorpay order creation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.description || 'Failed to create order',
    });
  }
});

// Verify Payment Signature
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment details',
      });
    }

    console.log(`\n🔐 Verifying payment: ${razorpay_payment_id}`);

    // Verify signature using crypto
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Payment verification failed: Signature mismatch');
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
      });
    }

    console.log('✅ Payment verified successfully');

    res.json({
      success: true,
      message: 'Payment verified',
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', razorpay: 'Configured' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Razorpay Backend Server running on http://localhost:${PORT}`);
  console.log(`📍 API Base: http://localhost:${PORT}/api/razorpay`);
  console.log('\n✨ Ready to process payments!\n');
});
