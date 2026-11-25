"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { getTimeUntilNextNoon } from "@/lib/utils";

export interface SavedActionStep {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  checked: boolean;
  userReflection?: string;
  proFeedback?: string;
  verifiedAt?: string;
}

export interface UserContextType {
  isPro: boolean;
  plan: "free" | "pro";
  freeSecondsRemaining: number;
  totalFreeSeconds: number;
  isTimerRunning: boolean;
  timeUntilReset: string;
  completedLessons: string[];
  savedSteps: SavedActionStep[];
  toggleTimer: (running: boolean) => void;
  decrementSeconds: (delta?: number) => void;
  setPlan: (plan: "free" | "pro") => void;
  markLessonComplete: (lessonId: string) => void;
  saveActionStep: (step: SavedActionStep) => void;
  toggleStepChecked: (stepId: string) => void;
  updateStepFeedback: (stepId: string, feedback: string) => void;
  resetFreeQuotaManually: () => void;
}

const TOTAL_FREE_SECONDS = 600; // 10 minutes
const DEFAULT_USER_ID = "default-user";

const UserContext = createContext<UserContextType | undefined>(undefined);

async function postUserState(payload: Record<string, any>) {
  try {
    await fetch("/api/user/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: DEFAULT_USER_ID, ...payload }),
    });
  } catch {
    // Keep optimistic local state if offline
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [freeSecondsRemaining, setFreeSecondsRemaining] = useState<number>(TOTAL_FREE_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [savedSteps, setSavedSteps] = useState<SavedActionStep[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const lastSyncedSecondsRef = useRef<number>(TOTAL_FREE_SECONDS);

  // Hydrate from Lakebase Postgres (/api/user/state), falling back cleanly to localStorage
  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const res = await fetch(`/api/user/state?userId=${DEFAULT_USER_ID}`);
        if (res.ok && active) {
          const data = await res.json();
          setIsPro(data.plan === "pro");
          setFreeSecondsRemaining(
            typeof data.freeSecondsRemaining === "number"
              ? data.freeSecondsRemaining
              : TOTAL_FREE_SECONDS
          );
          lastSyncedSecondsRef.current = data.freeSecondsRemaining ?? TOTAL_FREE_SECONDS;
          setCompletedLessons(Array.isArray(data.completedLessons) ? data.completedLessons : []);
          setSavedSteps(Array.isArray(data.savedSteps) ? data.savedSteps : []);
          setIsInitialized(true);
          return;
        }
      } catch {
        // Fallback to localStorage below
      }

      if (!active) return;
      try {
        const storedPlan = localStorage.getItem("mindbalance_plan");
        if (storedPlan === "pro") setIsPro(true);
        const storedCompleted = localStorage.getItem("mindbalance_completed_lessons");
        if (storedCompleted) setCompletedLessons(JSON.parse(storedCompleted));
        const storedSteps = localStorage.getItem("mindbalance_saved_steps");
        if (storedSteps) setSavedSteps(JSON.parse(storedSteps));
      } catch {
        // Ignore
      } finally {
        setIsInitialized(true);
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, []);

  // Mirror state locally for fast client reloads
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("mindbalance_plan", isPro ? "pro" : "free");
      localStorage.setItem("mindbalance_completed_lessons", JSON.stringify(completedLessons));
      localStorage.setItem("mindbalance_saved_steps", JSON.stringify(savedSteps));
      localStorage.setItem("mindbalance_free_seconds", freeSecondsRemaining.toString());
    } catch {
      // Ignore
    }
  }, [isPro, completedLessons, savedSteps, freeSecondsRemaining, isInitialized]);

  // Dynamic countdown to next 12:00 PM (noon)
  useEffect(() => {
    const updateCountdown = () => {
      const { formatted } = getTimeUntilNextNoon();
      setTimeUntilReset(formatted);

      const now = new Date();
      if (now.getHours() === 12 && now.getMinutes() === 0 && now.getSeconds() < 2) {
        setFreeSecondsRemaining(TOTAL_FREE_SECONDS);
        postUserState({
          action: "syncQuota",
          freeSecondsRemaining: TOTAL_FREE_SECONDS,
          resetTimestamp: now.toISOString(),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer tick for active coach chat + periodic DB sync every 5 seconds
  useEffect(() => {
    if (!isTimerRunning || isPro) return;

    const interval = setInterval(() => {
      setFreeSecondsRemaining((prev) => {
        const next = prev <= 1 ? 0 : prev - 1;
        if (next === 0) setIsTimerRunning(false);
        if (Math.abs(lastSyncedSecondsRef.current - next) >= 5 || next === 0) {
          lastSyncedSecondsRef.current = next;
          postUserState({ action: "syncQuota", freeSecondsRemaining: next });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isPro]);

  const toggleTimer = (running: boolean) => {
    if (freeSecondsRemaining <= 0 && !isPro && running) return;
    setIsTimerRunning(running);
    if (!running) {
      lastSyncedSecondsRef.current = freeSecondsRemaining;
      postUserState({ action: "syncQuota", freeSecondsRemaining });
    }
  };

  const decrementSeconds = (delta = 1) => {
    if (isPro) return;
    setFreeSecondsRemaining((prev) => {
      const next = Math.max(0, prev - delta);
      postUserState({ action: "syncQuota", freeSecondsRemaining: next });
      return next;
    });
  };

  const setPlan = (newPlan: "free" | "pro") => {
    const proActive = newPlan === "pro";
    setIsPro(proActive);
    postUserState({ action: "setPlan", plan: newPlan });
  };

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
    postUserState({ action: "completeLesson", lessonId });
  };

  const saveActionStep = (step: SavedActionStep) => {
    setSavedSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === step.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = step;
        return updated;
      }
      return [step, ...prev];
    });
    postUserState({ action: "upsertStep", step });
  };

  const toggleStepChecked = (stepId: string) => {
    setSavedSteps((prev) =>
      prev.map((s) => {
        if (s.id === stepId) {
          const updated = { ...s, checked: !s.checked };
          postUserState({ action: "upsertStep", step: updated });
          return updated;
        }
        return s;
      })
    );
  };

  const updateStepFeedback = (stepId: string, feedback: string) => {
    const verifiedAt = new Date().toISOString();
    setSavedSteps((prev) =>
      prev.map((s) => {
        if (s.id === stepId) {
          const updated = { ...s, proFeedback: feedback, verifiedAt };
          postUserState({ action: "upsertStep", step: updated });
          return updated;
        }
        return s;
      })
    );
  };

  const resetFreeQuotaManually = () => {
    setFreeSecondsRemaining(TOTAL_FREE_SECONDS);
    lastSyncedSecondsRef.current = TOTAL_FREE_SECONDS;
    postUserState({
      action: "syncQuota",
      freeSecondsRemaining: TOTAL_FREE_SECONDS,
      resetTimestamp: new Date().toISOString(),
    });
  };

  return (
    <UserContext.Provider
      value={{
        isPro,
        plan: isPro ? "pro" : "free",
        freeSecondsRemaining,
        totalFreeSeconds: TOTAL_FREE_SECONDS,
        isTimerRunning,
        timeUntilReset,
        completedLessons,
        savedSteps,
        toggleTimer,
        decrementSeconds,
        setPlan,
        markLessonComplete,
        saveActionStep,
        toggleStepChecked,
        updateStepFeedback,
        resetFreeQuotaManually,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
