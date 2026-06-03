import { analyzeInsights, getHighlights } from "./insights";
import { analyzeLoadedLanguage } from "./loadedLanguage";
import { analyzeNewsWithOllama } from "./ollamaMediaAnalysis";
import { analyzeObjectivity } from "./objectivity";
import { analyzePanic } from "./panicMeter";
import { analyzeSentiment } from "./sentiment";
import type { ArticleAnalysis } from "./types";

export async function analyzeArticle(input: { headline?: string; body: string }): Promise<ArticleAnalysis> {
  const headline = input.headline?.trim() ?? "";
  const body = input.body.trim();
  const fullText = [headline, body].filter(Boolean).join("\n\n");
  const mediaAnalysis = await analyzeNewsWithOllama(fullText);
  const { extractions } = mediaAnalysis;
  const sentiment = analyzeSentiment(fullText, extractions);
  const objectivity = analyzeObjectivity(body, extractions);
  const loadedLanguage = analyzeLoadedLanguage(fullText, extractions.loadedWords);
  const panic = analyzePanic(fullText, extractions);
  const bodyPanic = analyzePanic(body, extractions);
  const headlinePanic = analyzePanic(headline || (body.split(/\n|\. /)[0] ?? ""), extractions);

  return {
    mediaAnalysis,
    sentiment,
    objectivity,
    loadedLanguage,
    panic,
    bodyPanic,
    headlinePanic,
    insights: analyzeInsights(fullText, extractions, { sentiment, objectivity, loadedLanguage, panic }),
    highlights: getHighlights(extractions)
  };
}
