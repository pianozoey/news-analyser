import { clamp, countMatches, tokenize } from "@/lib/utils";
import type { LanguageExtractions, ObjectivityResult } from "./types";

export function analyzeObjectivity(text: string, extractions: LanguageExtractions): ObjectivityResult {
  const words = tokenize(text);
  const wordCount = Math.max(words.length, 1);
  const subjectiveCount =
    countMatches(text, extractions.subjectiveWords) + countMatches(text, extractions.opinionIndicators);

  const evidencePhraseCount = countMatches(text, extractions.factualPhrases);
  const numericStats = text.match(/\b\d+(?:\.\d+)?%?|\b(?:one|two|three|four|five|six|seven|eight|nine|ten)\b/gi)?.length ?? 0;
  const quotedSources = text.match(/["“][^"”]{12,}["”]/g)?.length ?? 0;
  const attributionCount = countMatches(text, extractions.attributionVerbs);
  const evidenceCount = evidencePhraseCount + numericStats + quotedSources + attributionCount;

  const subjectivePenalty = (subjectiveCount / wordCount) * 900;
  const evidenceReward = Math.min(28, evidenceCount * 3.5);
  const score = Math.round(clamp(68 - subjectivePenalty + evidenceReward));
  const label =
    score >= 84
      ? "Highly Objective"
      : score >= 68
        ? "Mostly Objective"
        : score >= 48
          ? "Mixed"
          : score >= 25
            ? "Opinion-Heavy"
            : "Highly Subjective";

  return {
    score,
    label,
    evidenceCount,
    subjectiveCount,
    explanation: `${evidenceCount} evidence signals and ${subjectiveCount} subjective signals were extracted across ${wordCount} words.`
  };
}
