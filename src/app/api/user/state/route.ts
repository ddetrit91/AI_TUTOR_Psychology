import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import {
  ensureUserProfile,
  getCompletedLessons,
  getActionSteps,
  updateUserQuota,
  addCompletedLesson,
  upsertActionStep,
} from "@/lib/db";

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const [profile, completedLessons, rawSteps] = await Promise.all([
      ensureUserProfile(userId, { email: session.user.email, name: session.user.name }),
      getCompletedLessons(userId),
      getActionSteps(userId),
    ]);

    const savedSteps = rawSteps.map((s) => ({
      id: s.id,
      lessonId: s.lesson_id,
      title: s.title,
      description: s.description,
      checked: s.checked,
      userReflection: s.user_reflection || undefined,
      proFeedback: s.pro_feedback || undefined,
      verifiedAt: s.verified_at || undefined,
    }));

    return NextResponse.json({
      userId: profile.user_id,
      email: profile.email || session.user.email,
      name: profile.name || session.user.name,
      plan: profile.plan,
      hasStripeCustomer: Boolean(profile.stripe_customer_id),
      freeSecondsRemaining: profile.free_seconds_remaining,
      lastNoonReset: profile.last_noon_reset,
      completedLessons,
      savedSteps,
    });
  } catch (error: any) {
    console.error("GET /api/user/state error:", error);
    return NextResponse.json(
      { error: "Database error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "syncQuota": {
        const profile = await updateUserQuota(
          userId,
          Number(body.freeSecondsRemaining ?? 600),
          body.resetTimestamp
        );
        return NextResponse.json({
          freeSecondsRemaining: profile.free_seconds_remaining,
          lastNoonReset: profile.last_noon_reset,
        });
      }
      case "completeLesson": {
        const completedLessons = await addCompletedLesson(userId, String(body.lessonId));
        return NextResponse.json({ completedLessons });
      }
      case "upsertStep": {
        const rawSteps = await upsertActionStep(userId, body.step);
        const savedSteps = rawSteps.map((s) => ({
          id: s.id,
          lessonId: s.lesson_id,
          title: s.title,
          description: s.description,
          checked: s.checked,
          userReflection: s.user_reflection || undefined,
          proFeedback: s.pro_feedback || undefined,
          verifiedAt: s.verified_at || undefined,
        }));
        return NextResponse.json({ savedSteps });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("POST /api/user/state error:", error);
    return NextResponse.json(
      { error: "Database error", details: error.message },
      { status: 500 }
    );
  }
}
