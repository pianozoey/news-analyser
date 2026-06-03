import "server-only";
import ollama from "ollama";

export type OllamaMediaAnalysis = {
  sentiment: "positive" | "negative" | "neutral";
  sentiment_score: number;
  bias_leaning: "Left" | "Center-Left" | "Center" | "Center-Right" | "Right";
  justification: string;
};

const mediaAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["sentiment", "sentiment_score", "bias_leaning", "justification"],
  properties: {
    sentiment: {
      type: "string",
      enum: ["positive", "negative", "neutral"]
    },
    sentiment_score: {
      type: "number",
      minimum: -1,
      maximum: 1
    },
    bias_leaning: {
      type: "string",
      enum: ["Left", "Center-Left", "Center", "Center-Right", "Right"]
    },
    justification: {
      type: "string",
      minLength: 1,
      maxLength: 700
    }
  }
} as const;

function isOllamaMediaAnalysis(value: unknown): value is OllamaMediaAnalysis {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    ["positive", "negative", "neutral"].includes(String(candidate.sentiment)) &&
    typeof candidate.sentiment_score === "number" &&
    candidate.sentiment_score >= -1 &&
    candidate.sentiment_score <= 1 &&
    ["Left", "Center-Left", "Center", "Center-Right", "Right"].includes(String(candidate.bias_leaning)) &&
    typeof candidate.justification === "string" &&
    candidate.justification.trim().length > 0
  );
}

export async function analyzeNewsWithOllama(articleText: string): Promise<OllamaMediaAnalysis> {
  try {
    const response = await ollama.chat({
      model: "llama3.1:8b",
      format: mediaAnalysisSchema,
      messages: [
        {
          role: "system",
          content:
            "You are an objective, elite media analyst. Evaluate the provided news article for sentiment and likely political bias. Be precise, fair, evidence-led, and avoid partisan assumptions. Return only JSON matching the provided schema."
        },
        {
          role: "user",
          content: `Analyze this article:\n\n${articleText}`
        }
      ],
      options: {
        temperature: 0
      }
    });

    const parsed = JSON.parse(response.message.content) as unknown;
    if (!isOllamaMediaAnalysis(parsed)) {
      throw new Error("Ollama returned JSON that did not match the expected media analysis schema.");
    }

    return {
      ...parsed,
      sentiment_score: Math.max(-1, Math.min(1, parsed.sentiment_score)),
      justification: parsed.justification.trim()
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Ollama analysis failure.";
    throw new Error(`Failed to analyze article with Ollama: ${message}`);
  }
}
