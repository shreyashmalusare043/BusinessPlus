import axios from 'axios';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
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
    const { amount, planType } = JSON.parse(event.body);

    if (!amount || !planType) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Missing amount or planType',
        }),
      };
    }

    console.log(`Creating Razorpay order: ${planType} plan, ₹${amount}`);

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

    console.log('Order created:', response.data.id);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        success: true,
        order_id: response.data.id,
        key: RAZORPAY_KEY_ID,
      }),
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.response?.data?.error?.description || 'Failed to create order',
      }),
    };
  }
};