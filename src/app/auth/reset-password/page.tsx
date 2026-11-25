"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { KeyRound, Mail, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await (authClient as any).requestPasswordReset?.({
        email: email.trim(),
        redirectTo: `${window.location.origin}/auth/sign-in`,
      });
      if (res?.error) {
        setError(res.error.message || "Не удалось отправить письмо.");
        return;
      }
      setSent(true);
    } catch {
      setError("Ошибка при отправке запроса на сброс пароля.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-sage/20 text-brand-sage flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-foreground">
            Сброс пароля
          </h1>
          <p className="text-xs text-muted-foreground">
            Укажите email от вашего аккаунта MindBalance AI
          </p>
        </div>

        {sent ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs space-y-2 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <p className="font-semibold text-foreground">Инструкция отправлена</p>
            <p className="text-muted-foreground">
              Если аккаунт с email <strong>{email}</strong> существует, мы отправили ссылку для восстановления.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-dark dark:bg-brand-sage text-white font-bold text-sm hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Отправить ссылку"}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-border text-center">
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Вернуться ко входу</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
