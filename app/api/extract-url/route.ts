import { NextResponse } from "next/server";
import { extractArticleFromHtml } from "@/lib/extractArticle";

export async function POST(request: Request) {
  const { url } = (await request.json()) as { url?: string };

  if (!url) {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Only http and https URLs are supported." }, { status: 400 });
    }

    const response = await fetch(parsed.toString(), {
      headers: {
        "user-agent": "NewsScope/0.1 article analysis bot"
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `The page returned ${response.status}.` }, { status: 502 });
    }

    const html = await response.text();
    return NextResponse.json(extractArticleFromHtml(html, parsed.toString()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to extract article.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
