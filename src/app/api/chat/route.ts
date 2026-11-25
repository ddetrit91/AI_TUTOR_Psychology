import { NextRequest, NextResponse } from "next/server";
import { generateCoachResponse } from "@/lib/gemini";
import { getCoachMessages, saveCoachMessage } from "@/lib/db";

const DEFAULT_USER_ID = "default-user";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || DEFAULT_USER_ID;
    const messages = await getCoachMessages(userId, 50);
    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("GET /api/chat error:", error);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, isPro, stateDetails, freeSecondsRemaining, userId = DEFAULT_USER_ID } = body;

    // Check if free user has exhausted daily limit
    if (!isPro && typeof freeSecondsRemaining === "number" && freeSecondsRemaining <= 0) {
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
      // Persist user message to Lakebase Postgres asynchronously/safely
      await saveCoachMessage(userId, "user", String(lastUserMessage), false).catch((err) =>
        console.warn("Failed to persist user message:", err.message)
      );
    }

    const reply = await generateCoachResponse(formattedHistory, Boolean(isPro), stateDetails);

    // Persist assistant reply to Lakebase Postgres
    await saveCoachMessage(userId, "assistant", reply, Boolean(isPro)).catch((err) =>
      console.warn("Failed to persist assistant message:", err.message)
    );

    return NextResponse.json({
      role: "assistant",
      content: reply,
      isPro: Boolean(isPro),
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
