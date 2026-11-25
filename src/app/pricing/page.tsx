"use client";

import React, { useState } from "react";
import { Check, Sparkles, Clock, RefreshCw, ShieldCheck, Zap, LogIn } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { STRIPE_PRO_PLAN } from "@/lib/stripe";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  const { user, isPro } = useUser();
  const [loading, setLoading] = useState(false);

  const handleSubscribePro = async () => {
    if (!user) {
      router.push("/auth/sign-in?redirect=/pricing");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) {
        router.push("/auth/sign-in?redirect=/pricing");
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Не удалось создать сессию оплаты Stripe.");
      }
    } catch {
      alert("Ошибка при переходе к оплате Stripe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-sage px-3 py-1 rounded-full bg-brand-sage/10">
          Прозрачные тарифы
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground mt-3 tracking-tight">
          Инвестируйте в своё психологическое здоровье
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
          Начните бесплатно с 10 минутами ежедневной практики или привяжите безграничный Pro-доступ к вашему аккаунту через Stripe.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* FREE TIER CARD */}
        <div className="rounded-3xl p-8 bg-card border border-border shadow-xs flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground uppercase tracking-wider">
                Базовый
              </span>
              {user && !isPro && (
                <span className="text-xs font-semibold text-brand-sage bg-brand-sage/15 px-2.5 py-0.5 rounded-full">
                  Ваш текущий план
                </span>
              )}
            </div>

            <h3 className="font-heading text-2xl font-bold text-foreground">Free</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-6">
              Идеально для первого знакомства с когнитивной психологией и выработки привычки осознанности.
            </p>

            <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-border">
              <span className="font-heading text-4xl font-extrabold text-foreground">0 ₽</span>
              <span className="text-xs text-muted-foreground">/ навсегда</span>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                <span>
                  <strong>10 минут практики в день</strong> с AI коучем
                </span>
              </div>

              <div className="flex items-start gap-3">
                <RefreshCw className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                <span>
                  <strong>Сброс лимита в полдень (12:00)</strong> каждый день
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                <span>
                  <strong>5 интерактивных уроков бесплатно</strong> (Начальный этап)
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                <span>Базовые квизы и прикладные задачи</span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                <span>Разборы жизненных кейсов и советы</span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                <span>Формирование практических шагов действий</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              href={user ? "/coach" : "/auth/sign-up"}
              className="w-full block text-center py-3 rounded-2xl bg-muted text-foreground font-semibold text-xs hover:bg-muted/80 transition"
            >
              {user ? "Продолжить практику (Free)" : "Начать бесплатно"}
            </Link>
          </div>
        </div>

        {/* PRO TIER CARD */}
        <div className="rounded-3xl p-8 bg-gradient-to-b from-brand-sage/10 via-card to-card border-2 border-brand-sage shadow-lg relative flex flex-col justify-between">
          <div className="absolute -top-3.5 right-8 px-3 py-1 rounded-full bg-brand-dark dark:bg-brand-sage text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3 text-brand-celadon" />
            <span>Рекомендуемый</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-sage text-white uppercase tracking-wider">
                Pro Безлимит
              </span>
              {user && isPro && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Активен</span>
                </span>
              )}
            </div>

            <h3 className="font-heading text-2xl font-bold text-foreground">Pro</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-6">
              Полное погружение: разбор каждой когнитивной ошибки, распаковка личности и неограниченное время.
            </p>

            <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-border">
              <span className="font-heading text-4xl font-extrabold text-foreground">
                ${STRIPE_PRO_PLAN.priceUsd}
              </span>
              <span className="text-xs text-muted-foreground">/ месяц (~1 490 ₽)</span>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-start gap-3 text-brand-dark dark:text-emerald-300 font-semibold">
                <Sparkles className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                <span>
                  <strong>Неограниченное время использования</strong> (∞ минут)
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                <span>
                  <strong>Углублённый диалог с коучем:</strong> детальный разбор каждой ошибки и выявление глубинных установок
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                <span>
                  <strong>Модуль «Описание состояния»:</strong> соматические маркеры (тело), спектр эмоций и шкала интенсивности
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                <span>
                  <strong>AI-проверка шагов действий:</strong> выявление скрытого избегания, перфекционизма и самосаботажа
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
                <span>
                  <strong>Полный доступ ко всем этапам:</strong> Начальный, Продвинутый (ACT, Внутренний критик) и Эксперт (Схема-терапия, кризисы, смыслы)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            {user && isPro ? (
              <div className="space-y-2">
                <div className="w-full text-center py-2.5 rounded-2xl bg-brand-sage/20 text-brand-sage font-bold text-xs">
                  ✅ Подписка Pro привязана к {user.email}
                </div>
                <Link
                  href="/coach"
                  className="w-full block text-center py-2 rounded-xl bg-brand-sage text-white font-semibold text-xs hover:bg-brand-sage/90 transition"
                >
                  Перейти к безлимитному диалогу
                </Link>
              </div>
            ) : !user ? (
              <Link
                href="/auth/sign-in?redirect=/pricing"
                className="w-full py-3.5 rounded-2xl bg-brand-dark dark:bg-brand-sage text-white font-bold text-xs sm:text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md"
              >
                <LogIn className="w-4 h-4 text-brand-celadon" />
                <span>Войти для подключения Pro</span>
              </Link>
            ) : (
              <button
                onClick={handleSubscribePro}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-brand-dark dark:bg-brand-sage text-white font-bold text-xs sm:text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? (
                  <span>Перенаправление на Stripe...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-brand-celadon" />
                    <span>Подключить Pro через Stripe</span>
                  </>
                )}
              </button>
            )}
            <p className="text-[11px] text-center text-muted-foreground mt-2">
              {user
                ? `Подписка привяжется к аккаунту ${user.email}`
                : "Безопасная оплата Stripe • Привязка к личному аккаунту"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
