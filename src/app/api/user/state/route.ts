import { NextRequest, NextResponse } from "next/server";
import {
  ensureUserProfile,
  getCompletedLessons,
  getActionSteps,
  updateUserPlan,
  updateUserQuota,
  addCompletedLesson,
  upsertActionStep,
} from "@/lib/db";

const DEFAULT_USER_ID = "default-user";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || DEFAULT_USER_ID;

    const [profile, completedLessons, rawSteps] = await Promise.all([
      ensureUserProfile(userId),
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
      plan: profile.plan,
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
    const body = await req.json();
    const userId = body.userId || DEFAULT_USER_ID;
    const { action } = body;

    switch (action) {
      case "setPlan": {
        const plan = body.plan === "pro" ? "pro" : "free";
        const profile = await updateUserPlan(userId, plan);
        return NextResponse.json({ plan: profile.plan });
      }
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
