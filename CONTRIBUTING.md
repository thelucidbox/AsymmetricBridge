# Contributing to Asymmetric Bridge

Thanks for your interest in contributing. This guide covers the basics.

## Getting Started

1. Fork the repository
2. Clone your fork and install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your API keys
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Development

- **Stack:** Vite + React 19 + Supabase + TanStack Query
- **Styling:** Inline styles via design tokens (`src/design-tokens/`). No CSS framework.
- **State:** React Context (`ThesisContext`) for thesis config, TanStack Query for server state, localStorage for persistence.
- **Data sources:** FRED, Twelve Data, CoinGecko — all free-tier. Adapters live in `src/lib/`.

## Project Structure

```
src/
  components/       # React components by feature
  config/           # Thesis config, schema validation, context
  data/             # Static data (dominos, sources, glossary)
  design-tokens/    # Theme variants (Terminal, Observatory)
  hooks/            # Custom React hooks
  lib/              # Utilities (API clients, parsers, engines)
```

## Making Changes

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Make your changes
3. Verify the build passes:
   ```bash
   npm run build
   ```
4. Commit using [conventional commits](https://www.conventionalcommits.org/):
   ```
   feat: Add new signal type
   fix: Handle empty API response in FRED adapter
   ```
5. Open a pull request against `main`

## Adding a Data Source

1. Create an adapter in `src/lib/` with a `fetch` function
2. Register it in `src/lib/data-sources.js`:
   ```js
   DataSourceRegistry.register("your_source", {
     fetch: yourFetchFunction,
     validate: (data) => data !== null && typeof data === "object",
     transform: (data) => data,
   });
   ```
3. Add the environment variable to `.env.example`

## Adding Signals to a Thesis

Edit `src/config/fabian-thesis.js` (or create your own thesis file). Each signal needs:
- `name`, `source`, `frequency`, `currentStatus`
- `baseline`, `threshold`, `notes`
- `dataPoints` (array of historical measurements)

## Reporting Issues

Open an issue with:
- What you expected vs what happened
- Browser and OS
- Console errors (if any)
- Steps to reproduce

## Code Style

- No TypeScript (planned for v3)
- Prefer named exports for utilities, default exports for components
- Use design tokens for all colors, spacing, and typography — no hardcoded values in new code
- Keep components focused — one responsibility per file
