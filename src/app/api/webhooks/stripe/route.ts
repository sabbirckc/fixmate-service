import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/webhooks/stripe
 * Next.js Webhook endpoint per Section 5 of Stripe Payment Integration Guide
 */
export async function POST(req: Request) {
  const body = await req.text(); // Raw string for signature verification
  const signature = req.headers.get("stripe-signature");

  let event: any;
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error("[Stripe Webhook] Verification error:", err.message);
    return NextResponse.json(
      { error: "Invalid webhook signature: " + err.message },
      { status: 400 }
    );
  }

  // Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid") {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      try {
        await fetch(`${serverUrl}/api/payments/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: session.id,
            booking_id: session.metadata?.bookingId,
          }),
        });
        console.log(`[Stripe Webhook] Successfully processed session ${session.id}`);
      } catch (e: any) {
        console.error("[Stripe Webhook] Error forwarding to Express backend:", e.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
