"use client";

import React from "react";
import Link from "next/link";
import {
  CURRICULUM_STAGES,
  getAllLessons,
  Stage,
  Level,
} from "@/data/curriculum";
import { useUser } from "@/lib/user-context";
import {
  Compass,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  Flame,
  HeartHandshake,
  KeyRound,
  LifeBuoy,
  Crown,
  Lock,
  CheckCircle2,
  Play,
  ArrowRight,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Compass,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  Flame,
  HeartHandshake,
  KeyRound,
  LifeBuoy,
  Crown,
};

export default function RoadmapView() {
  const { isPro, completedLessons } = useUser();
  const allLessons = getAllLessons();

  return (
    <div className="space-y-12">
      {CURRICULUM_STAGES.map((stage: Stage, stageIdx: number) => {
        const isLockedStage = stage.isProOnly && !isPro;

        return (
          <div
            key={stage.id}
            className={`relative rounded-3xl p-6 sm:p-8 border transition-all ${
              isLockedStage
                ? "bg-card/40 border-border/60 opacity-90"
                : "bg-card border-border shadow-xs"
            }`}
          >
            {/* Stage Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-platinum dark:bg-muted text-foreground">
                    Этап {stage.order}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      stage.isProOnly
                        ? "bg-brand-sage/20 text-brand-sage"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {stage.badge}
                  </span>
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                  {stage.title}: {stage.subtitle}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
                  {stage.description}
                </p>
              </div>

              {isLockedStage && (
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-dark dark:bg-brand-sage text-white text-xs font-semibold hover:opacity-90 transition shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Разблокировать Pro</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Levels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {stage.levels.map((level: Level) => {
                const IconComponent = ICON_MAP[level.iconName] || Compass;
                const isLevelLocked = (stage.isProOnly || !level.isFree) && !isPro;

                return (
                  <div
                    key={level.id}
                    className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                      isLevelLocked
                        ? "bg-muted/30 border-dashed border-border"
                        : "bg-muted/50 dark:bg-card/70 border-border hover:border-brand-sage/40 hover:shadow-md"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isLevelLocked
                              ? "bg-muted text-muted-foreground"
                              : "bg-brand-sage/20 text-brand-sage"
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        {isLevelLocked ? (
                          <span className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                            <Lock className="w-4 h-4" />
                          </span>
                        ) : level.isFree ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            Free
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-sage/20 text-brand-sage">
                            Pro
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-bold text-sm text-foreground mb-1.5">
                        {level.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                        {level.description}
                      </p>
                    </div>

                    {/* Lessons list or lock notice */}
                    <div>
                      {level.lessons && level.lessons.length > 0 ? (
                        <div className="space-y-2 pt-3 border-t border-border">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Уроки уровня ({level.lessons.length}):
                          </span>
                          <div className="space-y-1.5">
                            {level.lessons.map((lesson) => {
                              const isCompleted = completedLessons.includes(lesson.id);

                              return (
                                <Link
                                  key={lesson.id}
                                  href={`/lessons/${lesson.id}`}
                                  className="group/lesson flex items-center justify-between p-2 rounded-lg bg-card/80 hover:bg-card border border-border/70 hover:border-brand-sage/40 text-xs transition"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                      <Play className="w-3.5 h-3.5 text-brand-sage shrink-0 group-hover/lesson:scale-110 transition-transform" />
                                    )}
                                    <span className="truncate text-foreground group-hover/lesson:text-brand-sage">
                                      {lesson.order}. {lesson.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                                    {lesson.durationMinutes} мин
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-3 border-t border-border">
                          {isLevelLocked ? (
                            <Link
                              href="/pricing"
                              className="text-xs text-brand-sage font-medium flex items-center justify-between hover:underline"
                            >
                              <span>Открыть в тарифе Pro</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Уроки генерируются AI коучем по индивидуальному запросу
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
