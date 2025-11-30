import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a time string to time-of-day (HH:mm) in the user's local timezone.
 * Accepts ISO/RFC strings or epoch millis (as string); returns input on parse failure.
 */
export function formatTime(time: string): string {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function makeClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function titleCase(text: string): string {
  return text.replace(/\w\S*/g, (w) =>
    w.replace(/^\w/, (c) => c.toUpperCase())
  );
}
