import { NextRequest, NextResponse } from "next/server";
import { generateCoachResponse } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emotions, somaticMarkers, intensity, notes, isPro } = body;

    if (!isPro) {
      return NextResponse.json(
        {
          error: "PRO_REQUIRED",
          message: "Глубинный анализ состояния и телесных маркеров доступен на тарифе Pro.",
        },
        { status: 403 }
      );
    }

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
