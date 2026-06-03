import type { SentimentResult } from "./types";

export function sentimentFromScore(sentimentScore: number): SentimentResult {
  const score = Math.round(sentimentScore * 100);
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
    explanation: `Ollama returned a structured sentiment score of ${sentimentScore.toFixed(2)}, normalized to ${score}.`
  };
}
