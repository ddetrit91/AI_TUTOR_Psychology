"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { getAllLessons } from "@/data/curriculum";
import { DailyQuotaTimer } from "@/components/DailyQuotaTimer";
import { JournalVault } from "@/components/journal/JournalVault";
import {
  Brain,
  MessageSquare,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  ListTodo,
  ArrowRight,
  ShieldCheck,
  Flame,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";

function DashboardContent() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams?.get("payment");
  const sessionId = searchParams?.get("session_id");
  const { user, isPro, refreshUserState, completedLessons, savedSteps, toggleStepChecked } =
    useUser();
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    if (paymentStatus !== "success") return;

    async function verifyStripe() {
      if (sessionId) {
        await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {});
      }
      await refreshUserState();
      setShowSuccessBanner(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#729969", "#A1C0C2", "#223125"],
      });
    }

    verifyStripe();
  }, [paymentStatus, sessionId, refreshUserState]);

  const allLessons = getAllLessons();
  const completedCount = completedLessons.length;
  const progressPercent = Math.round((completedCount / allLessons.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Stripe Payment Success Notification */}
      {showSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-4 animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-foreground">
                Поздравляем! Тариф Pro успешно активирован
              </h4>
              <p className="text-xs text-muted-foreground">
                Вам доступно неограниченное время общения с AI коучем, проверка шагов действий и все уровни обучения.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="text-xs text-muted-foreground hover:text-foreground p-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-brand-dark via-brand-dark/95 to-brand-sage text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 text-brand-celadon backdrop-blur-xs">
              Личный кабинет
            </span>
            {isPro && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-sage text-white">
                Pro Безлимит
              </span>
            )}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
            Добро пожаловать в пространство осознанности
          </h1>
          <p className="text-xs sm:text-sm text-white/80 mt-2 leading-relaxed">
            Исследуйте когнитивные паттерны, проходите интерактивные уроки и делитесь переживаниями с персональным AI-коучем.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/coach"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-dark font-semibold text-xs hover:bg-white/90 transition shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-brand-sage" />
              <span>Начать диалог с коучем</span>
            </Link>

            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition backdrop-blur-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>Программа обучения</span>
            </Link>
          </div>
        </div>

        <div className="hidden lg:block absolute -right-6 -bottom-10 opacity-15 text-white pointer-events-none">
          <Brain className="w-64 h-64" />
        </div>
      </div>

      {/* Grid: Quota Widget & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Daily Quota & 12:00 Reset Widget */}
        <div className="lg:col-span-1">
          <DailyQuotaTimer />
        </div>

        {/* Right Columns: Metrics and Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-semibold">Пройдено уроков</span>
              <Award className="w-4 h-4 text-brand-sage" />
            </div>
            <div>
              <div className="font-heading text-2xl font-bold text-foreground">
                {completedCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  / {allLessons.length}
                </span>
              </div>
              <div className="mt-2 w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-sage h-full rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-semibold">Шаги действий</span>
              <ListTodo className="w-4 h-4 text-brand-celadon" />
            </div>
            <div>
              <div className="font-heading text-2xl font-bold text-foreground">
                {savedSteps.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {savedSteps.filter((s) => s.checked).length} выполнено
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-semibold">AI Супервизия</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="font-heading text-2xl font-bold text-foreground">
                {isPro ? "Pro Активен" : "Free"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isPro ? "Глубинный разбор" : "Базовый коучинг"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Lessons (5 Free Lessons) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Базовые уроки начального этапа
            </h3>
            <p className="text-xs text-muted-foreground">
              5 бесплатных интерактивных уроков по эмоциональной грамотности и КПТ-модели
            </p>
          </div>
          <Link
            href="/roadmap"
            className="text-xs text-brand-sage font-semibold hover:underline flex items-center gap-1"
          >
            <span>Вся программа</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allLessons.slice(0, 5).map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);

            return (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="group p-5 rounded-2xl bg-card border border-border hover:border-brand-sage/50 transition-all hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-sage/15 text-brand-sage">
                      Урок {lesson.order}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Пройден</span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading font-bold text-sm text-foreground group-hover:text-brand-sage transition-colors mb-1">
                    {lesson.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {lesson.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{lesson.durationMinutes} мин</span>
                  </span>
                  <span className="text-brand-sage font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                    Начать →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Saved Action Steps Block */}
      {savedSteps.length > 0 && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Мои шаги действий и супервизия
              </h3>
              <p className="text-xs text-muted-foreground">
                Запланированные действия по урокам и психологические рекомендации
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {savedSteps.filter((s) => s.checked).length} из {savedSteps.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {savedSteps.map((step) => (
              <div
                key={step.id}
                className="p-3.5 rounded-xl border border-border bg-muted/30 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={step.checked}
                    onChange={() => toggleStepChecked(step.id)}
                    className="mt-0.5 w-4 h-4 rounded text-brand-sage focus:ring-brand-sage accent-brand-sage"
                  />
                  <div>
                    <h5
                      className={`font-semibold ${
                        step.checked ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {step.title}
                    </h5>
                    <p className="text-muted-foreground mt-0.5">{step.description}</p>
                    {step.proFeedback && (
                      <div className="mt-2 p-2 rounded-lg bg-card border border-border text-[11px] text-brand-sage">
                        <strong>AI Супервизия: </strong>
                        {step.proFeedback}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Journal Vault (Neon Object Storage + Postgres) */}
      <JournalVault />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-muted-foreground">
          Загрузка личного кабинета...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

