import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .match(/[a-z][a-z'-]*/g) ?? [];
}

export function countMatches(text: string, phrases: string[]) {
  const lower = text.toLowerCase();
  return phrases.reduce((total, phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = lower.match(new RegExp(`\\b${escaped}\\b`, "g"));
    return total + (matches?.length ?? 0);
  }, 0);
}
