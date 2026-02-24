const BASE_DOMINOS = [
  {
    id: 1,
    name: "SaaS Compression",
    color: "#E63946",
    icon: "◉",
    description:
      "Software companies lose pricing power as businesses build AI tools in-house instead of paying for expensive subscriptions",
    signals: [
      {
        name: "Public SaaS Net Revenue Retention",
        source: "Quarterly earnings (SNOW, NOW, CRM, ZS)",
        frequency: "Quarterly",
        currentStatus: "amber",
        baseline: "120-130% NRR was healthy",
        threshold: "Below 110% = compression confirmed",
        notes: "Watch quarterly earnings cycles closely",
        whyItMatters:
          "When software vendors cannot grow revenue from existing customers, they cut hiring and services. Households eventually feel that through weaker job markets and lower wage growth.",
        transmissionTo:
          "White-Collar Displacement: margin compression forces software companies to reduce headcount across sales, support, and operations.",
        dataPoints: [],
      },
      {
        name: "Indeed SaaS Sales Job Postings",
        source: "Indeed Hiring Lab",
        frequency: "Monthly",
        currentStatus: "amber",
        baseline: "Indexed to Jan 2020 = 100",
        threshold: "Below 60 = structural decline",
        notes: "Track 'SaaS', 'Account Executive', 'SDR' categories",
        whyItMatters:
          "Hiring demand in SaaS sales is a real-time read on opportunity for high-income roles. Fewer postings usually means tougher job competition and softer consumer spending later.",
        transmissionTo:
          "White-Collar Displacement: weak recruiting pipelines turn pricing pressure into persistent unemployment risk.",
        dataPoints: [],
      },
      {
        name: "Y Combinator 'Replace X' Startups",
        source: "YC batch announcements",
        frequency: "Per batch (2x/year)",
        currentStatus: "amber",
        baseline: "~5-10% of batch historically",
        threshold: ">25% of batch = acceleration",
        notes: "Count startups explicitly positioning as SaaS replacements",
        whyItMatters:
          "A surge in replacement startups means incumbents face faster price competition. Customers may pay less, but job stability in legacy vendors gets weaker.",
        transmissionTo:
          "White-Collar Displacement: rapid product substitution pushes incumbents to consolidate teams and automate more roles.",
        dataPoints: [],
      },
      {
        name: "Enterprise Software Spending Forecasts",
        source: "Gartner, IDC",
        frequency: "Quarterly",
        currentStatus: "green",
        baseline: "8-12% annual growth",
        threshold: "Below 5% or negative = contraction",
        notes: "Distinguish between AI spend (up) and legacy SaaS (down)",
        whyItMatters:
          "Software spending forecasts are a proxy for business confidence and project activity. If those budgets shrink, contractors, employees, and service providers all feel it.",
        transmissionTo:
          "White-Collar Displacement: slower enterprise spend reduces implementation work and downstream hiring.",
        dataPoints: [],
      },
    ],
  },
  {
    id: 2,
    name: "White-Collar Displacement",
    color: "#F4A261",
    icon: "◈",
    description:
      "Office and professional jobs shrink faster than normal as AI automates knowledge work",
    signals: [
      {
        name: "JOLTS: Professional Services Openings",
        source: "BLS JOLTS Report",
        frequency: "Monthly",
        currentStatus: "amber",
        baseline: "~2M openings in professional/business services",
        threshold: "Below 1.5M = structural shift",
        notes: "Compare professional services vs. blue collar divergence",
        whyItMatters:
          "Professional-services openings help show whether middle-class career paths are expanding or closing. A sustained drop often leads to less household spending power.",
        transmissionTo:
          "Friction Collapse: weaker demand pressures platforms and merchants into fee compression and direct-routing behavior.",
        dataPoints: [],
      },
      {
        name: "BLS Employment: Information Sector",
        source: "BLS Employment Situation",
        frequency: "Monthly (first Friday)",
        currentStatus: "amber",
        baseline: "~3M employed in information sector",
        threshold: "3 consecutive months of decline = trend confirmed",
        notes: "Also track 'financial activities' and 'professional services'",
        whyItMatters:
          "The information sector drives wages and local spending in many tech-heavy metros. Persistent declines ripple through housing, restaurants, and local tax revenue.",
        transmissionTo:
          "Friction Collapse: payroll pressure reduces transaction volume and accelerates automation of customer journeys.",
        dataPoints: [],
      },
      {
        name: "Challenger Layoff Announcements (Tech/Finance)",
        source: "Challenger, Gray & Christmas",
        frequency: "Monthly",
        currentStatus: "amber",
        baseline: "~30-50K/month tech+finance layoffs in 2024",
        threshold: ">100K/month = acceleration",
        notes: "Watch for 'AI' or 'efficiency' cited as reason",
        whyItMatters:
          "Layoff announcements quickly influence confidence, hiring freezes, and consumer behavior. Families tend to cut discretionary spending almost immediately.",
        transmissionTo:
          "Friction Collapse: demand shocks force intermediaries to compete on price and lose take-rate power.",
        dataPoints: [],
      },
      {
        name: "Initial Jobless Claims Composition",
        source: "DOL + ADP/Equifax breakdowns",
        frequency: "Weekly (Thursday)",
        currentStatus: "green",
        baseline: "~220K weekly, mixed collar",
        threshold: ">350K with white-collar concentration = crisis",
        notes: "Crisis trigger threshold was 487K",
        whyItMatters:
          "Initial claims are one of the fastest labor stress indicators available. A white-collar-heavy spike can weaken spending from the households that drive many premium services.",
        transmissionTo:
          "Friction Collapse: declining discretionary demand encourages cheaper, agent-led, low-friction alternatives.",
        dataPoints: [],
      },
    ],
  },
  {
    id: 3,
    name: "Friction Collapse",
    color: "#2A9D8F",
    icon: "◆",
    description:
      "AI cuts out the middlemen — apps, brokers, and platforms lose their grip as people connect directly",
    signals: [
      {
        name: "DoorDash/Uber Eats Take Rate",
        source: "Quarterly earnings",
        frequency: "Quarterly",
        currentStatus: "green",
        baseline: "~15-20% take rate",
        threshold: "Below 12% = price competition from agents",
        notes:
          "Watch for mentions of 'multi-platform' or 'agent' in earnings calls",
        whyItMatters:
          "Falling take rates mean platforms keep less from each order even if usage is stable. That can reduce investment, wages, and service quality.",
        transmissionTo:
          "Ghost GDP: transaction activity can look healthy while less income reaches workers in the real economy.",
        dataPoints: [],
      },
      {
        name: "Visa/Mastercard Purchase Volume Growth",
        source: "V/MA quarterly earnings",
        frequency: "Quarterly",
        currentStatus: "green",
        baseline: "5-8% YoY growth",
        threshold: "Below 3% = agent routing around interchange",
        notes: "Watch MA Q1 reports as inflection signal",
        whyItMatters:
          "Card-volume slowdowns can indicate weaker spending or payment rails shifting away from legacy networks. Either outcome affects how broad the recovery really is.",
        transmissionTo:
          "Ghost GDP: output may continue while traditional payment-linked income channels shrink.",
        dataPoints: [],
      },
      {
        name: "Stablecoin Transaction Volume",
        source: "On-chain data (Dune, DefiLlama)",
        frequency: "Daily/Weekly",
        currentStatus: "green",
        baseline: "~$500B/month (2025)",
        threshold: ">$2T/month = mainstream agent adoption",
        notes: "Solana + Ethereum L2 volumes specifically",
        whyItMatters:
          "Stablecoin adoption shows money moving through cheaper digital rails. Users may benefit from lower friction, but legacy fee pools and jobs can compress.",
        transmissionTo:
          "Ghost GDP: value transfer rises while wage and tax capture through traditional channels can weaken.",
        dataPoints: [],
      },
      {
        name: "Real Estate Commission Compression",
        source: "NAR data, Redfin reports",
        frequency: "Quarterly",
        currentStatus: "amber",
        baseline: "2.5-3% buy-side commission",
        threshold: "Below 1.5% in major metros = agent disruption",
        notes: "NAR settlement already started this trend",
        whyItMatters:
          "Lower commissions reduce housing transaction costs but also cut income for a large service workforce. That income shift matters for local demand.",
        transmissionTo:
          "Ghost GDP: housing activity can hold up even as labor income tied to transactions declines.",
        dataPoints: [],
      },
    ],
  },
  {
    id: 4,
    name: "Ghost GDP",
    color: "#264653",
    icon: "◇",
    description:
      "The economy looks like it is growing on paper, but fewer people actually feel the benefits",
    signals: [
      {
        name: "GDP Growth vs. Real Wage Growth Spread",
        source: "BEA GDP + BLS wage data",
        frequency: "Quarterly",
        currentStatus: "amber",
        baseline: "Typically track within 1-2pp",
        threshold: ">4pp divergence = Ghost GDP confirmed",
        notes: "The key diagnostic: productivity up, wages down",
        whyItMatters:
          "If headline growth outpaces wages for too long, families feel poorer even in a 'growing' economy. That weakens demand durability.",
        transmissionTo:
          "Financial Contagion: weaker household cash flow increases credit stress and default probability.",
        dataPoints: [],
      },
      {
        name: "M2 Velocity of Money",
        source: "Federal Reserve (FRED)",
        frequency: "Quarterly",
        currentStatus: "amber",
        baseline: "~1.2 (post-COVID)",
        threshold: "Below 1.0 = money not circulating",
        notes: "Already at historic lows; further decline = systemic",
        whyItMatters:
          "Low money velocity means cash is not cycling through payrolls and purchases fast enough. Businesses then face slower sales and tighter working capital.",
        transmissionTo:
          "Financial Contagion: slower circulation raises refinancing pressure and stress in credit-dependent sectors.",
        dataPoints: [],
      },
      {
        name: "Consumer Confidence vs. CEO Confidence",
        source: "Conference Board + C-Suite Survey",
        frequency: "Monthly",
        currentStatus: "green",
        baseline: "Usually correlated",
        threshold: ">20pt divergence = two-economy dynamic",
        notes: "CEOs bullish on AI, consumers bearish on jobs",
        whyItMatters:
          "A wide confidence gap means executives and households are planning for different realities. That mismatch can trigger sudden earnings and spending disappointments.",
        transmissionTo:
          "Financial Contagion: expectation gaps can reprice risk rapidly and tighten lending conditions.",
        dataPoints: [],
      },
      {
        name: "Labor Share of GDP",
        source: "BLS Productivity Report",
        frequency: "Quarterly",
        currentStatus: "amber",
        baseline: "56% (2024)",
        threshold: "Below 52% = acceleration of capital capture",
        notes: "Projected to decline as AI adoption accelerates",
        whyItMatters:
          "When labor gets a smaller share of income, purchasing power concentrates and broad demand becomes fragile. That makes downturns harder to absorb.",
        transmissionTo:
          "Financial Contagion: weaker wage distribution increases debt-servicing risk across households.",
        dataPoints: [],
      },
    ],
  },
  {
    id: 5,
    name: "Financial Contagion",
    color: "#9B2226",
    icon: "◐",
    description:
      "Financial stress in one sector spreads to others — bad loans trigger a chain reaction through banks, insurers, and housing",
    signals: [
      {
        name: "PE-Backed Software Default Rate",
        source: "Preqin, PitchBook, Moody's",
        frequency: "Quarterly",
        currentStatus: "green",
        baseline: "<2% default rate",
        threshold: ">5% = systemic stress",
        notes: "Watch for sector-wide downgrades like 2015 energy",
        whyItMatters:
          "Rising defaults in private-credit-heavy sectors can reduce lending broadly, not just to weak firms. That often leads to layoffs and investment pullbacks.",
        transmissionTo:
          "Policy Response: escalating defaults pressure regulators and lawmakers to deploy backstops or rule changes.",
        dataPoints: [],
      },
      {
        name: "Alt Manager Stock Prices (BX, APO, KKR)",
        source: "Market data",
        frequency: "Daily",
        currentStatus: "green",
        baseline: "Trading at/near ATH",
        threshold: ">25% drawdown = market pricing contagion",
        notes: "Insurance subsidiary exposure is the transmission mechanism",
        whyItMatters:
          "Large drawdowns in alternative asset managers can signal hidden balance-sheet stress before it appears in lagging macro reports.",
        transmissionTo:
          "Policy Response: market repricing raises urgency for capital, liquidity, and supervisory interventions.",
        dataPoints: [],
      },
      {
        name: "Prime Mortgage Delinquency (Tech Metros)",
        source: "Fannie Mae, Freddie Mac, Zillow",
        frequency: "Monthly",
        currentStatus: "green",
        baseline: "<1% 90+ day delinquency",
        threshold: ">2% in SF/SEA/AUS = early warning",
        notes: "Watch HELOC draws and 401k withdrawals as leading indicators",
        whyItMatters:
          "Prime-mortgage stress in high-income metros means pressure has moved beyond the most vulnerable borrowers. Housing weakness then spills into consumption and local budgets.",
        transmissionTo:
          "Policy Response: rising delinquencies increase pressure for fiscal support and housing-policy action.",
        dataPoints: [],
      },
      {
        name: "NAIC Insurance Capital Actions",
        source: "NAIC, state regulator filings",
        frequency: "As announced",
        currentStatus: "green",
        baseline: "Normal oversight",
        threshold: "Capital treatment changes for private credit = crisis mode",
        notes: "The PE-insurance linkage scenario",
        whyItMatters:
          "Insurance-capital rule changes are usually late-stage warnings that credit risk is now systemically important.",
        transmissionTo:
          "Policy Response: regulatory shifts at this layer often trigger coordinated federal and state action.",
        dataPoints: [],
      },
    ],
  },
  {
    id: 6,
    name: "Policy Response",
    color: "#6D6875",
    icon: "◑",
    description:
      "How fast (or slow) governments respond with new rules, funding, and safety nets as disruption unfolds",
    signals: [
      {
        name: "Congressional AI Legislation Activity",
        source: "Congress.gov, news tracking",
        frequency: "Ongoing",
        currentStatus: "amber",
        baseline: "Hearings and proposals",
        threshold: "Bipartisan bill with funding = response accelerating",
        notes: "Watch for 'compute tax', 'transition economy', 'AI dividend'",
        whyItMatters:
          "Clear legislation can reduce uncertainty for employers and workers deciding how to adapt. Delays leave households exposed to longer transition pain.",
        transmissionTo:
          "SaaS Compression (loopback): policy clarity or delay changes enterprise budget confidence and vendor pricing leverage.",
        dataPoints: [],
      },
      {
        name: "Fed Language: Structural vs. Cyclical",
        source: "FOMC minutes, speeches",
        frequency: "8x/year (FOMC) + speeches",
        currentStatus: "green",
        baseline: "'Cyclical softening'",
        threshold:
          "'Structural displacement' in official language = paradigm shift",
        notes: "Watch for 'daisy chain' or similar systemic language",
        whyItMatters:
          "Fed language shapes rates, risk appetite, and hiring plans. A structural framing can reset valuations and credit conditions quickly.",
        transmissionTo:
          "SaaS Compression (loopback): tighter financial conditions weigh on software multiples and renewal budgets.",
        dataPoints: [],
      },
      {
        name: "Federal Receipts vs. CBO Baseline",
        source: "Treasury Monthly Statement",
        frequency: "Monthly",
        currentStatus: "green",
        baseline: "Within 2-3% of projection",
        threshold: ">8% below baseline = fiscal stress",
        notes: "Track quarterly divergence from CBO projections",
        whyItMatters:
          "Weak receipts mean less room for fiscal support just when households may need more help. That can force harder budget tradeoffs.",
        transmissionTo:
          "SaaS Compression (loopback): fiscal pressure can reduce public and enterprise technology spending growth.",
        dataPoints: [],
      },
      {
        name: "Deficit Trajectory",
        source: "CBO, Treasury",
        frequency: "Quarterly",
        currentStatus: "amber",
        baseline: "~6% of GDP (2025)",
        threshold: ">9% without recession stimulus = structural",
        notes: "Compare to COVID 15% — but that was understood as temporary",
        whyItMatters:
          "A widening deficit without a temporary shock can raise borrowing costs and long-term uncertainty. Businesses and families feel that through rates and confidence.",
        transmissionTo:
          "SaaS Compression (loopback): higher financing costs and uncertainty increase contract scrutiny and pricing pressure.",
        dataPoints: [],
      },
    ],
  },
];

