import { clamp, countMatches, tokenize } from "@/lib/utils";
import type { LanguageExtractions, PanicResult } from "./types";

export function analyzePanic(
  text: string,
  extractions: Pick<LanguageExtractions, "fearWords" | "catastropheWords" | "urgencyIndicators">
): PanicResult {
  const words = tokenize(text);
  const fearCount = countMatches(text, extractions.fearWords);
  const catastropheCount = countMatches(text, extractions.catastropheWords);
  const urgencyCount = countMatches(text, extractions.urgencyIndicators);
  const allCapsCount = text.match(/\b[A-Z]{3,}\b/g)?.length ?? 0;
  const exclamationCount = text.match(/!{1,}/g)?.join("").length ?? 0;
  const repeatedDramaCount = text.match(/\b(\w+)\b(?:\W+\1\b){1,}/gi)?.length ?? 0;
  const formattingCount = allCapsCount + exclamationCount + repeatedDramaCount;

  const raw =
    fearCount * 5 +
    catastropheCount * 8 +
    urgencyCount * 9 +
    formattingCount * 4 +
    ((fearCount + catastropheCount + urgencyCount) / Math.max(words.length, 1)) * 900;
  const score = Math.round(clamp(raw));
  const label =
    score <= 20
      ? "Calm Reporting"
      : score <= 40
        ? "Slightly Dramatic"
        : score <= 60
          ? "Noticeably Alarming"
          : score <= 80
            ? "Highly Alarmist"
            : "Maximum Panic Mode";

  return {
    score,
    label,
    fearCount,
    catastropheCount,
    urgencyCount,
    formattingCount,
    explanation: `${fearCount} fear, ${catastropheCount} catastrophe, ${urgencyCount} urgency, and ${formattingCount} formatting signals contributed to this score.`
  };
}
