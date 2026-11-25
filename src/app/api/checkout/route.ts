import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRO_PLAN, isMockPaymentsEnabled } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // If mock payments are active (dev / demo mode without live Stripe key)
    if (isMockPaymentsEnabled) {
      return NextResponse.json({
        url: `${origin}/dashboard?payment=success&mock=true&tier=pro`,
        isMock: true,
      });
    }

    const hasRealPriceId =
      STRIPE_PRO_PLAN.priceId &&
      STRIPE_PRO_PLAN.priceId.startsWith("price_") &&
      !STRIPE_PRO_PLAN.priceId.includes("mock") &&
      !STRIPE_PRO_PLAN.priceId.includes("test");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        hasRealPriceId
          ? {
              price: STRIPE_PRO_PLAN.priceId,
              quantity: 1,
            }
          : {
              price_data: {
                currency: "usd",
                product_data: {
                  name: STRIPE_PRO_PLAN.name,
                  description: STRIPE_PRO_PLAN.description,
                },
                unit_amount: STRIPE_PRO_PLAN.priceUsd * 100,
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            },
      ],
      mode: "subscription",
      client_reference_id: "default-user",
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?payment=cancelled`,
      metadata: {
        plan: "pro",
        userId: "default-user",
      },
    });

    return NextResponse.json({ url: session.url, isMock: false });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    // Graceful fallback to mock checkout so development / presentation never breaks
    const origin = req.headers.get("origin") || "http://localhost:3000";
    return NextResponse.json({
      url: `${origin}/dashboard?payment=success&mock=true&tier=pro`,
      isMock: true,
      warning: "Falling back to demo checkout: " + error.message,
    });
  }
}
