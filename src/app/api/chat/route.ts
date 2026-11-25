import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { generateCoachResponse } from "@/lib/gemini";
import { ensureUserProfile, getCoachMessages, saveCoachMessage } from "@/lib/db";

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await getCoachMessages(session.user.id, 50);
    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("GET /api/chat error:", error);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const profile = await ensureUserProfile(userId, {
      email: session.user.email,
      name: session.user.name,
    });
    const isPro = profile.plan === "pro";

    const body = await req.json();
    const { messages, stateDetails, freeSecondsRemaining } = body;

    // Enforce server-side and client-side quota for Free users
    const effectiveRemaining =
      typeof freeSecondsRemaining === "number"
        ? Math.min(profile.free_seconds_remaining, freeSecondsRemaining)
        : profile.free_seconds_remaining;

    if (!isPro && effectiveRemaining <= 0) {
      return NextResponse.json(
        {
          error: "DAILY_LIMIT_REACHED",
          message:
            "Ваш ежедневный лимит практики (10 минут) исчерпан. Лимит автоматически сбросится сегодня в 12:00 (полдень) или вы можете перейти на Pro для неограниченного доступа.",
        },
        { status: 429 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const formattedHistory = messages.map((m: { role: string; content: string }) => ({
      role: (m.role === "assistant" || m.role === "model" ? "model" : "user") as "user" | "model",
      parts: m.content,
    }));

    const lastUserMessage = messages[messages.length - 1]?.content;
    if (lastUserMessage) {
      await saveCoachMessage(userId, "user", String(lastUserMessage), false).catch((err) =>
        console.warn("Failed to persist user message:", err.message)
      );
    }

    const reply = await generateCoachResponse(formattedHistory, isPro, stateDetails);

    await saveCoachMessage(userId, "assistant", reply, isPro).catch((err) =>
      console.warn("Failed to persist assistant message:", err.message)
    );

    return NextResponse.json({
      role: "assistant",
      content: reply,
      isPro,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
