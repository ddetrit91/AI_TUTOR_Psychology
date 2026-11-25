import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { updateUserPlan } from "@/lib/db";

const DEFAULT_USER_ID = "default-user";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.userId || DEFAULT_USER_ID;
      await updateUserPlan(
        userId,
        "pro",
        typeof session.customer === "string" ? session.customer : null,
        typeof session.subscription === "string" ? session.subscription : null
      );
      console.log(`✅ Subscription checkout completed for user=${userId}, session=${session.id}`);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId || DEFAULT_USER_ID;
      const isActive = subscription.status === "active" || subscription.status === "trialing";
      await updateUserPlan(
        userId,
        isActive ? "pro" : "free",
        typeof subscription.customer === "string" ? subscription.customer : null,
        subscription.id
      );
      console.log(`ℹ️ Subscription updated for user=${userId}: ${subscription.status}`);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId || DEFAULT_USER_ID;
      await updateUserPlan(userId, "free", null, null);
      console.log(`❌ Subscription cancelled for user=${userId}`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
