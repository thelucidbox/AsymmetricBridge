# Getting Started with Asymmetric Bridge

## Prerequisites
- Node 20+
- npm
- Supabase account (free tier)
- FRED API key (free — https://fred.stlouisfed.org/docs/api/api_key.html)

## Quick Start
```bash
git clone git@github.com:yourusername/AsymmetricBridge.git
cd AsymmetricBridge
npm install
cp .env.example .env    # Fill in API keys
npm run dev
```

## Environment Variables
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FRED_API_KEY=your-fred-key
```

## Project Structure
```
AsymmetricBridge/
├── CLAUDE.md                  # Project instructions
├── AGENTS.md                  # Codex context
├── GEMINI.md                  # Gemini context
├── QUESTIONS.md               # Architecture questions
├── productivity/
│   ├── TODO.md                # Task tracking
│   └── SESSION_LOG.md         # Session history
├── docs/
│   ├── INDEX.md               # Documentation map
│   ├── tutorials/
│   │   └── getting-started.md # This file
│   └── reference/
│       └── decisions/
│           └── TEMPLATE.md    # ADR template
├── src/
│   ├── main.jsx               # Entry point
│   ├── App.jsx                # Root component + routing
│   ├── components/            # UI components
│   │   ├── CommandCenter.jsx  # Main dashboard
│   │   └── SourceMaterials.jsx # Thesis comparison
│   ├── data/                  # Static data
│   ├── lib/                   # API clients
│   └── hooks/                 # Data fetching hooks
└── supabase/
    └── migrations/            # Database schema
```

## Development Pipeline
This project uses the ALOS development pipeline:
```
/scaffold-project → /clarify → /spec → /design → /forge → /self-review → /ship
```
Run `/pipeline status` to see where you are.

## Next Steps
- [ ] Run `/clarify` to sharpen the project vision
- [ ] Run `/spec` to decompose into features and tasks
