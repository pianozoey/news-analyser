import { loadedWords } from "@/lib/dictionaries/loadedWords";
import { clamp, tokenize } from "@/lib/utils";
import type { LoadedLanguageResult } from "./types";

export function analyzeLoadedLanguage(text: string): LoadedLanguageResult {
  const words = tokenize(text);
  const counts = new Map<string, number>();

  for (const word of words) {
    if (loadedWords.includes(word)) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  const loadedWordCount = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
  const density = loadedWordCount / Math.max(words.length, 1);
  const score = Math.round(clamp(density * 1800 + Math.min(25, loadedWordCount * 2)));
  const commonWords = Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    score,
    loadedWordCount,
    commonWords,
    explanation: `${loadedWordCount} loaded terms were found, weighted by frequency and article length.`
  };
}
