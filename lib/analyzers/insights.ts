import { factualPhrases } from "@/lib/dictionaries/factualPhrases";
import { loadedWords } from "@/lib/dictionaries/loadedWords";
import { catastropheWords, fearWords } from "@/lib/dictionaries/panicWords";
import { countMatches, tokenize } from "@/lib/utils";
import type { ArticleAnalysis, HighlightMatch, InsightResult } from "./types";

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

export function getHighlights(): HighlightMatch[] {
  return [
    ...fearWords.map((phrase) => ({ phrase, kind: "panic" as const })),
    ...catastropheWords.map((phrase) => ({ phrase, kind: "panic" as const })),
    ...loadedWords.map((phrase) => ({ phrase, kind: "loaded" as const })),
    ...factualPhrases.map((phrase) => ({ phrase, kind: "evidence" as const }))
  ];
}

export function analyzeInsights(text: string, partial: Pick<ArticleAnalysis, "sentiment" | "objectivity" | "loadedLanguage" | "panic">): InsightResult {
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

  const emotionalWords = Array.from(wordCounts.entries())
    .filter(([term]) => loadedWords.includes(term) || fearWords.includes(term) || catastropheWords.includes(term))
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topFactualPhrases = factualPhrases
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
