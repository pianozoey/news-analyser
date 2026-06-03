import { clamp, countMatches } from "@/lib/utils";
import type { LoadedLanguageResult } from "./types";

export function termFrequencies(text: string, terms: string[]) {
  const uniqueTerms = [...new Set(terms.map((term) => term.trim().toLowerCase()).filter(Boolean))];

  return uniqueTerms
    .map((term) => ({ word: term, count: countMatches(text, [term]) }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function analyzeLoadedLanguage(text: string, loadedWords: string[]): LoadedLanguageResult {
  const words = text.toLowerCase().match(/[a-z][a-z'-]*/g) ?? [];
  const commonWords = termFrequencies(text, loadedWords).slice(0, 10);
  const loadedWordCount = commonWords.reduce((sum, item) => sum + item.count, 0);
  const density = loadedWordCount / Math.max(words.length, 1);
  const score = Math.round(clamp(density * 1800 + Math.min(25, loadedWordCount * 2)));

  return {
    score,
    loadedWordCount,
    commonWords,
    explanation: `${loadedWordCount} extracted loaded terms were found, weighted by frequency and article length.`
  };
}
