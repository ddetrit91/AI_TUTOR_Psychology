import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { updateUserPlan, updateUserPlanByStripe } from "@/lib/db";

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
      const userId = session.client_reference_id || session.metadata?.userId;
      const customerId = typeof session.customer === "string" ? session.customer : null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      if (userId) {
        await updateUserPlan(userId, "pro", customerId, subscriptionId);
      } else {
        await updateUserPlanByStripe("pro", customerId, subscriptionId);
      }
      console.log(`✅ Subscription checkout completed for user=${userId || customerId}`);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : null;
      const isActive =
        subscription.status === "active" || subscription.status === "trialing";
      const plan = isActive ? "pro" : "free";

      if (userId) {
        await updateUserPlan(userId, plan, customerId, subscription.id);
      } else {
        await updateUserPlanByStripe(plan, customerId, subscription.id);
      }
      console.log(`ℹ️ Subscription updated for user=${userId || customerId}: ${subscription.status}`);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : null;

      if (userId) {
        await updateUserPlan(userId, "free", customerId, null);
      } else {
        await updateUserPlanByStripe("free", customerId, subscription.id);
      }
      console.log(`❌ Subscription cancelled for user=${userId || customerId}`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
