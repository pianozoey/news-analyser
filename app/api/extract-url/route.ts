import { NextResponse } from "next/server";
import { scrapeArticleUrl } from "@/app/actions/scrape";
import { extractArticleFromHtml } from "@/lib/extractArticle";

export async function POST(request: Request) {
  const { url } = (await request.json()) as { url?: string };

  if (!url) {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }

  try {
    return NextResponse.json(await scrapeArticleUrl(url));
  } catch (stealthError) {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json({ error: "Only http and https URLs are supported." }, { status: 400 });
      }

      const response = await fetch(parsed.toString(), {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        }
      });

      if (!response.ok) {
        const stealthMessage = stealthError instanceof Error ? stealthError.message : "Stealth scrape failed.";
        return NextResponse.json(
          { error: `Stealth scrape failed (${stealthMessage}). Plain fetch returned ${response.status}.` },
          { status: 502 }
        );
      }

      const html = await response.text();
      return NextResponse.json(extractArticleFromHtml(html, parsed.toString()));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to extract article.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
}
