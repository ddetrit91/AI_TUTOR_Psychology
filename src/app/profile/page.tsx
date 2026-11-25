"use client";

import React, { useState } from "react";
import { useUser } from "@/lib/user-context";
import { DailyQuotaTimer } from "@/components/DailyQuotaTimer";
import { User, Sparkles, RefreshCw, CreditCard, Shield, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { isPro, setPlan, resetFreeQuotaManually, completedLessons, savedSteps } = useUser();
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleOpenBillingPortal = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: "cus_mock_demo" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Ошибка при переходе в биллинг.");
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Профиль и настройки подписки
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Управление вашим тарифом, сброс лимитов и статистика осознанности.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* User card */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-sage/20 text-brand-sage flex items-center justify-center font-bold text-xl">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-foreground">
                  Пользователь MindBalance
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isPro
                        ? "bg-brand-sage/20 text-brand-sage"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPro ? "Тариф Pro (Безлимит)" : "Тариф Free"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-wrap gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block">Пройдено уроков:</span>
                <strong className="text-foreground text-sm">{completedLessons.length}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Запланировано шагов:</span>
                <strong className="text-foreground text-sm">{savedSteps.length}</strong>
              </div>
            </div>
          </div>

          {/* Plan management */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-sm text-foreground">
                  Управление тарифом
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isPro
                    ? "У вас активна подписка Pro с неограниченным доступом к AI-коучу."
                    : "Вы на бесплатном тарифе (10 минут практики в день, сброс в полдень)."}
                </p>
              </div>
              <CreditCard className="w-5 h-5 text-brand-sage" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {isPro ? (
                <>
                  <button
                    onClick={handleOpenBillingPortal}
                    disabled={loadingPortal}
                    className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition"
                  >
                    {loadingPortal ? "Загрузка..." : "Управление подпиской Stripe"}
                  </button>
                  <button
                    onClick={() => setPlan("free")}
                    className="px-4 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground transition"
                  >
                    Переключить на Free (демо)
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/pricing"
                    className="px-4 py-2 rounded-xl bg-brand-sage text-white text-xs font-semibold hover:bg-brand-sage/90 transition shadow-xs"
                  >
                    Перейти на Pro ($19/мес)
                  </Link>
                  <button
                    onClick={() => setPlan("pro")}
                    className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition"
                  >
                    Активировать Pro в 1 клик (демо)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right col: Quota status */}
        <div className="space-y-6">
          <DailyQuotaTimer />
        </div>
      </div>
    </div>
  );
}
