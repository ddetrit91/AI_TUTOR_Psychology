import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureUserProfile, updateUserPlan } from "@/lib/db";
import { stripe, STRIPE_PRO_PLAN, isMockPaymentsEnabled } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Войдите или зарегистрируйтесь для оформления подписки" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const profile = await ensureUserProfile(userId, {
      email: session.user.email,
      name: session.user.name,
    });

    const origin =
      req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (isMockPaymentsEnabled) {
      await updateUserPlan(userId, "pro");
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

    const checkoutSession = await stripe.checkout.sessions.create({
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
      client_reference_id: userId,
      ...(profile.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : session.user.email
        ? { customer_email: session.user.email }
        : {}),
      subscription_data: {
        metadata: {
          plan: "pro",
          userId,
        },
      },
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?payment=cancelled`,
      metadata: {
        plan: "pro",
        userId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url, isMock: false });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "STRIPE_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
