import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureUserProfile } from "@/lib/db";
import { stripe, isMockPaymentsEnabled } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const origin =
      req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (isMockPaymentsEnabled) {
      return NextResponse.json({ url: `${origin}/dashboard?portal=demo` });
    }

    const profile = await ensureUserProfile(session.user.id);

    if (!profile.stripe_customer_id) {
      return NextResponse.json({ url: `${origin}/pricing` });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/profile`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Portal session error:", error);
    const origin = req.headers.get("origin") || "http://localhost:3000";
    return NextResponse.json({ url: `${origin}/profile` });
  }
}
