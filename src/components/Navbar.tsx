"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { DailyQuotaTimer } from "./DailyQuotaTimer";
import { useUser } from "@/lib/user-context";

export default function Navbar() {
  const pathname = usePathname();
  const { isPro, setPlan } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
    { href: "/coach", label: "AI Коуч", icon: MessageSquare },
    { href: "/roadmap", label: "Программа", icon: BookOpen },
    { href: "/pricing", label: "Тарифы", icon: CreditCard },
  ];

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

        {/* Right Section: Quota, Plan Switcher, Theme, CTA */}
        <div className="flex items-center gap-2.5">
          {/* Daily Quota Timer Pill */}
          <div className="hidden sm:block">
            <DailyQuotaTimer compact />
          </div>

          {/* Quick Demo Plan Switcher */}
          <div className="hidden lg:flex items-center bg-muted/70 rounded-full p-0.5 border border-border text-[11px]">
            <button
              onClick={() => setPlan("free")}
              className={`px-2.5 py-0.5 rounded-full font-medium transition ${
                !isPro
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Переключить в режим Free для проверки лимитов"
            >
              Free
            </button>
            <button
              onClick={() => setPlan("pro")}
              className={`px-2.5 py-0.5 rounded-full font-medium transition flex items-center gap-1 ${
                isPro
                  ? "bg-brand-sage text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Переключить в режим Pro для проверки полного доступа"
            >
              <Sparkles className="w-3 h-3" />
              Pro
            </button>
          </div>

          {/* Pro Action Button or Badge */}
          {isPro ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-sage/20 border border-brand-sage/40 text-brand-sage dark:text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pro Активен</span>
            </div>
          ) : (
            <Link
              href="/pricing"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-dark dark:bg-brand-sage text-white text-xs font-semibold hover:bg-brand-dark/90 dark:hover:bg-brand-sage/90 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-celadon" />
              <span>Тариф Pro</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile menu trigger */}
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
          <div className="pb-2 border-b border-border">
            <DailyQuotaTimer compact />
          </div>
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
          <div className="pt-2 flex items-center justify-between border-t border-border">
            <span className="text-xs text-muted-foreground">Режим тарифа:</span>
            <div className="flex items-center bg-muted rounded-full p-0.5 border border-border text-xs">
              <button
                onClick={() => setPlan("free")}
                className={`px-3 py-1 rounded-full ${!isPro ? "bg-card font-bold" : "text-muted-foreground"}`}
              >
                Free
              </button>
              <button
                onClick={() => setPlan("pro")}
                className={`px-3 py-1 rounded-full ${isPro ? "bg-brand-sage text-white font-bold" : "text-muted-foreground"}`}
              >
                Pro
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
