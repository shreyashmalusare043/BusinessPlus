import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { gstNumber } = await req.json();

    if (!gstNumber) {
      return new Response(
        JSON.stringify({ error: 'GST number is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate GST number format (15 characters)
    if (gstNumber.length !== 15) {
      return new Response(
        JSON.stringify({ error: 'Invalid GST number format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Mock GST API response for demonstration
    // In production, replace this with actual GST API integration
    // Example: https://gst.api.gov.in/taxpayerapi/v1.0/taxpayersearch
    
    const mockGSTData = {
      legal_name: `${gstNumber.substring(2, 12)} Private Limited`,
      trade_name: `${gstNumber.substring(2, 12)} Pvt Ltd`,
      address: `${Math.floor(Math.random() * 999) + 1}, Business District, ${['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'][Math.floor(Math.random() * 5)]}, India - ${Math.floor(Math.random() * 900000) + 100000}`,
      status: 'Active',
    };

    return new Response(
      JSON.stringify(mockGSTData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch GST details' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
