import React from "react";
import CoachChat from "@/components/coach/CoachChat";

export const metadata = {
  title: "AI Коуч по психологии — MindBalance AI",
  description: "Персональный коучинг: деконструкция когнитивных искажений, анализ состояния и поддержка 24/7.",
};

export default function CoachPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <CoachChat />
    </div>
  );
}
