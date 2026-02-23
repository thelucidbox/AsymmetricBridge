# Asymmetric Bridge

## Identity
**Type:** Web app (Strategic Intelligence Platform)
**Stack:** Vite + React + Supabase + FRED API + CoinGecko + Twelve Data
**Vision:** Strategic intelligence platform — personal edition is Fabian's command center with ALOS/Claude Code integration; open source edition lets anyone build their own macro thesis dashboard with onboarding wizard, educational layer, and brokerage integration.

## On-Demand Context
@.claude/context/data-sources.md
@docs/INDEX.md

## Current Phase
- v1: Shipped (Features 1-6 done, 7-8 partial)
- v2: Active — 11 features, 60 tasks, parallel implementation via worktrees
- See `SPEC.md` for full v2 spec, `productivity/TODO.md` for task decomposition, `DECOMPOSITION.md` for worktree plan

## Constraints
- Supabase for all persistence (signal statuses, data points, assessments, portfolios, predictions, digests)
- Free-tier APIs only (FRED, CoinGecko, Twelve Data 800 calls/day)
- Signal status updates via live feeds, Claude Code sessions, AND cron evaluation
- Dark theme (IBM Plex Sans/Mono, #0D0D0F background) — themeable via design tokens in v2
- Not financial advice — educational/analytical framing
- CSV parsing is client-side (no server-side file handling)
- OSS version must be self-hostable (Vercel OR any static host + Supabase)

## Conventions
- Inline styles → migrating to design tokens (`src/design-tokens.js`) in v2
- Data separated from components: `src/data/` for static, `src/lib/` for live feeds, `src/config/` for thesis configuration (v2)
- Supabase client in `src/lib/supabase.js`
- Custom hooks for data fetching in `src/hooks/`
- Thesis config via React Context (`src/config/ThesisContext.jsx`) — components read from context, not direct imports (v2)
- New components go in subdirectories: `src/components/onboarding/`, `src/components/performance-lab/`, `src/components/conviction/`, `src/components/digests/`, `src/components/lucid-box/`

## v2 Feature Map
1. Configuration & Theming Layer — thesis.config.js, data source plugins, ThesisContext
2. Onboarding Wizard — career profile, resume ingestion, thesis setup, API keys
3. Navigation & Architecture — CommandCenter decomposition, persistent nav, error boundaries
4. Educational Layer — glossary tooltips, "Why This Matters", transmission narratives, Simplified/Full mode
5. Signal System Polish — freshness indicators, history timeline, cascade visual upgrade
6. Thesis Performance Lab — CSV brokerage upload, leg mapping, alignment score, QoQ performance
7. Conviction Ledger — prediction recording, scoring, thesis batting average
8. Signal Digest Engine — weekly narrative briefs, templates, export
9. Design System & Responsive — tokens, breakpoints, design pipeline, themeable
10. Backend Completion — deploy Telegram, cron evaluation, error handling, env validation
11. OSS Packaging & Export — LICENSE, README, CONTRIBUTING, export capabilities

## ALOS Integration
- Pipeline: /pipeline status
- Session: /start-session → work → /wrap-up
- Quality: /self-review → /design-review → /baseline-ui → /fixing-accessibility → /fixing-metadata → /ship
- Signal updates: /signal-update skill
