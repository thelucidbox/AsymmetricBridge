# Getting Started with Asymmetric Bridge

## Prerequisites
- Node 20+
- npm
- Supabase account (free tier)
- FRED API key (free — https://fred.stlouisfed.org/docs/api/api_key.html)

## Quick Start
```bash
git clone git@github.com:thelucidbox/AsymmetricBridge.git
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
│   ├── config/                # Thesis configuration
│   ├── data/                  # Static data
│   ├── lib/                   # API clients + utilities
│   └── hooks/                 # Data fetching hooks
└── supabase/
    └── migrations/            # Database schema
```

## Next Steps
- Customize the thesis in `src/config/default-thesis.js`
- Add your own API keys for live data feeds
- Upload a brokerage CSV in the Performance Lab
