import { attributionVerbs, factualPhrases } from "@/lib/dictionaries/factualPhrases";
import { opinionIndicators, subjectiveWords } from "@/lib/dictionaries/loadedWords";
import { clamp, countMatches, tokenize } from "@/lib/utils";
import type { ObjectivityResult } from "./types";

export function analyzeObjectivity(text: string): ObjectivityResult {
  const words = tokenize(text);
  const wordCount = Math.max(words.length, 1);
  const subjectiveCount =
    subjectiveWords.reduce((count, word) => count + words.filter((token) => token === word).length, 0) +
    countMatches(text, opinionIndicators);

  const evidencePhraseCount = countMatches(text, factualPhrases);
  const numericStats = text.match(/\b\d+(?:\.\d+)?%?|\b(?:one|two|three|four|five|six|seven|eight|nine|ten)\b/gi)?.length ?? 0;
  const quotedSources = text.match(/["“][^"”]{12,}["”]/g)?.length ?? 0;
  const attributionCount = attributionVerbs.reduce(
    (count, verb) => count + words.filter((token) => token === verb).length,
    0
  );
  const evidenceCount = evidencePhraseCount + numericStats + quotedSources + attributionCount;

  // Baseline is neutral-positive. Subjective density subtracts points; factual signals add them.
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
    explanation: `${evidenceCount} evidence signals and ${subjectiveCount} subjective signals were found across ${wordCount} words.`
  };
}
