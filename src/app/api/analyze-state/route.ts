import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { ensureUserProfile } from "@/lib/db";
import { generateCoachResponse } from "@/lib/gemini";

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
          message: "Глубинный анализ состояния и телесных маркеров доступен на тарифе Pro.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { emotions, somaticMarkers, intensity, notes } = body;

    const promptMessage = `Пользователь заполнил карту состояния:
- Эмоции: ${emotions?.join(", ") || "не указано"}
- Соматические маркеры (тело): ${somaticMarkers?.join(", ") || "не указано"}
- Интенсивность переживания: ${intensity}/10
- Контекст / Заметки: ${notes || "нет заметок"}`;

    const analysis = await generateCoachResponse(
      [{ role: "user", parts: promptMessage }],
      true,
      { emotions, somaticMarkers, intensity, notes }
    );

    return NextResponse.json({
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Analyze state API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
