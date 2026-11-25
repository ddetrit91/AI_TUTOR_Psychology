import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSecondsToMinutes(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getTimeUntilNextNoon(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const nextNoon = new Date();
  
  // Set to today at 12:00:00 (noon)
  nextNoon.setHours(12, 0, 0, 0);

  // If today's noon has already passed, target tomorrow's noon
  if (now.getTime() >= nextNoon.getTime()) {
    nextNoon.setDate(nextNoon.getDate() + 1);
  }

  const diffMs = nextNoon.getTime() - now.getTime();
  const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
  
  const hours = Math.floor(diffSecs / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;

  const formatted = `${hours}ч ${minutes.toString().padStart(2, "0")}м ${seconds.toString().padStart(2, "0")}с`;

  return { hours, minutes, seconds, formatted };
}
