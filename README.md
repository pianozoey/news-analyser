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
| **Ollama** (installed and running) | Article analysis |
| **`llama3.1:8b` model** pulled in Ollama | Article analysis |
| **Playwright Chromium** | URL extraction (optional) |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Install and start Ollama

Install from [ollama.com](https://ollama.com), then pull the model and start the server:

```bash
ollama pull llama3.1:8b
ollama serve
```

Verify Ollama is running:

```bash
ollama list
```

You should see `llama3.1:8b` in the list.

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

- Confirm Ollama is running: `curl http://localhost:11434/api/tags`
- Confirm the model is installed: `ollama pull llama3.1:8b`
- Restart the Next.js dev server after starting Ollama

**URL extraction fails**

- Run `npx playwright install chromium`
- Some sites block scraping; try pasting the article text manually

**Slow first analysis**

- The first request may be slow while Ollama loads the model into memory. Later requests are faster.

## License

Private project.
