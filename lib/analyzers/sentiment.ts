import { countMatches, tokenize } from "@/lib/utils";
import type { LanguageExtractions, SentimentResult } from "./types";

const positiveSubjective = new Set(["amazing", "beautiful", "best", "good", "perfect"]);
const negativeSubjective = new Set(["awful", "bad", "disastrous", "horrible", "poor", "terrible", "worst"]);

function clampSentiment(value: number) {
  return Math.min(100, Math.max(-100, value));
}

export function analyzeSentiment(text: string, extractions: LanguageExtractions): SentimentResult {
  const words = tokenize(text);
  const wordCount = Math.max(words.length, 1);

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of extractions.subjectiveWords) {
    const count = countMatches(text, [word]);
    if (positiveSubjective.has(word)) {
      positiveCount += count;
    } else if (negativeSubjective.has(word)) {
      negativeCount += count;
    } else {
      negativeCount += count;
    }
  }

  negativeCount += countMatches(text, extractions.loadedWords);
  negativeCount += countMatches(text, extractions.fearWords);
  negativeCount += countMatches(text, extractions.catastropheWords);
  negativeCount += countMatches(text, extractions.urgencyIndicators);
  negativeCount += countMatches(text, extractions.opinionIndicators);

  const balance = (positiveCount - negativeCount) / wordCount;
  const score = Math.round(clampSentiment(balance * 900));
  const label =
    score <= -55
      ? "Negative"
      : score <= -15
        ? "Slightly Negative"
        : score < 15
          ? "Neutral"
          : score < 55
            ? "Slightly Positive"
            : "Positive";

  return {
    score,
    label,
    explanation: `${positiveCount} positive and ${negativeCount} negative extracted language signals were found across ${wordCount} words.`
  };
}
