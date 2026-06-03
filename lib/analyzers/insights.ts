import { countMatches, tokenize } from "@/lib/utils";
import { termFrequencies } from "./loadedLanguage";
import type { ArticleAnalysis, HighlightMatch, InsightResult, LanguageExtractions } from "./types";

const stopWords = new Set([
  "about",
  "after",
  "again",
  "also",
  "and",
  "are",
  "because",
  "but",
  "for",
  "from",
  "has",
  "have",
  "into",
  "not",
  "that",
  "the",
  "their",
  "this",
  "was",
  "were",
  "will",
  "with"
]);

export function getHighlights(extractions: LanguageExtractions): HighlightMatch[] {
  return [
    ...extractions.fearWords.map((phrase) => ({ phrase, kind: "panic" as const })),
    ...extractions.catastropheWords.map((phrase) => ({ phrase, kind: "panic" as const })),
    ...extractions.urgencyIndicators.map((phrase) => ({ phrase, kind: "panic" as const })),
    ...extractions.loadedWords.map((phrase) => ({ phrase, kind: "loaded" as const })),
    ...extractions.factualPhrases.map((phrase) => ({ phrase, kind: "evidence" as const })),
    ...extractions.attributionVerbs.map((phrase) => ({ phrase, kind: "evidence" as const }))
  ];
}

export function analyzeInsights(
  text: string,
  extractions: LanguageExtractions,
  partial: Pick<ArticleAnalysis, "sentiment" | "objectivity" | "loadedLanguage" | "panic">
): InsightResult {
  const words = tokenize(text);
  const wordCounts = new Map<string, number>();

  for (const word of words) {
    if (word.length > 3 && !stopWords.has(word)) {
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
    }
  }

  const repeatedTerms = Array.from(wordCounts.entries())
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const emotionalTerms = [...extractions.loadedWords, ...extractions.fearWords, ...extractions.catastropheWords];
  const emotionalWords = termFrequencies(text, emotionalTerms)
    .map(({ word, count }) => ({ term: word, count }))
    .slice(0, 10);

  const topFactualPhrases = extractions.factualPhrases
    .map((term) => ({ term, count: countMatches(text, [term]) }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const dominantTone =
    partial.panic.score >= 55
      ? "Alarmist"
      : partial.objectivity.score >= 75
        ? "Informative"
        : partial.sentiment.score >= 35
          ? "Optimistic"
          : partial.sentiment.score <= -45 && partial.loadedLanguage.score >= 35
            ? "Critical"
            : partial.sentiment.score <= -25
              ? "Skeptical"
              : "Neutral";

  return {
    emotionalWords,
    repeatedTerms,
    factualPhrases: topFactualPhrases,
    dominantTone
  };
}
