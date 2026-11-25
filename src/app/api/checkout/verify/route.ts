import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { stripe } from "@/lib/stripe";
import { updateUserPlan } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    const ownerId =
      checkoutSession.client_reference_id || checkoutSession.metadata?.userId;

    if (ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      checkoutSession.payment_status === "paid" ||
      checkoutSession.status === "complete"
    ) {
      const profile = await updateUserPlan(
        session.user.id,
        "pro",
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : null,
        typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : null
      );
      return NextResponse.json({ verified: true, plan: profile.plan });
    }

    return NextResponse.json({ verified: false, status: checkoutSession.payment_status });
  } catch (error: any) {
    console.error("POST /api/checkout/verify error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
