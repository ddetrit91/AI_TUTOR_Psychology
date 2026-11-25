import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureUserProfile } from "@/lib/db";
import { verifyActionStepAI } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await ensureUserProfile(session.user.id);
    if (profile.plan !== "pro") {
      return NextResponse.json(
        {
          error: "PRO_REQUIRED",
          message: "Проверка шагов действий AI доступна исключительно на тарифе Pro.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { stepTitle, userReflection } = body;

    if (!stepTitle) {
      return NextResponse.json({ error: "stepTitle is required" }, { status: 400 });
    }

    const evaluation = await verifyActionStepAI(stepTitle, userReflection || "");

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error("Verify steps API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
