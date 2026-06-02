"use client";

import { useMemo, useState } from "react";
import { Activity, BarChart3, FileText, Gauge, LinkIcon, Loader2, Search, Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { analyzeArticle } from "@/lib/analyzers";
import type { ArticleAnalysis, HighlightKind } from "@/lib/analyzers/types";
import { sampleArticles } from "@/lib/samples";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ExtractState = "idle" | "loading" | "error";

const highlightStyles: Record<HighlightKind, string> = {
  panic: "bg-zinc-300 text-zinc-950 ring-zinc-500",
  loaded: "bg-stone-300 text-zinc-950 ring-stone-500",
  evidence: "bg-slate-200 text-slate-950 ring-slate-400"
};

const highlightTitles: Record<HighlightKind, string> = {
  panic: "Panic Language",
  loaded: "Loaded Language",
  evidence: "Evidence-Based Statement"
};

export default function Home() {
  const [headline, setHeadline] = useState(sampleArticles[0].headline);
  const [body, setBody] = useState(sampleArticles[0].body);
  const [url, setUrl] = useState("");
  const [extractState, setExtractState] = useState<ExtractState>("idle");
  const [error, setError] = useState("");

  const analysis = useMemo<ArticleAnalysis>(() => analyzeArticle({ headline, body }), [headline, body]);

  async function extractUrl() {
    setExtractState("loading");
    setError("");

    try {
      const response = await fetch("/api/extract-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url })
      });
      const payload = (await response.json()) as { title?: string; text?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not extract article.");
      }
      setHeadline(payload.title ?? "");
      setBody(payload.text ?? "");
      setExtractState("idle");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not extract article.");
      setExtractState("error");
    }
  }

  function loadSample(index: number) {
    const sample = sampleArticles[index];
    setHeadline(sample.headline);
    setBody(sample.body);
    setUrl("");
    setError("");
    setExtractState("idle");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8 lg:px-12">
        <header className="border-b-[3px] border-double border-primary pb-8">
          <div className="mono-label flex items-center justify-between border-b border-primary pb-3 text-[10px] text-muted-foreground">
            <span>Rule-Based NLP</span>
            <span className="flex items-center gap-2 text-foreground"><Search className="size-3" />NewsScope</span>
            <span></span>
          </div>
          <div className="py-10 text-center">
            <p className="mono-label mb-5 text-[11px] text-muted-foreground">Article sentiment desk</p>
            <h1 className="display-serif text-6xl font-normal leading-none tracking-normal text-foreground sm:text-7xl lg:text-8xl">
              News<em className="font-light text-zinc-500">Scope</em>
            </h1>
            <p className="display-serif mx-auto mt-5 max-w-2xl text-xl italic leading-8 text-zinc-600">
              Transparent scoring for sentiment, objectivity, loaded language, and headline panic.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 border-t border-primary pt-4">
            {sampleArticles.map((sample, index) => (
              <Button key={sample.title} className="h-9 bg-zinc-100 text-primary hover:bg-zinc-200" onClick={() => loadSample(index)}>
                <FileText className="mr-2 size-4" />
                {sample.title}
              </Button>
            ))}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <Card>
            <CardHeader>
              <CardTitle>01 / Article Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Paste a news article URL" value={url} onChange={(event) => setUrl(event.target.value)} />
                <Button onClick={extractUrl} disabled={!url || extractState === "loading"} className="shrink-0">
                  {extractState === "loading" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <LinkIcon className="mr-2 size-4" />}
                  Extract
                </Button>
              </div>
              {error ? <p className="rounded-sm border border-zinc-500 bg-zinc-200 px-3 py-2 text-sm text-zinc-900">{error}</p> : null}
              <Input placeholder="Headline" value={headline} onChange={(event) => setHeadline(event.target.value)} />
              <Textarea placeholder="Paste article text" value={body} onChange={(event) => setBody(event.target.value)} />
            </CardContent>
          </Card>

          <section className="grid gap-6 sm:grid-cols-2">
            <MetricCard
              icon={<Activity className="size-4" />}
              title="Sentiment"
              score={analysis.sentiment.score}
              label={analysis.sentiment.label}
              explanation={analysis.sentiment.explanation}
              variant="sentiment"
            />
            <MetricCard
              icon={<BarChart3 className="size-4" />}
              title="Objectivity"
              score={analysis.objectivity.score}
              label={analysis.objectivity.label}
              explanation={analysis.objectivity.explanation}
            />
            <MetricCard
              icon={<Sparkles className="size-4" />}
              title="Loaded Language"
              score={analysis.loadedLanguage.score}
              label={`${analysis.loadedLanguage.loadedWordCount} terms found`}
              explanation={analysis.loadedLanguage.explanation}
            />
            <PanicCard analysis={analysis} />
          </section>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <HighlightedArticle headline={headline} body={body} analysis={analysis} />
          <Insights analysis={analysis} />
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  icon,
  title,
  score,
  label,
  explanation,
  variant = "default"
}: {
  icon: React.ReactNode;
  title: string;
  score: number;
  label: string;
  explanation: string;
  variant?: "default" | "sentiment";
}) {
  const gaugeValue = variant === "sentiment" ? score + 100 : score;
  const max = variant === "sentiment" ? 200 : 100;
  const color = variant === "sentiment" ? (score < -15 ? "#52525b" : score > 15 ? "#3f3f46" : "#71717a") : "#3f3f46";

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">{icon}{title}</CardTitle>
        <Badge>{label}</Badge>
      </CardHeader>
      <CardContent>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="68%" outerRadius="92%" data={[{ value: gaugeValue }]} startAngle={180} endAngle={0}>
              <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={2} fill={color} background={{ fill: "#d6d3d1" }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-end justify-between">
          <strong className="display-serif text-4xl font-normal tracking-normal">{score}</strong>
          <span className="mono-label text-[10px] text-muted-foreground">{variant === "sentiment" ? "-100 to +100" : "0 to 100"}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{explanation}</p>
      </CardContent>
    </Card>
  );
}

