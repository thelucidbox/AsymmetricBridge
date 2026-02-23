# Asymmetric Bridge

## Identity
**Type:** Web app (Command Center + Signal Tracker)
**Stack:** Vite + React + Supabase + FRED API + CoinGecko + Financial Data APIs
**Vision:** Personal strategic intelligence dashboard combining Lucid Box business planning with macro signal tracking — live data feeds meet Claude Code analysis

## On-Demand Context
@.claude/context/data-sources.md
@docs/INDEX.md

## Constraints
- Supabase for all persistence (signal statuses, data points, assessments)
- Free-tier APIs only (FRED, CoinGecko, financial data)
- Signal status updates via both live feeds AND Claude Code sessions
- Dark theme (IBM Plex Sans/Mono, #0D0D0F background)
- Not financial advice — educational/analytical framing

## Conventions
- Inline styles (existing pattern from source components)
- Data separated from components (src/data/ for static, src/lib/ for live feeds)
- Supabase client in src/lib/supabase.js
- Custom hooks for data fetching in src/hooks/

## Current Focus
- Phase 0: Scaffold complete
- Next: /clarify → /spec

## ALOS Integration
- Pipeline: /pipeline status
- Session: /start-session → work → /wrap-up
- Quality: /self-review → /ship
