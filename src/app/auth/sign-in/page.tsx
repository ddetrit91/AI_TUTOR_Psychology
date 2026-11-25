"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Brain, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

function sanitizeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = sanitizeRedirect(searchParams?.get("redirect") || null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (authError) {
        const msg = authError.message?.toLowerCase() || "";
        if (msg.includes("invalid") || msg.includes("credential") || msg.includes("password")) {
          setError("Неверный email или пароль. Проверьте введённые данные.");
        } else if (msg.includes("verify") || msg.includes("verified")) {
          setError("Email ещё не подтверждён. Проверьте почту.");
        } else {
          setError(authError.message || "Не удалось войти в аккаунт.");
        }
        return;
      }

      router.push(redirectTarget);
      router.refresh();
    } catch {
      setError("Ошибка соединения с сервером авторизации.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-dark to-brand-sage text-white flex items-center justify-center mx-auto shadow-sm">
            <Brain className="w-6 h-6 text-brand-celadon" />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-foreground">
            Вход в MindBalance AI
          </h1>
          <p className="text-xs text-muted-foreground">
            Войдите, чтобы сохранять прогресс, диалоги с коучем и привязать подписку Pro
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-sm text-foreground focus:outline-none focus:border-brand-sage"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Пароль</label>
              <Link
                href="/auth/reset-password"
                className="text-[11px] text-brand-sage hover:underline"
              >
                Забыли пароль?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-sm text-foreground focus:outline-none focus:border-brand-sage"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-dark dark:bg-brand-sage text-white font-bold text-sm hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Выполняем вход...</span>
              </>
            ) : (
              <>
                <span>Войти</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-border text-center text-xs text-muted-foreground">
          Нет аккаунта?{" "}
          <Link
            href={`/auth/sign-up${redirectTarget !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`}
            className="text-brand-sage font-semibold hover:underline"
          >
            Зарегистрироваться бесплатно
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-muted-foreground">Загрузка...</div>}>
      <SignInContent />
    </Suspense>
  );
}
