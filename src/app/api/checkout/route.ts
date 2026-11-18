import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/checkout
 * Next.js API Route: Creates Stripe Checkout Session and returns hosted UI URL
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      bookingId,
      amount,
      serviceTitle,
      technicianName,
      category,
      serviceImage,
      customerEmail,
    } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Valid booking ID is required" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
    const parsedAmount = parseFloat(String(amount || 0));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "A valid positive payment amount is required" },
        { status: 400 }
      );
    }

    const unitAmountCents = Math.round(parsedAmount * 100);

    // Create Stripe Session via Stripe SDK per official Checkout Quickstart
    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `FixMate Repair: ${serviceTitle || "Appliance Service"}`,
              description: `Technician: ${technicianName || "Verified Tech"} | Category: ${category || "General"}`,
              ...(serviceImage && serviceImage.startsWith("https://") ? { images: [serviceImage] } : {}),
            },
            unit_amount: unitAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${appUrl}/payment/cancel?booking_id=${bookingId}`,
      metadata: {
        bookingId: String(bookingId),
        customerEmail: String(customerEmail || ""),
        technicianName: String(technicianName || ""),
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("[Next.js API /api/checkout] Error creating Stripe session:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create Stripe Checkout session",
      },
      { status: 500 }
    );
  }
}
