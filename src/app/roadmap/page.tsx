import React from "react";
import RoadmapView from "@/components/learning/RoadmapView";
import { BookOpen, Sparkles } from "lucide-react";

export const metadata = {
  title: "Программа обучения — MindBalance AI",
  description: "3 этапа и 9 уровней практической психологии: от базовой осознанности до интеграции личности.",
};

export default function RoadmapPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mb-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-brand-sage/20 text-brand-sage">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-sage">
            Академия психологии
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Дорожная карта трансформации
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
          Структурированная система из 3 этапов и 9 уровней. Бесплатный тариф включает Начальный этап (5 интерактивных уроков, квизы, кейсы и шаги действий). Тариф Pro открывает все продвинутые и экспертные уровни.
        </p>
      </div>

      <RoadmapView />
    </div>
  );
}
