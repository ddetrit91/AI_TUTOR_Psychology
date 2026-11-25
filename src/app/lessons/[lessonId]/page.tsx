"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getLessonById, Lesson } from "@/data/curriculum";
import { useUser } from "@/lib/user-context";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Briefcase,
  ListTodo,
  Check,
  X,
  Lock,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.lessonId as string;
  const lesson = getLessonById(lessonId);

  const { isPro, completedLessons, markLessonComplete, saveActionStep, savedSteps } = useUser();

  // Quiz state
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Case study state
  const [selectedCaseOption, setSelectedCaseOption] = useState<number | null>(null);

  // Action steps state
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [stepNotes, setStepNotes] = useState<Record<string, string>>({});
  const [stepFeedback, setStepFeedback] = useState<Record<string, any>>({});
  const [evaluatingStepId, setEvaluatingStepId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"theory" | "quiz" | "case" | "steps">("theory");

  if (!lesson) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-heading text-2xl font-bold mb-3">Урок не найден</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Возможно, урок находится в разработке или указан неверный идентификатор.
        </p>
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-dark text-white text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться к программе</span>
        </Link>
      </div>
    );
  }

  const isCompleted = completedLessons.includes(lesson.id);
  const isLocked = !lesson.isFree && !isPro;

  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-brand-sage/20 text-brand-sage flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-2xl font-bold mb-2">Урок доступен на тарифе Pro</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
          Этот продвинутый урок включает углубленные техники, супервизию шагов действий и неограниченные диалоги с AI-коучем.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-sage text-white font-semibold text-sm shadow-md hover:bg-brand-sage/90 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Перейти на Pro</span>
        </Link>
      </div>
    );
  }

  const handleQuizSubmit = () => {
    if (selectedQuizIndex === null) return;
    setQuizSubmitted(true);
  };

  const handleStepToggle = (step: any) => {
    const isNowChecked = !checkedSteps[step.id];
    setCheckedSteps((prev) => ({ ...prev, [step.id]: isNowChecked }));

    saveActionStep({
      id: step.id,
      lessonId: lesson.id,
      title: step.title,
      description: step.description,
      checked: isNowChecked,
      userReflection: stepNotes[step.id] || "",
    });
  };

  const handleEvaluateStep = async (step: any) => {
    const reflection = stepNotes[step.id] || "";
    setEvaluatingStepId(step.id);

    try {
      const res = await fetch("/api/verify-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepTitle: step.title,
          userReflection: reflection,
          isPro: true,
        }),
      });

      const data = await res.json();
      setStepFeedback((prev) => ({ ...prev, [step.id]: data }));

      saveActionStep({
        id: step.id,
        lessonId: lesson.id,
        title: step.title,
        description: step.description,
        checked: Boolean(checkedSteps[step.id]),
        userReflection: reflection,
        proFeedback: data.analysis,
      });
    } catch {
      alert("Не удалось проверить шаг.");
    } finally {
      setEvaluatingStepId(null);
    }
  };

  const handleCompleteLesson = () => {
    markLessonComplete(lesson.id);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#729969", "#A1C0C2", "#223125"],
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Nav Breadcrumbs */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к списку уровней</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{lesson.durationMinutes} мин</span>
          </div>

          {isCompleted ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Пройден</span>
            </span>
          ) : (
            <button
              onClick={handleCompleteLesson}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-brand-sage text-white hover:bg-brand-sage/90 transition shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Завершить урок</span>
            </button>
          )}
        </div>
      </div>

      {/* Lesson Title & Subtitle */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-sage">
            Урок {lesson.order}
          </span>
          <span className="text-muted-foreground text-xs">&bull;</span>
          <span className="text-xs text-muted-foreground">{lesson.subtitle}</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          {lesson.title}
        </h1>
      </div>

      {/* Interactive Tabs */}
      <div className="flex border-b border-border mb-6 gap-2">
        <button
          onClick={() => setActiveTab("theory")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition -mb-px flex items-center gap-1.5 ${
            activeTab === "theory"
              ? "border-brand-sage text-brand-sage font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Теория и практика</span>
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition -mb-px flex items-center gap-1.5 ${
            activeTab === "quiz"
              ? "border-brand-sage text-brand-sage font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Квиз-тест</span>
        </button>
        <button
          onClick={() => setActiveTab("case")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition -mb-px flex items-center gap-1.5 ${
            activeTab === "case"
              ? "border-brand-sage text-brand-sage font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Кейс из жизни</span>
        </button>
        <button
          onClick={() => setActiveTab("steps")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition -mb-px flex items-center gap-1.5 ${
            activeTab === "steps"
              ? "border-brand-sage text-brand-sage font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Шаги действий</span>
        </button>
      </div>

      {/* TAB 1: Theory */}
      {activeTab === "theory" && (
        <div className="space-y-6">
          <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed text-sm sm:text-base space-y-4">
            {lesson.theory.split("\n\n").map((paragraph, idx) => {
              if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={idx} className="font-heading font-bold text-lg text-foreground mt-4">
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              if (paragraph.startsWith("#### ")) {
                return (
                  <h4 key={idx} className="font-heading font-semibold text-base text-foreground mt-3">
                    {paragraph.replace("#### ", "")}
                  </h4>
                );
              }
              return (
                <p key={idx} className="text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Key Takeaway Callout */}
          <div className="p-5 rounded-2xl bg-brand-sage/10 border border-brand-sage/25">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-brand-sage" />
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-brand-sage">
                Главный инсайт урока
              </h4>
            </div>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {lesson.takeaway}
            </p>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Изучили теорию? Переходите к проверке понимания:
            </span>
            <button
              onClick={() => setActiveTab("quiz")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-sage text-white text-xs font-semibold hover:bg-brand-sage/90 transition shadow-xs"
            >
              <span>Квиз-тест</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Quiz */}
      {activeTab === "quiz" && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-brand-sage uppercase tracking-wider block mb-1">
              Проверка понимания
            </span>
            <h3 className="font-heading font-bold text-base sm:text-lg text-foreground">
              {lesson.quiz.question}
            </h3>
          </div>

          <div className="space-y-2.5">
            {lesson.quiz.options.map((option, idx) => {
              const isSelected = selectedQuizIndex === idx;
              const isCorrect = idx === lesson.quiz.correctIndex;
              const showResult = quizSubmitted;

              let btnClass = "border-border bg-card hover:border-brand-sage/60";
              if (showResult) {
                if (isCorrect) {
                  btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium";
                } else if (isSelected && !isCorrect) {
                  btnClass = "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300";
                }
              } else if (isSelected) {
                btnClass = "border-brand-sage bg-brand-sage/15 text-foreground font-medium";
              }

              return (
                <button
                  key={idx}
                  onClick={() => !quizSubmitted && setSelectedQuizIndex(idx)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition flex items-start gap-3 ${btnClass}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                      isSelected ? "border-brand-sage bg-brand-sage text-white" : "border-border"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {!quizSubmitted ? (
            <button
              onClick={handleQuizSubmit}
              disabled={selectedQuizIndex === null}
              className="px-5 py-2.5 rounded-xl bg-brand-dark dark:bg-brand-sage text-white text-xs font-semibold hover:opacity-90 transition disabled:opacity-40"
            >
              Проверить ответ
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-muted/70 border border-border text-xs space-y-2">
              <span className="font-bold text-foreground">
                {selectedQuizIndex === lesson.quiz.correctIndex
                  ? "🎉 Верно! Отличная психологическая зоркость."
                  : "💡 Почти получилось, обратите внимание:"}
              </span>
              <p className="text-muted-foreground leading-relaxed">
                {lesson.quiz.explanation}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("case")}
                  className="font-semibold text-brand-sage hover:underline"
                >
                  Перейти к разбору кейса →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Case Study */}
      {activeTab === "case" && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-brand-sage uppercase tracking-wider block mb-1">
              Практический кейс
            </span>
            <h3 className="font-heading font-bold text-base sm:text-lg text-foreground">
              {lesson.caseStudy.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed p-4 rounded-2xl bg-muted/50 border border-border">
              {lesson.caseStudy.scenario}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground">
              Как наиболее конструктивно поступить в этой ситуации?
            </p>

            {lesson.caseStudy.options.map((opt, idx) => {
              const isChosen = selectedCaseOption === idx;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isChosen
                      ? opt.isOptimal
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-amber-500 bg-amber-500/10"
                      : "border-border bg-card hover:border-brand-sage/40"
                  }`}
                >
                  <button
                    onClick={() => setSelectedCaseOption(idx)}
                    className="w-full text-left flex items-start justify-between gap-3 text-xs sm:text-sm"
                  >
                    <span className="font-medium text-foreground">{opt.text}</span>
                    {isChosen && opt.isOptimal && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                        Оптимально
                      </span>
                    )}
                  </button>

                  {isChosen && (
                    <div className="mt-3 pt-3 border-t border-border/70 text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Психологический анализ: </strong>
                      {opt.analysis}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">Закрепите навык действием:</span>
            <button
              onClick={() => setActiveTab("steps")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-sage text-white text-xs font-semibold hover:bg-brand-sage/90 transition shadow-xs"
            >
              <span>К шагам действий</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Action Steps */}
      {activeTab === "steps" && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-brand-sage uppercase tracking-wider block mb-1">
              Практика в реальной жизни
            </span>
            <h3 className="font-heading font-bold text-base sm:text-lg text-foreground">
              Шаги действий по теме урока
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Психологические изменения происходят через действие. Отметьте шаги, которые вы готовы сделать, и опишите свой план.
            </p>
          </div>

          <div className="space-y-4">
            {lesson.actionSteps.map((step) => {
              const isChecked = Boolean(checkedSteps[step.id]);
              const feedback = stepFeedback[step.id];
              const isEvaluating = evaluatingStepId === step.id;

              return (
                <div
                  key={step.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isChecked
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleStepToggle(step)}
                        className="mt-1 w-4 h-4 rounded text-brand-sage focus:ring-brand-sage accent-brand-sage"
                      />
                      <div>
                        <h4
                          className={`font-heading font-semibold text-sm ${
                            isChecked ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </label>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                      {step.suggestedDuration}
                    </span>
                  </div>

                  {/* Pro Step Verification Area */}
                  <div className="mt-4 pt-3 border-t border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        Ваш личный план реализации шага:
                      </span>
                      {isPro ? (
                        <span className="text-[10px] font-bold text-brand-sage flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Pro AI Проверка</span>
                        </span>
                      ) : (
                        <Link
                          href="/pricing"
                          className="text-[10px] font-medium text-brand-sage hover:underline flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Супервизия шага (Pro)</span>
                        </Link>
                      )}
                    </div>

                    <textarea
                      rows={2}
                      value={stepNotes[step.id] || ""}
                      onChange={(e) =>
                        setStepNotes((prev) => ({ ...prev, [step.id]: e.target.value }))
                      }
                      placeholder="Опишите, в какой ситуации и как именно вы примените этот шаг..."
                      className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:border-brand-sage placeholder:text-muted-foreground"
                    />

                    {isPro && (
                      <button
                        onClick={() => handleEvaluateStep(step)}
                        disabled={isEvaluating || !stepNotes[step.id]?.trim()}
                        className="px-3.5 py-1.5 rounded-lg bg-brand-dark dark:bg-brand-sage text-white text-xs font-semibold hover:opacity-90 transition disabled:opacity-40"
                      >
                        {isEvaluating ? "Супервизия..." : "Проверить шаг через AI"}
                      </button>
                    )}

                    {feedback && (
                      <div className="mt-2 p-3 rounded-xl bg-card border border-border text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            Оценка реалистичности:
                          </span>
                          <span className="font-mono font-bold text-brand-sage">
                            {feedback.score}/100
                          </span>
                        </div>
                        <p className="text-muted-foreground">{feedback.analysis}</p>
                        {feedback.recommendation && (
                          <p className="text-brand-sage font-medium">
                            💡 Рекомендация: {feedback.recommendation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-between">
            <Link
              href="/coach"
              className="text-xs text-brand-sage font-semibold hover:underline flex items-center gap-1"
            >
              <span>Обсудить шаги с AI Коучем</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleCompleteLesson}
              className="px-5 py-2.5 rounded-xl bg-brand-sage text-white text-xs font-semibold hover:bg-brand-sage/90 transition shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Завершить урок</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
