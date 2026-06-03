export type MetricResult = {
  score: number;
  explanation: string;
};

export type SentimentResult = MetricResult & {
  label: "Negative" | "Slightly Negative" | "Neutral" | "Slightly Positive" | "Positive";
};

export type LanguageExtractions = {
  factualPhrases: string[];
  attributionVerbs: string[];
  loadedWords: string[];
  opinionIndicators: string[];
  subjectiveWords: string[];
  fearWords: string[];
  catastropheWords: string[];
  urgencyIndicators: string[];
};

export type MediaAnalysisResult = {
  bias_leaning: "Left" | "Center-Left" | "Center" | "Center-Right" | "Right";
  justification: string;
  extractions: LanguageExtractions;
};

export type ObjectivityResult = MetricResult & {
  label: "Highly Objective" | "Mostly Objective" | "Mixed" | "Opinion-Heavy" | "Highly Subjective";
  evidenceCount: number;
  subjectiveCount: number;
};

export type LoadedLanguageResult = MetricResult & {
  loadedWordCount: number;
  commonWords: Array<{ word: string; count: number }>;
};

export type PanicResult = MetricResult & {
  label: "Calm Reporting" | "Slightly Dramatic" | "Noticeably Alarming" | "Highly Alarmist" | "Maximum Panic Mode";
  fearCount: number;
  catastropheCount: number;
  urgencyCount: number;
  formattingCount: number;
};

export type HighlightKind = "panic" | "loaded" | "evidence";

export type HighlightMatch = {
  phrase: string;
  kind: HighlightKind;
};

export type InsightResult = {
  emotionalWords: Array<{ term: string; count: number }>;
  repeatedTerms: Array<{ term: string; count: number }>;
  factualPhrases: Array<{ term: string; count: number }>;
  dominantTone: "Informative" | "Alarmist" | "Neutral" | "Optimistic" | "Skeptical" | "Critical";
};

export type ArticleAnalysis = {
  mediaAnalysis: MediaAnalysisResult;
  sentiment: SentimentResult;
  objectivity: ObjectivityResult;
  loadedLanguage: LoadedLanguageResult;
  panic: PanicResult;
  headlinePanic: PanicResult;
  bodyPanic: PanicResult;
  insights: InsightResult;
  highlights: HighlightMatch[];
};
