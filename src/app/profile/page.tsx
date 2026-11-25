"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { DailyQuotaTimer } from "@/components/DailyQuotaTimer";
import { User, CreditCard, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isPro, completedLessons, savedSteps, signOut } = useUser();
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleOpenBillingPortal = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Профиль и подписка
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Ваш личный аккаунт, статистика осознанности и управление подпиской Stripe.
          </p>
        </div>

        {user && (
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition self-start"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* User card */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-sage/20 text-brand-sage flex items-center justify-center font-bold text-xl">
                <User className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-base text-foreground truncate">
                  {user?.name || "Пользователь MindBalance"}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{user?.email || "—"}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                      isPro
                        ? "bg-brand-sage/20 text-brand-sage"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPro && <ShieldCheck className="w-3 h-3" />}
                    <span>{isPro ? "Тариф Pro (Безлимит)" : "Тариф Free"}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-wrap gap-6 text-xs">
              <div>
                <span className="text-muted-foreground block">Пройдено уроков:</span>
                <strong className="text-foreground text-sm">{completedLessons.length}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Запланировано шагов:</span>
                <strong className="text-foreground text-sm">{savedSteps.length}</strong>
              </div>
              {user?.id && (
                <div>
                  <span className="text-muted-foreground block">ID аккаунта:</span>
                  <code className="text-[11px] font-mono text-muted-foreground">{user.id}</code>
                </div>
              )}
            </div>
          </div>

          {/* Plan management */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-sm text-foreground">
                  Управление подпиской
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isPro
                    ? `Подписка Pro привязана к ${user?.email || "вашему аккаунту"}.`
                    : "Бесплатный тариф: 10 минут практики в день, сброс в полдень."}
                </p>
              </div>
              <CreditCard className="w-5 h-5 text-brand-sage" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {isPro ? (
                <button
                  onClick={handleOpenBillingPortal}
                  disabled={loadingPortal}
                  className="px-4 py-2 rounded-xl bg-brand-dark dark:bg-brand-sage text-white text-xs font-semibold hover:opacity-90 transition"
                >
                  {loadingPortal ? "Загрузка..." : "Портал биллинга Stripe"}
                </button>
              ) : (
                <Link
                  href="/pricing"
                  className="px-4 py-2 rounded-xl bg-brand-sage text-white text-xs font-semibold hover:bg-brand-sage/90 transition shadow-xs"
                >
                  Подключить Pro ($19/мес)
                </Link>
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
