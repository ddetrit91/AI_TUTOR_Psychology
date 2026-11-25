"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { getTimeUntilNextNoon } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";

export interface AuthUserInfo {
  id: string;
  email: string;
  name?: string | null;
}

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
  user: AuthUserInfo | null;
  isAuthLoading: boolean;
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
  refreshUserState: () => Promise<void>;
  signOut: () => Promise<void>;
}

const TOTAL_FREE_SECONDS = 600; // 10 minutes

const UserContext = createContext<UserContextType | undefined>(undefined);

async function postUserState(payload: Record<string, any>) {
  try {
    await fetch("/api/user/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Keep optimistic state if offline
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData, isPending: isAuthLoading } = authClient.useSession();
  const sessionUser = sessionData?.user
    ? {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
      }
    : null;

  const [isPro, setIsPro] = useState<boolean>(false);
  const [freeSecondsRemaining, setFreeSecondsRemaining] = useState<number>(TOTAL_FREE_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [savedSteps, setSavedSteps] = useState<SavedActionStep[]>([]);
  const lastSyncedSecondsRef = useRef<number>(TOTAL_FREE_SECONDS);

  const refreshUserState = useCallback(async () => {
    if (!sessionUser?.id) {
      setIsPro(false);
      setFreeSecondsRemaining(TOTAL_FREE_SECONDS);
      setCompletedLessons([]);
      setSavedSteps([]);
      return;
    }

    try {
      const res = await fetch("/api/user/state");
      if (res.ok) {
        const data = await res.json();
        setIsPro(data.plan === "pro");
        const remaining =
          typeof data.freeSecondsRemaining === "number"
            ? data.freeSecondsRemaining
            : TOTAL_FREE_SECONDS;
        setFreeSecondsRemaining(remaining);
        lastSyncedSecondsRef.current = remaining;
        setCompletedLessons(Array.isArray(data.completedLessons) ? data.completedLessons : []);
        setSavedSteps(Array.isArray(data.savedSteps) ? data.savedSteps : []);
      }
    } catch {
      // Ignore network error
    }
  }, [sessionUser?.id]);

  useEffect(() => {
    if (!isAuthLoading) {
      refreshUserState();
    }
  }, [isAuthLoading, refreshUserState]);

  // Dynamic countdown to next 12:00 PM (noon)
  useEffect(() => {
    const updateCountdown = () => {
      const { formatted } = getTimeUntilNextNoon();
      setTimeUntilReset(formatted);

      const now = new Date();
      if (now.getHours() === 12 && now.getMinutes() === 0 && now.getSeconds() < 2) {
        setFreeSecondsRemaining(TOTAL_FREE_SECONDS);
        if (sessionUser?.id) {
          postUserState({
            action: "syncQuota",
            freeSecondsRemaining: TOTAL_FREE_SECONDS,
            resetTimestamp: now.toISOString(),
          });
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [sessionUser?.id]);

  // Timer tick for active coach chat + periodic DB sync every 5 seconds
  useEffect(() => {
    if (!isTimerRunning || isPro) return;

    const interval = setInterval(() => {
      setFreeSecondsRemaining((prev) => {
        const next = prev <= 1 ? 0 : prev - 1;
        if (next === 0) setIsTimerRunning(false);
        if (sessionUser?.id && (Math.abs(lastSyncedSecondsRef.current - next) >= 5 || next === 0)) {
          lastSyncedSecondsRef.current = next;
          postUserState({ action: "syncQuota", freeSecondsRemaining: next });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isPro, sessionUser?.id]);

  const toggleTimer = (running: boolean) => {
    if (freeSecondsRemaining <= 0 && !isPro && running) return;
    setIsTimerRunning(running);
    if (!running && sessionUser?.id) {
      lastSyncedSecondsRef.current = freeSecondsRemaining;
      postUserState({ action: "syncQuota", freeSecondsRemaining });
    }
  };

  const decrementSeconds = (delta = 1) => {
    if (isPro) return;
    setFreeSecondsRemaining((prev) => {
      const next = Math.max(0, prev - delta);
      if (sessionUser?.id) {
        postUserState({ action: "syncQuota", freeSecondsRemaining: next });
      }
      return next;
    });
  };

  const setPlan = (newPlan: "free" | "pro") => {
    setIsPro(newPlan === "pro");
  };

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
    if (sessionUser?.id) {
      postUserState({ action: "completeLesson", lessonId });
    }
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
    if (sessionUser?.id) {
      postUserState({ action: "upsertStep", step });
    }
  };

  const toggleStepChecked = (stepId: string) => {
    setSavedSteps((prev) =>
      prev.map((s) => {
        if (s.id === stepId) {
          const updated = { ...s, checked: !s.checked };
          if (sessionUser?.id) {
            postUserState({ action: "upsertStep", step: updated });
          }
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
          if (sessionUser?.id) {
            postUserState({ action: "upsertStep", step: updated });
          }
          return updated;
        }
        return s;
      })
    );
  };

  const resetFreeQuotaManually = () => {
    setFreeSecondsRemaining(TOTAL_FREE_SECONDS);
    lastSyncedSecondsRef.current = TOTAL_FREE_SECONDS;
    if (sessionUser?.id) {
      postUserState({
        action: "syncQuota",
        freeSecondsRemaining: TOTAL_FREE_SECONDS,
        resetTimestamp: new Date().toISOString(),
      });
    }
  };

  const signOut = async () => {
    await authClient.signOut();
    setIsPro(false);
    setFreeSecondsRemaining(TOTAL_FREE_SECONDS);
    setCompletedLessons([]);
    setSavedSteps([]);
  };

  return (
    <UserContext.Provider
      value={{
        user: sessionUser,
        isAuthLoading,
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
        refreshUserState,
        signOut,
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
