# Asymmetric Bridge

## Identity
**Type:** Web app (Strategic Intelligence Platform)
**Stack:** Vite + React + Supabase + FRED API + CoinGecko + Twelve Data
**Vision:** Strategic intelligence platform — personal edition is Fabian's command center with ALOS/Claude Code integration; open source edition lets anyone build their own macro thesis dashboard with onboarding wizard, educational layer, and brokerage integration.

## On-Demand Context
@.claude/context/data-sources.md
@docs/INDEX.md

## Current Phase
- v3.2: Shipped — backend persistence, accessibility, 46 e2e tests, Supabase infra deployed
- v3.3: Planning
- See `productivity/TODO.md` for milestone history and current tasks

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

## Shipped Features (v3.0-v3.2)
- Config layer + ThesisContext, Navigation + CommandCenter decomposition
- Educational layer (glossary, tooltips, simplified/full mode, guided tour)
- Signal system (freshness, timeline, cascade viz, feed health, auto-threshold)
- Performance Lab (CSV upload, leg mapping, alignment score)
- Conviction Ledger (predictions, scoring, batting average)
- Digest Engine (aggregator, templates, viewer, export)
- Design system (tokens, Terminal/Observatory themes, responsive)
- Edition system (Personal vs OSS), Onboarding wizard
- OSS packaging (LICENSE, README, CONTRIBUTING, exports)
- Backend: Supabase persistence, edge functions deployed, Telegram alerts

## ALOS Integration
- Pipeline: /pipeline status
- Session: /start-session → work → /wrap-up
- Quality: /self-review → /design-review → /baseline-ui → /fixing-accessibility → /fixing-metadata → /ship
- Signal updates: /signal-update skill
