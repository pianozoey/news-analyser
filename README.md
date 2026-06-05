# NewsScope

NewsScope analyzes news articles for sentiment, objectivity, loaded language, panic framing, and political bias leaning. Paste text, load a sample article, or extract from a URL.

## How it works

Analysis is a two-step pipeline:

1. **Language extraction (local LLM)** — A model reads the article and extracts terms that appear in the text: factual phrases, attribution verbs, loaded words, opinion markers, subjective words, fear/catastrophe/urgency language, plus a bias leaning with justification.
2. **Rule-based scoring** — Sentiment, objectivity, loaded-language, and panic scores are calculated from those extracted terms. The model does not assign those scores directly.

Highlights, insights, and charts are built from the extracted terms.

## Requirements

| Requirement | Needed for |
|---|---|
| **Node.js 18+** | Running the app |
| **OpenRouter API Key** | Article analysis (defaults to `google/gemma-4-31b-it:free`) |
| **Playwright Chromium** | URL extraction (optional) |

## Setup

### 1. Install dependencies

```bash
npm install










```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory (copied from `.env.example` or created manually) and add your OpenRouter credentials:

```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=google/gemma-4-31b-it:free
```

### 3. Install Playwright browsers (for URL extraction)

Only needed if you want to extract articles from URLs:

```bash
npx playwright install chromium
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Paste a headline and article body, or click a sample article button.
2. Optionally paste a URL and click **Extract** to pull the article text.
3. Analysis runs automatically after you stop typing (short debounce).
4. Review metric cards, highlighted language, and insight lists below the input.

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm run typecheck # TypeScript check
```

## Project structure

```
app/
  page.tsx              # Main UI
  api/analyze/          # Article analysis endpoint
  api/extract-url/      # URL extraction endpoint
  actions/scrape.ts     # Playwright-based page scraping
lib/
  analyzers/            # Extraction, scoring, and insight logic
  extractArticle.ts     # Readability-based HTML parsing
```

## Troubleshooting

**Analysis unavailable**

- Confirm `OPENROUTER_API_KEY` is configured in your `.env.local` file or host environment variables.
- Ensure the selected model is supported by your OpenRouter account/API key.
- Restart the Next.js dev server after updating environment variables.

**URL extraction fails**

- Run `npx playwright install chromium`
- Some sites block scraping; try pasting the article text manually.

## License

Private project.
