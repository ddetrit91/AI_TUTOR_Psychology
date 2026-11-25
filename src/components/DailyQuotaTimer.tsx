"use client";

import React from "react";
import { Clock, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { formatSecondsToMinutes } from "@/lib/utils";
import Link from "next/link";

interface DailyQuotaTimerProps {
  compact?: boolean;
}

export function DailyQuotaTimer({ compact = false }: DailyQuotaTimerProps) {
  const {
    isPro,
    freeSecondsRemaining,
    totalFreeSeconds,
    timeUntilReset,
    resetFreeQuotaManually,
  } = useUser();

  const percentage = Math.round((freeSecondsRemaining / totalFreeSeconds) * 100);
  const isExhausted = freeSecondsRemaining <= 0;

  if (isPro) {
    if (compact) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sage/15 text-brand-sage dark:text-emerald-400 border border-brand-sage/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-sage animate-spin-slow" />
          <span>Pro Безлимит</span>
        </div>
      );
    }

    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-sage/10 via-brand-celadon/15 to-transparent border border-brand-sage/20 dark:border-brand-sage/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-sage text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-brand-sage">
                Статус подписки
              </p>
              <h4 className="font-heading text-sm font-bold text-foreground">
                Pro Тариф Активен
              </h4>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-sage/20 text-brand-sage font-mono">
            ∞ минут
          </span>
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
          Вам доступно неограниченное время работы с AI-коучем, глубокий разбор ошибок, анализ состояний и все 9 уровней психологии.
        </p>
      </div>
    );
  }

  // Free Tier Compact
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-medium transition-colors ${
            isExhausted
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-400/30"
              : freeSecondsRemaining <= 120
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/30"
              : "bg-brand-sage/10 text-brand-sage dark:text-brand-celadon border-brand-sage/25"
          }`}
          title="Остаток времени практики на сегодня"
        >
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>{formatSecondsToMinutes(freeSecondsRemaining)}</span>
        </div>

        <div
          className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground"
          title="Сброс дневного лимита каждый день ровно в 12:00 (полдень)"
        >
          <RefreshCw className="w-3 h-3 text-brand-sage" />
          <span>В 12:00 через {timeUntilReset || "..."}</span>
        </div>
      </div>
    );
  }

  // Free Tier Expanded Card
  return (
    <div className="p-5 rounded-2xl glass-panel relative overflow-hidden border border-border shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl ${
              isExhausted
                ? "bg-rose-500/15 text-rose-500"
                : "bg-brand-sage/15 text-brand-sage"
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Дневной лимит Free
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-brand-platinum dark:bg-card font-medium text-foreground">
                10 мин / день
              </span>
            </div>
            <h4 className="font-heading text-lg font-bold text-foreground">
              {formatSecondsToMinutes(freeSecondsRemaining)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-body">
                осталось практики
              </span>
            </h4>
          </div>
        </div>

        <button
          onClick={resetFreeQuotaManually}
          title="Тестовый сброс таймера (для демонстрации)"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 p-1.5 rounded-lg hover:bg-accent transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Сбросить</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-brand-platinum/50 dark:bg-card h-2.5 rounded-full overflow-hidden border border-border/50">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isExhausted
                ? "bg-rose-500"
                : percentage < 25
                ? "bg-amber-500"
                : "bg-gradient-to-r from-brand-sage to-brand-celadon"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Noon Reset Notice */}
      <div className="mt-3.5 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-2">
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-brand-sage shrink-0" />
          <span>
            Сброс лимита:{" "}
            <strong className="text-foreground font-semibold">
              каждый день в 12:00 дня
            </strong>
          </span>
        </div>
        <div className="font-mono text-brand-dark dark:text-brand-celadon font-medium">
          До сброса: {timeUntilReset || "вычисление..."}
        </div>
      </div>

      {isExhausted && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-rose-600 dark:text-rose-400">
              Дневной лимит практики исчерпан
            </p>
            <p className="text-muted-foreground mt-0.5">
              Таймер обновится сегодня в 12:00 дня. Либо перейдите на Pro для неограниченного глубокого коучинга.
            </p>
            <Link
              href="/pricing"
              className="inline-block mt-2 font-semibold text-brand-sage hover:underline"
            >
              Перейти на Pro →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
