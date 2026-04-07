import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WelcomeEmailRequest {
  to: string;
  username: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, username }: WelcomeEmailRequest = await req.json();

    if (!to || !username) {
      throw new Error('Missing required fields: to, username');
    }

    // Email HTML content
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .feature-item { padding: 10px 0; border-bottom: 1px solid #eee; }
    .feature-item:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">Welcome to InvoxaPro! 🎉</h1>
    </div>
    <div class="content">
      <h2>Hello ${username},</h2>
      <p style="font-size: 16px;">Thank you for joining <strong>InvoxaPro</strong> - Your complete Internal Billing Management System!</p>
      
      <p>We're excited to have you on board. Your account has been successfully created and you can now start managing your business operations efficiently.</p>

      <div class="feature-list">
        <h3 style="margin-top: 0; color: #667eea;">What you can do with InvoxaPro:</h3>
        <div class="feature-item">✅ Create and manage professional bills with GST compliance</div>
        <div class="feature-item">✅ Generate purchase orders and delivery challans</div>
        <div class="feature-item">✅ Track inventory and stock levels</div>
        <div class="feature-item">✅ Manage customers and suppliers</div>
        <div class="feature-item">✅ Generate comprehensive reports and analytics</div>
        <div class="feature-item">✅ Monitor work tracking and operations</div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${req.headers.get('origin') || 'http://localhost:5173'}/login" class="button">Get Started Now</a>
      </div>

      <p style="margin-top: 30px;"><strong>Getting Started Tips:</strong></p>
      <ol style="line-height: 2;">
        <li>Complete your company setup with GST details</li>
        <li>Add your customers and suppliers</li>
        <li>Create your first bill or purchase order</li>
        <li>Explore the dashboard for insights</li>
      </ol>

      <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to reach out to our support team.</p>

      <p style="margin-top: 30px;">Best regards,<br><strong>The InvoxaPro Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2026 InvoxaPro. All rights reserved.</p>
      <p>Internal Billing Management System</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Try to send email using Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@invoxapro.com';
    const fromEmail = Deno.env.get('FROM_EMAIL') || adminEmail;

    console.log('Attempting to send welcome email to:', to);
    console.log('From email:', fromEmail);
    console.log('Resend API Key configured:', !!resendApiKey);

    if (resendApiKey) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `InvoxaPro <${fromEmail}>`,
          to: [to],
          subject: 'Welcome to InvoxaPro - Your Account is Ready!',
          html: emailBody,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.text();
        console.error('Resend API error:', errorData);
        throw new Error(`Failed to send email via Resend: ${errorData}`);
      }

      const resendData = await resendResponse.json();
      console.log('Welcome email sent successfully via Resend:', resendData);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Welcome email sent successfully',
          emailId: resendData.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      console.warn('RESEND_API_KEY not configured. Welcome email not sent.');
      console.warn('To enable welcome emails, please configure RESEND_API_KEY in Supabase secrets.');
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email service not configured. Please contact administrator.',
          warning: 'RESEND_API_KEY not set',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 to not block the signup process
        }
      );
    }
  } catch (error) {
    console.error('Error in send-welcome-email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
