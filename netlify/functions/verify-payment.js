import crypto from 'crypto';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export const handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(event.body);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Missing payment details',
        }),
      };
    }

    console.log(`Verifying payment: ${razorpay_payment_id}`);

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Payment verification failed: Signature mismatch');
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Invalid payment signature',
        }),
      };
    }

    console.log('Payment verified successfully');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        success: true,
        message: 'Payment verified',
      }),
    };
  } catch (error) {
    console.error('Payment verification error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Payment verification failed',
      }),
    };
  }
};