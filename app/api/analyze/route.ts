import { NextResponse } from "next/server";
import { analyzeArticle } from "@/lib/analyzers";

export async function POST(request: Request) {
  try {
    const { headline, body } = (await request.json()) as { headline?: string; body?: string };

    if (!body?.trim()) {
      return NextResponse.json({ error: "Article body is required." }, { status: 400 });
    }

    const analysis = await analyzeArticle({ headline, body });
    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to analyze article.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
