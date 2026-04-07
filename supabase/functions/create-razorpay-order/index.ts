// @ts-ignore: Deno standard library import is resolved at runtime in Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, planType } = await req.json();

    // Validate input
    if (!amount || !planType) {
      return new Response(
        JSON.stringify({ error: "Missing amount or planType" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get Razorpay credentials from environment
    const env =
      (globalThis as any).Deno?.env ??
      ((globalThis as any).process?.env as Record<string, string | undefined>) ??
      {};
    const RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID;
    const RAZORPAY_SECRET =
      env.RAZORPAY_KEY_SECRET || env.RAZORPAY_SECRET;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
      return new Response(
        JSON.stringify({ error: "Razorpay credentials not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Create Razorpay order
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_SECRET}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
        notes: {
          plan_type: planType,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Razorpay error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create Razorpay order" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const razorpayOrder = await response.json();

    // Get current user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const supabaseUrl =
      env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
    const supabaseKey =
      env.SUPABASE_ANON_KEY ||
      env.VITE_SUPABASE_ANON_KEY ||
      "";

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Supabase environment not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Create transaction record with Razorpay order ID
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        transaction_id: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        razorpay_order_id: razorpayOrder.id,
        amount,
        plan_type: planType,
        status: "pending",
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Transaction creation error:", transactionError);
      return new Response(
        JSON.stringify({ error: "Failed to create transaction record" }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: razorpayOrder.id,
        transaction_id: transaction.transaction_id,
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
