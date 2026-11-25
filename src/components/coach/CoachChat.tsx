"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Clock,
  Heart,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useUser } from "@/lib/user-context";
import { formatSecondsToMinutes } from "@/lib/utils";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isProAnalysis?: boolean;
}

const QUICK_STARTERS = [
  "Чувствую сильную тревогу из-за неопределенности",
  "Внутри голос критика говорит, что я ни на что не способен",
  "Случился конфликт, не знаю, как экологично отстоять границы",
  "Постоянно откладываю важное дело и виню себя за это",
];

const EMOTION_OPTIONS = [
  "Тревога",
  "Подавленность",
  "Обида",
  "Стыд",
  "Вина",
  "Злость / Гнев",
  "Одиночество",
  "Бессилие",
  "Радость",
  "Интерес",
];

const SOMATIC_OPTIONS = [
  "Ком в горле",
  "Сжатая челюсть",
  "Поднятые напряженные плечи",
  "Поверхностное дыхание",
  "Тяжесть / спазм в груди",
  "Холодные ладони",
  "Учащенный пульс",
  "Узел в животе",
];

export default function CoachChat() {
  const {
    isPro,
    freeSecondsRemaining,
    isTimerRunning,
    toggleTimer,
    decrementSeconds,
    timeUntilReset,
  } = useUser();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Здравствуйте! Я ваш персональный AI-коуч по психологии. Здесь безопасное безоценочное пространство, где мы вместе исследуем ваши чувства, отделим факты от домыслов и найдем устойчивые шаги действий.\n\nО чем бы вы хотели поговорить сегодня?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);

  // Pro State Analyzer Form
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedSomatic, setSelectedSomatic] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<number>(7);
  const [stateNotes, setStateNotes] = useState<string>("");

  // Pro Step Verifier Form
  const [stepTitle, setStepTitle] = useState("");
  const [stepReflection, setStepReflection] = useState("");
  const [stepAnalysisResult, setStepAnalysisResult] = useState<any>(null);
  const [isVerifyingStep, setIsVerifyingStep] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load persisted chat messages from Lakebase Postgres on mount
  useEffect(() => {
    let active = true;
    fetch("/api/chat")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.messages?.length) return;
        const loaded: Message[] = data.messages.map((m: any) => ({
          id: `db-${m.id}`,
          role: m.role,
          content: m.content,
          isProAnalysis: Boolean(m.is_pro_analysis),
          timestamp: m.created_at
            ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "",
        }));
        setMessages((prev) => [prev[0], ...loaded]);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Start timer automatically when user engages
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    // Check free limit
    if (!isPro && freeSecondsRemaining <= 0) {
      return;
    }

    if (!isPro && !isTimerRunning) {
      toggleTimer(true);
    }

    const userMessage: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          isPro,
          freeSecondsRemaining,
        }),
      });

      const data = await response.json();

      if (response.ok && data.content) {
        const assistantMessage: Message = {
          id: "msg-" + Date.now() + 1,
          role: "assistant",
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isProAnalysis: isPro,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (data.error === "DAILY_LIMIT_REACHED") {
        setMessages((prev) => [
          ...prev,
          {
            id: "msg-limit-" + Date.now(),
            role: "assistant",
            content: `⏳ **Ваш ежедневный лимит в 10 минут практики исчерпан.**\n\nОн автоматически обновится **сегодня в 12:00 дня (полдень)**. До сброса осталось: ${timeUntilReset}.\n\nЧтобы продолжить глубокий диалог без ограничений и получить разбор когнитивных ошибок, перейдите на тариф Pro.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        toggleTimer(false);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "msg-err-" + Date.now(),
          role: "assistant",
          content:
            "Произошла небольшая заминка соединения. Пожалуйста, сделайте глубокий вдох и повторите отправку.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitStateAnalysis = async () => {
    if (!isPro) {
      alert("Глубокий анализ состояния доступен на тарифе Pro");
      return;
    }

    setShowStateModal(false);
    const summaryPrompt = `[ОПИСАНИЕ МОЕГО СОСТОЯНИЯ]:\n- Эмоции: ${selectedEmotions.join(", ") || "не выбраны"}\n- Соматические маркеры (тело): ${selectedSomatic.join(", ") || "не выбраны"}\n- Интенсивность: ${intensity}/10\n- Ситуация/триггер: ${stateNotes || "нет"}`;

    handleSendMessage(summaryPrompt);
  };

  const handleVerifyStep = async () => {
    if (!stepTitle.trim()) return;
    setIsVerifyingStep(true);
    setStepAnalysisResult(null);

    try {
      const res = await fetch("/api/verify-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepTitle,
          userReflection: stepReflection,
          isPro: true,
        }),
      });

      const data = await res.json();
      setStepAnalysisResult(data);
    } catch {
      alert("Ошибка при анализе шага.");
    } finally {
      setIsVerifyingStep(false);
    }
  };

  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const isExhausted = !isPro && freeSecondsRemaining <= 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-border bg-card/90 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-sage to-brand-celadon flex items-center justify-center text-white shadow-sm">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-sm text-foreground">
                MindBalance Coach
              </h3>
              {isPro ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-sage/20 text-brand-sage">
                  Pro Аналитик
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                  Free
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              КПТ, ACT и Сократовский диалог &bull; Gemini 3.5 Flash Lite
            </p>
          </div>
        </div>

        {/* Timer Control in Header */}
        <div className="flex items-center gap-2">
          {!isPro ? (
            <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl border border-border text-xs">
              <Clock
                className={`w-4 h-4 ${
                  isExhausted
                    ? "text-rose-500"
                    : isTimerRunning
                    ? "text-brand-sage animate-spin-slow"
                    : "text-muted-foreground"
                }`}
              />
              <span className="font-mono font-bold text-foreground">
                {formatSecondsToMinutes(freeSecondsRemaining)}
              </span>
              <button
                onClick={() => toggleTimer(!isTimerRunning)}
                disabled={isExhausted}
                className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition disabled:opacity-40"
                title={isTimerRunning ? "Поставить таймер на паузу" : "Запустить таймер"}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sage/15 text-brand-sage text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Безлимит ∞</span>
            </div>
          )}

          {/* Pro Action Buttons */}
          {isPro && (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => setShowStateModal(!showStateModal)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border hover:border-brand-sage bg-card hover:bg-accent flex items-center gap-1 transition"
                title="Описать эмоциональное и соматическое состояние"
              >
                <Activity className="w-3.5 h-3.5 text-brand-sage" />
                <span>Моё состояние</span>
              </button>
              <button
                onClick={() => setShowStepModal(!showStepModal)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border hover:border-brand-sage bg-card hover:bg-accent flex items-center gap-1 transition"
                title="Проверить запланированный шаг действий на самосаботаж"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-celadon" />
                <span>Проверка шагов</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pro State Modal Drawer */}
      {showStateModal && isPro && (
        <div className="p-4 border-b border-border bg-muted/40 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-sage" />
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
                Модуль Pro: Диагностика состояния
              </h4>
            </div>
            <button
              onClick={() => setShowStateModal(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Закрыть
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <p className="font-medium text-muted-foreground mb-1.5">
                Какие эмоции преобладают прямо сейчас?
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EMOTION_OPTIONS.map((emotion) => {
                  const isSelected = selectedEmotions.includes(emotion);
                  return (
                    <button
                      key={emotion}
                      onClick={() => toggleArrayItem(selectedEmotions, emotion, setSelectedEmotions)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                        isSelected
                          ? "bg-brand-sage text-white"
                          : "bg-card border border-border text-foreground hover:border-brand-sage/50"
                      }`}
                    >
                      {emotion}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="font-medium text-muted-foreground mb-1.5">
                Соматические маркеры (где в теле отзывается):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SOMATIC_OPTIONS.map((marker) => {
                  const isSelected = selectedSomatic.includes(marker);
                  return (
                    <button
                      key={marker}
                      onClick={() => toggleArrayItem(selectedSomatic, marker, setSelectedSomatic)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                        isSelected
                          ? "bg-brand-celadon text-brand-dark font-semibold"
                          : "bg-card border border-border text-foreground hover:border-brand-celadon/50"
                      }`}
                    >
                      {marker}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-muted-foreground">
                    Интенсивность переживания:
                  </span>
                  <span className="font-mono font-bold text-brand-sage">{intensity}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-brand-sage"
                />
              </div>

              <button
                onClick={submitStateAnalysis}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand-sage text-white font-semibold text-xs hover:bg-brand-sage/90 transition shadow-sm"
              >
                Отправить в диалог
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pro Step Verifier Drawer */}
      {showStepModal && isPro && (
        <div className="p-4 border-b border-border bg-muted/40 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-celadon" />
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
                Модуль Pro: AI-Супервизия шагов действий
              </h4>
            </div>
            <button
              onClick={() => setShowStepModal(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Закрыть
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Название шага (например: Откровенно сказать партнеру о своих границах)"
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-brand-sage"
              />
              <textarea
                rows={2}
                placeholder="Как именно вы планируете его сделать? Что может помешать?"
                value={stepReflection}
                onChange={(e) => setStepReflection(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-brand-sage"
              />
              <button
                onClick={handleVerifyStep}
                disabled={isVerifyingStep || !stepTitle.trim()}
                className="px-4 py-2 rounded-lg bg-brand-dark dark:bg-brand-sage text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {isVerifyingStep ? "Анализирую..." : "Проверить на самосаботаж"}
              </button>
            </div>

            {stepAnalysisResult && (
              <div className="p-3 rounded-xl bg-card border border-border text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Индекс готовности:</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded ${
                      stepAnalysisResult.score >= 70
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {stepAnalysisResult.score} / 100
                  </span>
                </div>
                <p className="text-muted-foreground">{stepAnalysisResult.analysis}</p>
                {stepAnalysisResult.pitfalls?.length > 0 && (
                  <div>
                    <span className="font-semibold text-rose-500">Скрытые риски: </span>
                    <span className="text-muted-foreground">
                      {stepAnalysisResult.pitfalls.join("; ")}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-brand-sage">Рекомендация: </span>
                  <span className="text-muted-foreground">
                    {stepAnalysisResult.recommendation}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-brand-platinum text-brand-dark dark:bg-muted dark:text-foreground"
                    : "bg-brand-sage text-white"
                }`}
              >
                {isUser ? "Вы" : <Heart className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs whitespace-pre-wrap ${
                  isUser
                    ? "bg-brand-dark text-white rounded-tr-none dark:bg-brand-sage"
                    : "bg-muted/70 text-foreground border border-border/80 rounded-tl-none"
                }`}
              >
                {message.isProAnalysis && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-brand-sage dark:text-brand-celadon mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Глубинный психологический разбор Pro</span>
                  </div>
                )}
                <div>{message.content}</div>
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    isUser ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-sage text-white flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/70 border border-border text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-sage animate-ping" />
              <span>Коуч размышляет и калибрует ответ...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Starters (if conversation just started) */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-border/60 bg-muted/20 flex flex-wrap gap-1.5">
          {QUICK_STARTERS.map((starter) => (
            <button
              key={starter}
              onClick={() => handleSendMessage(starter)}
              className="text-xs px-3 py-1.5 rounded-full bg-card border border-border hover:border-brand-sage/60 hover:text-brand-sage text-muted-foreground transition"
            >
              {starter}
            </button>
          ))}
        </div>
      )}

      {/* Quota Exhausted Banner for Free Users */}
      {isExhausted && (
        <div className="p-3 bg-rose-500/10 border-t border-rose-500/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              10 минут практики на сегодня завершены. Автосброс произойдет в 12:00 (через {timeUntilReset}).
            </span>
          </div>
          <Link
            href="/pricing"
            className="px-3 py-1 rounded-lg bg-brand-sage text-white font-semibold hover:bg-brand-sage/90 transition shrink-0"
          >
            Снять лимит с Pro
          </Link>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-3 sm:p-4 border-t border-border bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isExhausted || isLoading}
            placeholder={
              isExhausted
                ? "Лимит 10 минут исчерпан. Сброс в 12:00 дня или переход на Pro..."
                : "Опишите ситуацию, мысль или ощущение..."
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-brand-sage transition disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || isExhausted || isLoading}
            className="w-10 h-10 rounded-xl bg-brand-dark dark:bg-brand-sage text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 disabled:hover:opacity-40 shadow-sm shrink-0"
            title="Отправить сообщение коучу"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
