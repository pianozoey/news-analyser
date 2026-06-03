import "server-only";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { extractArticleFromHtml, type ExtractedArticle } from "@/lib/extractArticle";

chromium.use(StealthPlugin());

export async function scrapeArticleUrl(url: string): Promise<ExtractedArticle> {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(parsed.toString(), { waitUntil: "domcontentloaded", timeout: 45_000 });
    const html = await page.content();
    return extractArticleFromHtml(html, parsed.toString());
  } finally {
    await browser.close();
  }
}
