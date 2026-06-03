import { analyzeInsights, getHighlights } from "./insights";
import { analyzeLoadedLanguage } from "./loadedLanguage";
import { analyzeObjectivity } from "./objectivity";
import { analyzeNewsWithOllama } from "./ollamaMediaAnalysis";
import { analyzePanic } from "./panicMeter";
import { sentimentFromScore } from "./sentiment";
import type { ArticleAnalysis } from "./types";

export async function analyzeArticle(input: { headline?: string; body: string }): Promise<ArticleAnalysis> {
  const headline = input.headline?.trim() ?? "";
  const body = input.body.trim();
  const fullText = [headline, body].filter(Boolean).join("\n\n");
  const mediaAnalysis = await analyzeNewsWithOllama(fullText);
  const sentiment = sentimentFromScore(mediaAnalysis.sentiment_score);
  const objectivity = analyzeObjectivity(body);
  const loadedLanguage = analyzeLoadedLanguage(fullText);
  const panic = analyzePanic(fullText);
  const bodyPanic = analyzePanic(body);
  const headlinePanic = analyzePanic(headline || (body.split(/\n|\. /)[0] ?? ""));

  return {
    mediaAnalysis,
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
