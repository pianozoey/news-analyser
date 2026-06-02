import { analyzeInsights, getHighlights } from "./insights";
import { analyzeLoadedLanguage } from "./loadedLanguage";
import { analyzeObjectivity } from "./objectivity";
import { analyzePanic } from "./panicMeter";
import { analyzeSentiment } from "./sentiment";
import type { ArticleAnalysis } from "./types";

export function analyzeArticle(input: { headline?: string; body: string }): ArticleAnalysis {
  const headline = input.headline?.trim() ?? "";
  const body = input.body.trim();
  const fullText = [headline, body].filter(Boolean).join("\n\n");
  const sentiment = analyzeSentiment(fullText);
  const objectivity = analyzeObjectivity(body);
  const loadedLanguage = analyzeLoadedLanguage(fullText);
  const panic = analyzePanic(fullText);
  const bodyPanic = analyzePanic(body);
  const headlinePanic = analyzePanic(headline || (body.split(/\n|\. /)[0] ?? ""));

  return {
    sentiment,
    objectivity,
    loadedLanguage,
    panic,
    bodyPanic,
    headlinePanic,
    insights: analyzeInsights(fullText, { sentiment, objectivity, loadedLanguage, panic }),
    highlights: getHighlights()
  };
}
