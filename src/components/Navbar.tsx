"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain,
  Sparkles,
  BookOpen,
  MessageSquare,
  LayoutDashboard,
  CreditCard,
  Menu,
  X,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { DailyQuotaTimer } from "./DailyQuotaTimer";
import { useUser } from "@/lib/user-context";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthLoading, isPro, signOut } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
    { href: "/coach", label: "AI Коуч", icon: MessageSquare },
    { href: "/roadmap", label: "Программа", icon: BookOpen },
    { href: "/pricing", label: "Тарифы", icon: CreditCard },
  ];

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-dark to-brand-sage flex items-center justify-center text-white shadow-md shadow-brand-sage/20 group-hover:scale-105 transition-transform duration-200">
            <Brain className="w-5 h-5 text-brand-celadon" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-lg text-foreground tracking-tight">
                MindBalance
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-brand-sage/20 text-brand-sage dark:text-brand-celadon">
                AI
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground hidden sm:block font-medium -mt-1">
              Коуч по психологии
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-sage/15 text-brand-sage dark:text-brand-celadon font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Quota, Auth User, Theme, CTA */}
        <div className="flex items-center gap-2.5">
          {user && (
            <div className="hidden sm:block">
              <DailyQuotaTimer compact />
            </div>
          )}

          {!isAuthLoading && user ? (
            <>
              {isPro ? (
                <Link
                  href="/profile"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-sage/20 border border-brand-sage/40 text-brand-sage dark:text-emerald-400 text-xs font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Pro</span>
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-dark dark:bg-brand-sage text-white text-xs font-semibold hover:opacity-90 transition shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-celadon" />
                  <span>Тариф Pro</span>
                </Link>
              )}

              <Link
                href="/profile"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border bg-card hover:border-brand-sage/50 text-xs font-medium text-foreground transition"
                title={user.email}
              >
                <User className="w-3.5 h-3.5 text-brand-sage" />
                <span className="max-w-[110px] truncate">
                  {user.name || user.email.split("@")[0]}
                </span>
              </Link>

              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full border border-border hover:border-rose-400/50 bg-card hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition"
                title="Выйти из аккаунта"
                aria-label="Выйти"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : !isAuthLoading ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-card hover:border-brand-sage/50 text-xs font-semibold text-foreground transition"
              >
                <LogIn className="w-3.5 h-3.5 text-brand-sage" />
                <span>Войти</span>
              </Link>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-dark dark:bg-brand-sage text-white text-xs font-semibold hover:opacity-90 transition shadow-sm"
              >
                <span>Регистрация</span>
              </Link>
            </div>
          ) : null}

          <ThemeToggle />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background p-4 space-y-3">
          {user && (
            <div className="pb-2 border-b border-border flex items-center justify-between">
              <DailyQuotaTimer compact />
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-brand-sage flex items-center gap-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>{user.name || user.email}</span>
              </Link>
            </div>
          )}

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-brand-sage/15 text-brand-sage font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-border">
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-rose-500/30 text-rose-500 text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Выйти ({user.email})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl border border-border text-xs font-semibold"
                >
                  Войти
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl bg-brand-sage text-white text-xs font-semibold"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
