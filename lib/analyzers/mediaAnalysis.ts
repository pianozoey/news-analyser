import "server-only";
import type { LanguageExtractions, MediaAnalysisResult } from "./types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemma-4-31b-it:free";

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "bias_leaning",
    "justification",
    "factual_phrases",
    "attribution_verbs",
    "loaded_words",
    "opinion_indicators",
    "subjective_words",
    "fear_words",
    "catastrophe_words",
    "urgency_indicators"
  ],
  properties: {
    bias_leaning: {
      type: "string",
      enum: ["Left", "Center-Left", "Center", "Center-Right", "Right"]
    },
    justification: {
      type: "string",
      minLength: 1,
      maxLength: 700
    },
    factual_phrases: {
      type: "array",
      items: { type: "string", minLength: 1 }
    },
    attribution_verbs: {
      type: "array",
      items: { type: "string", minLength: 1 }
    },
    loaded_words: {
      type: "array",
      items: { type: "string", minLength: 1 }
    },
    opinion_indicators: {
      type: "array",
      items: { type: "string", minLength: 1 }
    },
    subjective_words: {
      type: "array",
      items: { type: "string", minLength: 1 }
    },
    fear_words: {
      type: "array",
      items: { type: "string", minLength: 1 }
    },
    catastrophe_words: {
      type: "array",
      items: { type: "string", minLength: 1 }
    },
    urgency_indicators: {
      type: "array",
      items: { type: "string", minLength: 1 }
    }
  }
} as const;

const SYSTEM_PROMPT = `You are an objective media analyst. Do NOT score sentiment or objectivity. Your job is to:
1. Extract language signals that actually appear in the article.
2. Assess likely political bias leaning with a short justification.

Extract only words or phrases found in the text:
- factual_phrases: evidence/reporting phrases (e.g. "according to", "data shows", "officials said")
- attribution_verbs: verbs showing source attribution (e.g. "said", "reported", "confirmed")
- loaded_words: emotionally charged or editorializing terms (e.g. "outrageous", "shocking", "slammed")
- opinion_indicators: first-person or editorial opinion markers (e.g. "i think", "clearly", "obviously")
- subjective_words: value judgments (e.g. "terrible", "amazing", "worst", "perfect")
- fear_words: anxiety/risk language (e.g. "crisis", "threat", "warning")
- catastrophe_words: disaster framing (e.g. "disaster", "devastation", "chaos")
- urgency_indicators: time-pressure language (e.g. "breaking", "immediately", "urgent")

Return exact substrings from the article when possible. Use lowercase for single words. Return empty arrays when none are found.

Respond with valid JSON only matching this schema. No markdown fences or extra text.`;

type RawExtractionResponse = {
  bias_leaning: MediaAnalysisResult["bias_leaning"];
  justification: string;
  factual_phrases: string[];
  attribution_verbs: string[];
  loaded_words: string[];
  opinion_indicators: string[];
  subjective_words: string[];
  fear_words: string[];
  catastrophe_words: string[];
  urgency_indicators: string[];
};

function normalizeTerms(terms: string[]) {
  return [...new Set(terms.map((term) => term.trim().toLowerCase()).filter(Boolean))];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim().length > 0);
}

function isRawExtractionResponse(value: unknown): value is RawExtractionResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    ["Left", "Center-Left", "Center", "Center-Right", "Right"].includes(String(candidate.bias_leaning)) &&
    typeof candidate.justification === "string" &&
    candidate.justification.trim().length > 0 &&
    isStringArray(candidate.factual_phrases) &&
    isStringArray(candidate.attribution_verbs) &&
    isStringArray(candidate.loaded_words) &&
    isStringArray(candidate.opinion_indicators) &&
    isStringArray(candidate.subjective_words) &&
    isStringArray(candidate.fear_words) &&
    isStringArray(candidate.catastrophe_words) &&
    isStringArray(candidate.urgency_indicators)
  );
}

function toExtractions(raw: RawExtractionResponse): LanguageExtractions {
  return {
    factualPhrases: normalizeTerms(raw.factual_phrases),
    attributionVerbs: normalizeTerms(raw.attribution_verbs),
    loadedWords: normalizeTerms(raw.loaded_words),
    opinionIndicators: normalizeTerms(raw.opinion_indicators),
    subjectiveWords: normalizeTerms(raw.subjective_words),
    fearWords: normalizeTerms(raw.fear_words),
    catastropheWords: normalizeTerms(raw.catastrophe_words),
    urgencyIndicators: normalizeTerms(raw.urgency_indicators)
  };
}

function extractJsonContent(content: string): unknown {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate);
}

export async function analyzeNewsWithLLM(articleText: string): Promise<MediaAnalysisResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME ?? "NewsScope"
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "news_language_extraction",
            strict: true,
            schema: extractionSchema
          }
        },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Extract language signals and assess bias for this article:\n\n${articleText}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter request failed (${response.status}): ${errorBody}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content;
    if (!content?.trim()) {
      throw new Error("Model returned an empty response.");
    }

    const parsed = extractJsonContent(content);
    if (!isRawExtractionResponse(parsed)) {
      throw new Error("Model returned JSON that did not match the expected extraction schema.");
    }

    return {
      bias_leaning: parsed.bias_leaning,
      justification: parsed.justification.trim(),
      extractions: toExtractions(parsed)
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown analysis failure.";
    throw new Error(`Failed to analyze article: ${message}`);
  }
}
