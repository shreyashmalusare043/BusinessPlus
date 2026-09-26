// @ts-ignore Supabase Edge Functions resolve this URL import in the Deno runtime.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const escapeHtml = (value: unknown): string => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, customerEmail, customerName, billNo, amount, companyName, pdfBase64, pdfFilename } = await req.json();

    if (!customerEmail || !customerName || !billNo || amount === undefined) {
      return new Response(
        JSON.stringify({ error: 'Payment email details are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const isConfirmation = type === 'confirmation';
    const senderCompanyName = escapeHtml(companyName || 'Business Plus');
    const safeCustomerName = escapeHtml(customerName);
    const safeBillNo = escapeHtml(billNo);
    const formattedAmount = Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const statusLabel = isConfirmation ? 'Payment Received' : 'Payment Reminder';
    const statusMessage = isConfirmation
      ? 'Thank you. We have received your payment for the invoice below.'
      : 'This is a friendly reminder that payment is due for the invoice below.';
    const subject = isConfirmation
      ? `${companyName || 'Business Plus'} | Payment Confirmation | Bill ${billNo}`
      : `${companyName || 'Business Plus'} | Payment Reminder | Bill ${billNo}`;
    const emailBody = `
      <div style="margin:0; padding:0; background:#f3f4f6; font-family:Arial,Helvetica,sans-serif; color:#1f2937;">
        <div style="max-width:640px; margin:0 auto; padding:28px 16px;">
          <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden;">
            <div style="background:#172033; padding:28px 32px; color:#ffffff;">
              <div style="font-size:22px; font-weight:700;">${senderCompanyName}</div>
              <div style="margin-top:8px; font-size:13px; color:#cbd5e1;">Invoice communication</div>
            </div>
            <div style="padding:32px;">
              <div style="display:inline-block; padding:7px 12px; border-radius:999px; background:${isConfirmation ? '#dcfce7' : '#fff7ed'}; color:${isConfirmation ? '#166534' : '#c2410c'}; font-size:12px; font-weight:700;">${statusLabel}</div>
              <h1 style="margin:20px 0 10px; font-size:24px; color:#111827;">Hello ${safeCustomerName},</h1>
              <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#4b5563;">${statusMessage}</p>
              <table role="presentation" style="width:100%; border-collapse:collapse; margin:0 0 24px; border:1px solid #e5e7eb; border-radius:8px;">
                <tr><td style="padding:14px 16px; color:#6b7280; border-bottom:1px solid #e5e7eb;">Bill number</td><td style="padding:14px 16px; text-align:right; font-weight:700; border-bottom:1px solid #e5e7eb;">${safeBillNo}</td></tr>
                <tr><td style="padding:16px; color:#6b7280;">Amount</td><td style="padding:16px; text-align:right; font-size:20px; font-weight:700; color:#ea580c;">₹${formattedAmount}</td></tr>
              </table>
              <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#4b5563;">A copy of the bill is attached to this email for your records.</p>
              <p style="margin:0; font-size:14px; line-height:1.6; color:#4b5563;">Regards,<br><strong style="color:#111827;">${senderCompanyName}</strong></p>
            </div>
            <div style="padding:18px 32px; background:#f9fafb; border-top:1px solid #e5e7eb; font-size:12px; line-height:1.5; color:#6b7280;">This is an automated email from ${senderCompanyName}. Please keep the attached bill for your records.</div>
          </div>
        </div>
      </div>
    `;
    const denoRuntime = (globalThis as typeof globalThis & {
      Deno: { env: { get(name: string): string | undefined } };
    }).Deno;
    const resendApiKey = denoRuntime.env.get('RESEND_API_KEY');
    const fromEmail = 'account@business-plus.in';

    if (!resendApiKey) {
      throw new Error('Email service is not configured');
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${companyName || 'Business Plus'} <${fromEmail}>`,
        to: [customerEmail],
        subject,
        html: emailBody,
        ...(pdfBase64 ? {
          attachments: [{
            filename: pdfFilename || `Bill_${billNo}.pdf`,
            content: pdfBase64,
          }],
        } : {}),
      }),
    });

    if (!resendResponse.ok) {
      throw new Error(`Failed to send email: ${await resendResponse.text()}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send payment email';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