const SOURCES = [
  {
    title: "The 2028 Global Intelligence Crisis",
    author: "Citrini Research (with Alap Shah / LOTUS)",
    date: "February 22, 2026",
    url: "https://www.citriniresearch.com/p/2028gic",
    type: "Bear Thesis",
    color: "#E63946",
    format: "Future-dated post-mortem (written as if from June 2028)",
    tldr: "AI productivity can rise while jobs, spending, and credit quality fall if adaptation is too slow.",
    keyThesis:
      "AI makes human intelligence abundant \u2192 white-collar displacement \u2192 consumption collapse \u2192 financial contagion \u2192 policy failure. Economy's institutions built for scarce human intelligence. Repricing is painful, disorderly, and investable.",
    chapters: [
      "SaaS Compression: In-house AI becomes credible BATNA \u2192 30% renewal discounts \u2192 ServiceNow cuts 15% workforce",
      "Friction Collapse: AI agents destroy habitual intermediation (DoorDash, travel, insurance) \u2192 stablecoins route around card interchange",
      "White-Collar Displacement: JOLTS professional services openings collapse \u2192 top 20% earners drive 65% spending \u2192 2% job loss = 3-4% discretionary hit",
      "Ghost GDP: Productivity up, wages down \u2192 M2 velocity flatlines \u2192 labor share drops from 56% to 46%",
      "Financial Contagion: $2.5T private credit defaults \u2192 PE-insurance daisy chain (Apollo/Athene) \u2192 prime mortgages threatened",
      "Policy Trap: Government needs to transfer more while collecting less \u2192 traditional tools can't address structural cause",
    ],
    assessment:
      "Direction plausible, speed compressed (5-8 years into 2). Underweights institutional drag, legal friction, deployment difficulty.",
    strengthsWeaknesses: {
      strengths: [
        "Strongest on financial contagion mechanics (PE-insurance-mortgage chain)",
        "Best articulation of 'Ghost GDP' concept",
        "Compelling on SaaS negotiation dynamics (BATNA framework)",
        "Gets the reflexive loop right: displacement \u2192 less spending \u2192 more displacement",
      ],
      weaknesses: [
        "Timeline too compressed \u2014 institutional friction slows everything",
        "Mortgage crisis scenario requires faster income decline than plausible",
        "Underweights government response capacity (see: COVID stimulus speed)",
        "Assumes AI deployment is frictionless \u2014 ignores integration, trust, regulation",
      ],
    },
  },
  {
    title: "Situational Awareness: The Decade Ahead",
    author: "Leopold Aschenbrenner (ex-OpenAI Superalignment team)",
    date: "June 2024",
    url: "https://situational-awareness.ai/",
    pdfUrl:
      "https://situational-awareness.ai/wp-content/uploads/2024/06/situationalawareness.pdf",
    type: "Capability Thesis",
    color: "#E9C46A",
    format: "165-page essay series (5 chapters + introduction)",
    tldr: "AGI could arrive quickly, and the biggest risks are capability acceleration plus geopolitical competition.",
    keyThesis:
      "AGI by 2027 is strikingly plausible. GPT-2 to GPT-4 = preschooler to smart high-schooler in 4 years. Extrapolating compute + algorithmic efficiency trendlines = another equivalent jump by 2027. Then intelligence explosion \u2192 superintelligence.",
    chapters: [
      "From GPT-4 to AGI: Counting the OOMs \u2014 ~0.5 OOMs/year compute + ~0.5 OOMs/year algorithmic efficiency + 'unhobbling' gains = AGI-level by 2027",
      "From AGI to Superintelligence: The Intelligence Explosion \u2014 Hundreds of millions of AGIs automate AI research \u2192 decade of progress compressed into \u22641 year",
      "The Challenges: IQ \u2260 Reliability, 'unhobbling' still needed, but trendlines are relentless",
      "The Project: US government will inevitably nationalize/control AGI development \u2192 wartime-style mobilization",
      "Security & Geopolitics: China espionage threat is existential \u2192 current lab security is catastrophically inadequate",
    ],
    assessment:
      "Capability trajectory largely validated by events since publication. Timeline aggressive but defensible. Weaker on economic/social consequences \u2014 focuses on capability, not distribution.",
    strengthsWeaknesses: {
      strengths: [
        "Most rigorous capability extrapolation available",
        "Written by someone who was inside OpenAI \u2014 not speculating from outside",
        "OOMs framework gives falsifiable predictions",
        "Geopolitical analysis is sobering and underappreciated",
      ],
      weaknesses: [
        "Almost entirely focused on capability, not economic/social distribution",
        "Assumes smooth scaling \u2014 doesn't account for potential plateaus",
        "Geopolitical framing is US-centric and somewhat hawkish",
        "Doesn't address the 'who benefits?' question that Citrini tackles",
      ],
    },
  },
  {
    title: "The 2028 Global Intelligence Boom",
    author: "Michael X. Bloch",
    date: "February 22, 2026",
    url: "https://michaelxbloch.substack.com/p/the-2028-global-intelligence-boom",
    type: "Bull Rebuttal",
    color: "#2A9D8F",
    format:
      "Companion piece \u2014 same premise, same framework, opposite conclusion",
    tldr: "AI disruption is real, but lower startup costs may create new businesses and jobs faster than bears expect.",
    keyThesis:
      "Same AI disruption happens, but the economy adapts faster than bears expect. Displaced workers + cheap AI tools = explosion of new business formation. Cost of starting a business falls 70-80%.",
    chapters: [
      "SaaS repricing is real but not economic collapse \u2014 $500B bloated spend gets rationalized, spending redirects",
      "White-collar displacement is real but transitional (9 months, not 9 years)",
      "New business formation explodes \u2014 'minimum viable ambition' drops to near zero with AI tools",
      "Housing crisis doesn't materialize \u2014 incomes shift from corporate to entrepreneurial but recover in aggregate",
      "The 'AI-assisted' prefix: every professional services category gets augmented, not eliminated",
    ],
    assessment:
      "Compelling counter-argument. The truth likely lives between Citrini's bear case and this bull case. Lower startup costs creating opportunity is already happening.",
    strengthsWeaknesses: {
      strengths: [
        "Directly addresses Citrini's weakest assumptions (permanent displacement, no adaptation)",
        "Historical precedent is on the bull side \u2014 economies do adapt",
        "The 'cost of starting a business falls 70-80%' observation is already happening",
        "Shows how lower startup costs create new opportunity for displaced workers",
      ],
      weaknesses: [
        "Assumes adaptation happens smoothly and quickly \u2014 could be messier",
        "Doesn't address the financial contagion chain (Citrini's strongest argument)",
        "May underweight the speed of displacement vs. speed of adaptation",
        "Survivorship bias \u2014 focuses on success stories, not those who don't adapt",
      ],
    },
  },
  {
    title: "AI as a Macro Shock: Income, Credit, and Convexity",
    author: "Arya Deniz",
    date: "February 22, 2026",
    url: "https://aryadeniz.substack.com/p/ai-as-a-macro-shock-income-credit",
    type: "Trade Expression",
    color: "#6D6875",
    format: "Macro analysis + bond trade thesis",
    tldr: "If incomes weaken before policy catches up, long-duration bonds may outperform during recurring growth scares.",
    keyThesis:
      "If abundant intelligence compresses earning power faster than politics can rebuild stability \u2192 demand fragility \u2192 growth scares \u2192 duration becomes convex.",
    chapters: [
      "Citrini's mechanism is explicit: intelligence cheaper \u2192 fewer workers \u2192 earnings compress \u2192 spending slows \u2192 loop tightens",
      "Present tense still looks deceptively ordinary \u2014 that's where macro pressure builds quietly",
      "Bond market as expression: demand fragility pulls forward growth scares, duration becomes convex",
    ],
    assessment:
      "Useful for understanding how disruption maps to tradeable instruments. Worth tracking for macro signal validation.",
    strengthsWeaknesses: {
      strengths: [
        "Best translation of thesis into actual trade mechanics",
        "Identifies the yield curve as the real-time signal of thesis validation",
      ],
      weaknesses: [
        "Bond-focused \u2014 less applicable to equity-focused portfolios",
        "Assumes rates market will price displacement before equity market does",
      ],
    },
  },
];

