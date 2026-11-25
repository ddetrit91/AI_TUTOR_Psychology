import React from "react";
import Link from "next/link";
import { Brain, Heart, Shield, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 backdrop-blur-xs text-xs text-muted-foreground mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-dark flex items-center justify-center text-white">
                <Brain className="w-4 h-4 text-brand-celadon" />
              </div>
              <span className="font-heading font-bold text-base text-foreground">
                MindBalance AI
              </span>
            </div>
            <p className="max-w-md text-xs text-muted-foreground leading-relaxed">
              Персональный AI-коуч по психологии и осознанности на базе доказательных методов КПТ, ACT и схема-терапии. Помогает трансформировать автоматические мысли, глубинно исследовать эмоциональные состояния и выстраивать устойчивые привычки.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-brand-sage" />
              <span>Модель: Google Gemini 3.5 Flash Lite</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2.5">
            <h4 className="font-heading font-semibold text-foreground text-xs uppercase tracking-wider">
              Навигация
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition">
                  Дашборд обучения
                </Link>
              </li>
              <li>
                <Link href="/coach" className="hover:text-foreground transition">
                  Диалог с AI Коучем
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-foreground transition">
                  Программа 3 этапов
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition">
                  Тарифы и возможности
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2.5">
            <h4 className="font-heading font-semibold text-foreground text-xs uppercase tracking-wider">
              Тарифы & Лимиты
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-sage" />
                <span>Free: 10 мин/день (сброс в 12:00)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-sage" />
                <span>Free: 5 базовых интерактивных уроков</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-celadon" />
                <span>Pro: Безлимит и проверка шагов AI</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-celadon" />
                <span>Оплата: Stripe Gateway</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-brand-sage" />
            <span>
              Психообразовательный сервис. Не является заменой очной психотерапии или экстренной психиатрической помощи.
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Создано с заботой о ментальном здоровье</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
            <span>&copy; {new Date().getFullYear()} MindBalance AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
