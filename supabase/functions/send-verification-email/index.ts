import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  username: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, username, userId }: EmailRequest = await req.json();

    if (!to || !username || !userId) {
      throw new Error('Missing required fields: to, username, userId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token in database
    const { error: dbError } = await supabase.from('email_verifications').insert({
      user_id: userId,
      email: to,
      username: username,
      token: verificationToken,
      expires_at: expiresAt.toISOString(),
      verified: false,
    });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to create verification record');
    }

    // Create verification link
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const verificationLink = `${origin}/verify-email?token=${verificationToken}`;

    // Email HTML content
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    .link { word-break: break-all; color: #667eea; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to InvoxaPro!</h1>
    </div>
    <div class="content">
      <h2>Hello ${username},</h2>
      <p>Thank you for signing up for InvoxaPro - Internal Billing Management System.</p>
      <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
      <div style="text-align: center;">
        <a href="${verificationLink}" class="button">Verify Email Address</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p class="link">${verificationLink}</p>
      <p><strong>This link will expire in 24 hours.</strong></p>
      <p>If you didn't create an account with InvoxaPro, please ignore this email.</p>
      <p>Best regards,<br>The InvoxaPro Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 InvoxaPro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Try to send email using Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('GMAIL_USER') || 'onboarding@resend.dev';

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
          subject: 'Verify Your Email - InvoxaPro',
          html: emailBody,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.text();
        console.error('Resend API error:', errorData);
        throw new Error('Failed to send email via Resend');
      }

      const resendData = await resendResponse.json();
      console.log('Email sent successfully via Resend:', resendData);
    } else {
      console.log('No email service configured. Verification link:', verificationLink);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.',
        verificationLink: verificationLink, // For testing purposes
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-verification-email:', error);
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