function attachDominoThresholds(dominos) {
  return dominos.map((domino) => ({
    ...domino,
    thresholds: domino.signals.reduce((acc, signal) => {
      acc[signal.name] = signal.threshold;
      return acc;
    }, {}),
  }));
}

export const defaultThesis = {
  meta: {
    name: "Disruption Thesis",
    version: "1.0.0",
  },
  dominos: attachDominoThresholds(BASE_DOMINOS),
  sources: SOURCES,
  portfolio: {
    legs: [
      {
        leg: "AI Infrastructure",
        thesis:
          "Compute and cloud providers benefit as AI adoption accelerates across enterprises",
        color: "#E63946",
        tickers: ["NVDA", "AMD", "MSFT", "GOOG", "AMZN"],
        targetPercent: 30,
      },
      {
        leg: "SaaS Survivors",
        thesis:
          "Incumbents with strong moats and AI integration retain pricing power",
        color: "#F4A261",
        tickers: ["CRM", "NOW", "PANW", "SNOW", "ZS"],
        targetPercent: 20,
      },
      {
        leg: "Duration Hedge",
        thesis:
          "Long-duration bonds outperform if demand fragility triggers growth scares",
        color: "#2A9D8F",
        tickers: ["TLT", "EDV", "ZROZ"],
        targetPercent: 15,
      },
      {
        leg: "Hard Assets",
        thesis:
          "Real assets and commodities hedge against policy response and monetary expansion",
        color: "#264653",
        tickers: ["GLD", "SLV", "BTC-USD", "PDBC"],
        targetPercent: 15,
      },
      {
        leg: "Displacement Beneficiaries",
        thesis:
          "Companies enabling automation and workforce transition capture displaced value",
        color: "#6D6875",
        tickers: ["UBER", "UPWK", "HUBS", "DDOG"],
        targetPercent: 20,
      },
    ],
  },
  careerProfile: {
    goals: [],
  },
};

export default defaultThesis;