function PanicCard({ analysis }: { analysis: ArticleAnalysis }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Gauge className="size-4" />Panic Meter</CardTitle>
        <Badge>{analysis.panic.label}</Badge>
      </CardHeader>
      <CardContent>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: "Panic", score: analysis.panic.score }]} layout="vertical" margin={{ left: 0, right: 0, top: 14, bottom: 10 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="name" hide />
              <Bar dataKey="score" radius={[2, 2, 2, 2]} background={{ fill: "#d6d3d1", radius: 2 }}>
                <Cell fill={analysis.panic.score > 60 ? "#27272a" : analysis.panic.score > 35 ? "#52525b" : "#71717a"} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-end justify-between">
          <strong className="display-serif text-4xl font-normal">{analysis.panic.score}</strong>
          <span className="mono-label text-[10px] text-muted-foreground">0 to 100</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span>Headline Panic: <b className="text-foreground">{analysis.headlinePanic.score}</b></span>
          <span>Article Panic: <b className="text-foreground">{analysis.bodyPanic.score}</b></span>
        </div>
      </CardContent>
    </Card>
  );
}

function HighlightedArticle({ headline, body, analysis }: { headline: string; body: string; analysis: ArticleAnalysis }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Highlight Mode</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge className="border-zinc-500 bg-zinc-300 text-zinc-950">Panic</Badge>
          <Badge className="border-stone-500 bg-stone-300 text-zinc-950">Loaded</Badge>
          <Badge className="border-slate-400 bg-slate-200 text-slate-950">Evidence</Badge>
        </div>
        <article className="max-h-[34rem] overflow-auto rounded-sm border border-primary/70 bg-zinc-50 p-5 text-sm leading-7">
          {headline ? <h2 className="display-serif mb-4 border-b border-primary/40 pb-3 text-2xl font-normal leading-8">{renderHighlightedText(headline, analysis)}</h2> : null}
          <div className="whitespace-pre-wrap">{renderHighlightedText(body, analysis)}</div>
        </article>
      </CardContent>
    </Card>
  );
}

function renderHighlightedText(text: string, analysis: ArticleAnalysis) {
  const phrases = analysis.highlights
    .slice()
    .sort((a, b) => b.phrase.length - a.phrase.length)
    .map((item) => ({ ...item, escaped: item.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") }));
  const pattern = new RegExp(`\\b(${phrases.map((item) => item.escaped).join("|")})\\b`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    const match = phrases.find((item) => item.phrase.toLowerCase() === part.toLowerCase());
    if (!match) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }
    return (
      <mark
        key={`${part}-${index}`}
        title={highlightTitles[match.kind]}
        className={cn("rounded-sm px-1 py-0.5 ring-1", highlightStyles[match.kind])}
      >
        {part}
      </mark>
    );
  });
}

function Insights({ analysis }: { analysis: ArticleAnalysis }) {
  const loadedData = analysis.loadedLanguage.commonWords.map((item) => ({ name: item.word, value: item.count }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Key Insights</CardTitle>
          <Badge>{analysis.insights.dominantTone}</Badge>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InsightList title="Most Emotional Words" items={analysis.insights.emotionalWords.map((item) => `${item.term} (${item.count})`)} />
          <InsightList title="Most Repeated Terms" items={analysis.insights.repeatedTerms.map((item) => `${item.term} (${item.count})`)} />
          <InsightList title="Most Factual Phrases" items={analysis.insights.factualPhrases.map((item) => `${item.term} (${item.count})`)} />
          <InsightList title="Loaded Words" items={analysis.loadedLanguage.commonWords.map((item) => `${item.word} (${item.count})`)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loaded Language Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loadedData.length ? loadedData : [{ name: "none", value: 0 }]} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#52525b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#52525b" }} />
                <Bar dataKey="value" fill="#3f3f46" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-sm border border-primary/50 bg-zinc-50 p-3">
      <h4 className="mono-label mb-2 text-[10px] font-semibold text-muted-foreground">{title}</h4>
      {items.length ? (
        <ol className="space-y-1 text-sm text-muted-foreground">
          {items.slice(0, 10).map((item) => <li key={item}>{item}</li>)}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">No strong signals found.</p>
      )}
    </div>
  );
}
