import { NextRequest, NextResponse } from "next/server";
import { stripe, isMockPaymentsEnabled } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (isMockPaymentsEnabled) {
      return NextResponse.json({ url: `${origin}/dashboard?portal=demo` });
    }

    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json({ url: `${origin}/pricing` });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Portal session error:", error);
    const origin = req.headers.get("origin") || "http://localhost:3000";
    return NextResponse.json({ url: `${origin}/dashboard` });
  }
}
