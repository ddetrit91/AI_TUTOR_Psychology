"use client";

import React from "react";
import Link from "next/link";
import {
  Brain,
  Sparkles,
  ShieldCheck,
  Clock,
  RefreshCw,
  Heart,
  Activity,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Zap,
} from "lucide-react";
import { useUser } from "@/lib/user-context";

export default function LandingPage() {
  const { isPro, timeUntilReset } = useUser();

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Ambient Gradient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-sage/15 via-brand-celadon/10 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sage/15 border border-brand-sage/30 text-brand-dark dark:text-brand-celadon text-xs font-semibold shadow-xs animate-in fade-in-50">
            <Sparkles className="w-3.5 h-3.5 text-brand-sage" />
            <span>Персональный AI-коуч на базе КПТ, ACT и Схема-терапии</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Осознанность, которая{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sage via-brand-sage to-brand-celadon">
              раскрывает вас
            </span>
            , а не судит
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Исследуйте автоматические мысли, трансформируйте когнитивные искажения и вырабатывайте устойчивые шаги действий с персональным AI-психологом.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/coach"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-brand-dark dark:bg-brand-sage text-white font-bold text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-brand-celadon" />
              <span>Попробовать бесплатно (10 мин/день)</span>
            </Link>

            <Link
              href="/roadmap"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-card hover:bg-muted border border-border text-foreground font-semibold text-sm transition flex items-center justify-center gap-2 shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-brand-sage" />
              <span>Смотреть программу 3 этапов</span>
            </Link>
          </div>

          {/* Reset Pill Notice */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5 text-brand-sage" />
            <span>
              Бесплатный тариф сбрасывается каждый день ровно в 12:00 дня &bull; До сброса:{" "}
              <strong className="text-foreground font-mono">{timeUntilReset || "12:00"}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE DEMO PREVIEW CARD */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-sage flex items-center justify-center text-white">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-foreground">
                  Как работает диалог с AI коучем
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Модель: Google Gemini 3.5 Flash Lite с психологической калибровкой
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full bg-brand-sage/10 text-brand-sage border border-brand-sage/20">
              <Clock className="w-3.5 h-3.5" />
              <span>10:00 ежедневный лимит</span>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-muted/60 text-foreground max-w-lg border border-border">
              <span className="font-bold block text-[11px] text-muted-foreground mb-1">Вы:</span>
              «Коллега сухо ответил на мое письмо. Я теперь весь день не могу работать, уверен, что меня уволят или я всех подвел...»
            </div>

            <div className="p-4 rounded-2xl bg-brand-sage/10 text-foreground max-w-xl border border-brand-sage/30 ml-auto space-y-2">
              <div className="flex items-center gap-1.5 text-brand-sage font-bold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Разбор когнитивного искажения:</span>
              </div>
              <p className="leading-relaxed">
                Слышу, как сильно это выбило вас из колеи. Давайте бережно разберем:
                здесь включились сразу две ментальные ловушки — <strong>катастрофизация</strong> («точно уволят») и <strong>чтение мыслей</strong> («он думает, что я плохой»).
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Где прямо сейчас в теле отзывается этот страх? Давайте сделаем вдох на 4 счета, выдох на 6 и сформулируем 1 реалистичный альтернативный сценарий.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              В тарифе Pro доступна проверка ваших шагов действий и анализ соматики.
            </span>
            <Link
              href="/coach"
              className="font-semibold text-brand-sage hover:underline flex items-center gap-1"
            >
              <span>Попробовать в чате</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. THREE STAGES OF PSYCHOLOGY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-sage">
            Эволюция мышления
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
            3 этапа психологической трансформации
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            От базовой эмоциональной грамотности к глубинной перестройке и обретению личных смыслов.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stage 1 */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-brand-sage/20 text-brand-sage flex items-center justify-center mb-3">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Этап 1: Начальный (Free)
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground mt-1">
                Осознанность и Базовый контакт
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                5 бесплатных интерактивных уроков, квизы и кейсы: распознавание эмоций, соматическая карта тревоги, формула А-В-С и экстренная пауза STOP.
              </p>
            </div>
            <Link
              href="/roadmap"
              className="text-xs font-semibold text-brand-sage hover:underline pt-2 inline-flex items-center gap-1"
            >
              <span>5 бесплатных уроков →</span>
            </Link>
          </div>

          {/* Stage 2 */}
          <div className="p-6 rounded-3xl bg-card border border-brand-sage/30 shadow-xs space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-sage/20 text-brand-sage">
              Pro
            </div>
            <div>
              <div className="w-10 h-10 rounded-2xl bg-brand-sage/20 text-brand-sage flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-sage">
                Этап 2: Продвинутый
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground mt-1">
                Глубинная перестройка и ACT
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Интеграция Внутреннего критика, синдром самозванца, когнитивное расцепление (Defusion), стили привязанности и трансформация конфликтов.
              </p>
            </div>
            <Link
              href="/pricing"
              className="text-xs font-semibold text-brand-sage hover:underline pt-2 inline-flex items-center gap-1"
            >
              <span>Узнать больше о Pro →</span>
            </Link>
          </div>

          {/* Stage 3 */}
          <div className="p-6 rounded-3xl bg-card border border-brand-celadon/30 shadow-xs space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-sage/20 text-brand-sage">
              Pro
            </div>
            <div>
              <div className="w-10 h-10 rounded-2xl bg-brand-celadon/20 text-brand-dark dark:text-brand-celadon flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-sage">
                Этап 3: Эксперт
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground mt-1">
                Схема-терапия и Смыслы
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Режимы Уязвимого ребенка, исцеление детских травматических схем, антикризисные протоколы регуляции аффекта DBT и логотерапия Франкла.
              </p>
            </div>
            <Link
              href="/pricing"
              className="text-xs font-semibold text-brand-sage hover:underline pt-2 inline-flex items-center gap-1"
            >
              <span>Открыть на Pro →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. COMPARISON / CTA SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-brand-dark via-brand-dark to-[#141D16] text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-celadon text-xs font-semibold backdrop-blur-xs">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Начните свой путь к внутренней опоре сегодня</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold max-w-xl mx-auto leading-tight">
            Готовы взглянуть на свои мысли без страха и осуждения?
          </h2>

          <p className="text-white/80 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            10 минут практики каждый день бесплатно. Сброс в полдень. Неограниченный Pro доступ в любой момент.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/coach"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-sage hover:bg-brand-sage/90 text-white font-bold text-sm transition shadow-md"
            >
              Начать бесплатную сессию
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition"
            >
              Сравнить тарифы Free и Pro
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
