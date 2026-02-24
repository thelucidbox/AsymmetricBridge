# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-02-24

### Added
- **Thesis Framework** — 6-domino macro cascade with 24 live signals
- **Signal Tracker** — FRED, Twelve Data, and CoinGecko integrations with auto-threshold evaluation
- **Performance Lab** — CSV upload with broker auto-detection (Schwab, Fidelity, IBKR, Robinhood), thesis alignment scoring
- **Conviction Scorecard** — Prediction ledger with 30/60/90-day evaluation windows and batting average
- **Signal Digest Engine** — AI-powered intelligence briefs with BYO LLM support (Claude, GPT, Gemini)
- **150+ term Glossary** — Inline tooltips and dedicated searchable page
- **Onboarding Wizard** — 6-step setup (career profile, thesis, API keys, portfolio upload, review)
- **Guided Tour** — 5-step interactive tutorial for first-time users
- **Theme System** — Terminal (Bloomberg-style) and Observatory (glass-morphism) via design tokens
- **Display Modes** — Simplified (plain English) and Full (expert) toggle
- **Optional Auth** — Supabase-based, single-user by default, multi-user when enabled
- **Auto-Threshold Engine** — Client-side evaluation on every data fetch + 15-minute Supabase cron
- **Signal Override System** — Manual status changes with audit trail
- **Telegram Alerts** — Edge function for threshold breach notifications
- **Accessibility** — WCAG AAA, skip links, ARIA labels, focus traps, keyboard navigation
- **46 e2e tests** via Playwright
