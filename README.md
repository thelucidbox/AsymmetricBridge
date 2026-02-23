# Asymmetric Bridge

Strategic intelligence platform that merges live macro data with thesis tracking, portfolio analysis, and career positioning.

Define your macro thesis as a chain of dominos — each with measurable signals pulling from live data feeds. Upload your brokerage exports to see if your portfolio matches your beliefs. Track predictions, score your conviction over time, and generate publishable intelligence digests.

## Quickstart

```bash
git clone https://github.com/thelucidbox/AsymmetricBridge.git
cd AsymmetricBridge
npm install
cp .env.example .env   # Add your API keys
npm run dev
```

Open `http://localhost:5173` and run through the onboarding wizard to configure your thesis.

## API Keys (all free tier)

| Service | What it provides | Sign up |
|---------|-----------------|---------|
| **Supabase** | Database, auth, edge functions | [supabase.com](https://supabase.com) |
| **FRED** | Federal Reserve economic data (rates, inflation, employment) | [fred.stlouisfed.org/docs/api/api_key.html](https://fred.stlouisfed.org/docs/api/api_key.html) |
| **Twelve Data** | Stock/ETF quotes (800 calls/day free) | [twelvedata.com](https://twelvedata.com/pricing) |
| **CoinGecko** | Crypto/stablecoin data (free, key optional) | [coingecko.com](https://www.coingecko.com/en/api) |

## Features

**Thesis Framework** — Define dominos (macro forces) with signals that pull live data. Thresholds trigger status changes automatically.

**Performance Lab** — Upload brokerage CSV exports (Schwab, Fidelity, IBKR, Robinhood). Positions are mapped to thesis legs with an alignment score showing whether your bets match your beliefs.

**Conviction Ledger** — Record predictions when signals trip thresholds. Set evaluation windows (30/60/90 days). Outcomes are scored into a batting average over time.

**Signal Digest Engine** — Generate narrative intelligence briefs from live signal data. Export as Markdown, copy to clipboard, or download.

**Educational Layer** — Glossary tooltips on every macro term, "Why This Matters" on every signal, simplified/full mode toggle. Built for people without finance backgrounds.

**Design Variants** — Terminal (Bloomberg-style, IBM Plex) and Observatory (glass-morphism, Inter). Switch with a toggle, or build your own via design tokens.

## Stack

- **Frontend:** Vite + React 19
- **Data:** Supabase (Postgres + Edge Functions)
- **Queries:** TanStack Query
- **Routing:** React Router 7
- **Styling:** Design tokens (no CSS framework)

## Project Structure

```
src/
  components/          # UI by feature (onboarding, conviction, digests, etc.)
  config/              # Thesis config, schema validation, ThesisContext
  data/                # Static data (dominos, signals, glossary, sources)
  design-tokens/       # Theme variants + ThemeProvider
  hooks/               # React hooks (predictions, portfolios, signals, etc.)
  lib/                 # Utilities (API adapters, parsers, retry, export)
supabase/
  functions/           # Edge Functions (evaluate-thresholds)
```

## Configuration

All thesis data lives in `src/config/fabian-thesis.js`. To bring your own thesis:

1. Run the onboarding wizard (first launch), or
2. Copy `fabian-thesis.js`, rename it, define your dominos/signals/portfolio, and import it in `ThesisContext.jsx`

The `DataSourceRegistry` in `src/lib/data-sources.js` accepts new adapters with `{ fetch, validate, transform }`.

## Export

- **Digests** — Markdown copy/download from the Digests view
- **Conviction Ledger** — Markdown copy/download from the Conviction view
- **Performance Lab** — Markdown report copy/download from the Performance view

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
