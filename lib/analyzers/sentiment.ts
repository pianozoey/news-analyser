import type { SentimentResult } from "./types";

type VaderModule = {
  SentimentIntensityAnalyzer: {
    polarity_scores: (text: string) => { compound: number };
  };
};

// vader-sentiment is a compact open-source implementation of VADER.
// The compound score is normalized from -1..1 into the requested -100..100 range.
export function analyzeSentiment(text: string): SentimentResult {
  const vader = require("vader-sentiment") as VaderModule;
  const compound = vader.SentimentIntensityAnalyzer.polarity_scores(text).compound;
  const score = Math.round(compound * 100);
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
    explanation: `VADER produced a compound sentiment of ${compound.toFixed(3)}, normalized to ${score}.`
  };
}
