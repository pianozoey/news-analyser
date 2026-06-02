import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export type ExtractedArticle = {
  title: string;
  text: string;
  siteName?: string;
};

export function extractArticleFromHtml(html: string, url: string): ExtractedArticle {
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article?.textContent?.trim()) {
    throw new Error("Could not locate a readable article body on this page.");
  }

  return {
    title: article.title ?? "",
    text: article.textContent.replace(/\n{3,}/g, "\n\n").trim(),
    siteName: article.siteName ?? undefined
  };
}
