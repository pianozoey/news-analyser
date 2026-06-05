import "server-only";
import { chromium as vanillaChromium } from "playwright";
import { addExtra } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { extractArticleFromHtml, type ExtractedArticle } from "@/lib/extractArticle";

const chromium = addExtra(vanillaChromium);
chromium.use(StealthPlugin());

export async function scrapeArticleUrl(url: string): Promise<ExtractedArticle> {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      extraHTTPHeaders: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      }
    });
    const page = await context.newPage();
    await page.goto(parsed.toString(), { waitUntil: "domcontentloaded", timeout: 45_000 });
    const html = await page.content();
    return extractArticleFromHtml(html, parsed.toString());
  } finally {
    await browser.close();
  }
}
