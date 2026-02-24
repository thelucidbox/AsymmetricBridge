export const GLOSSARY = {
  CPI: {
    definition:
      "Consumer Price Index. A monthly measure of how much prices changed for a basket of common household goods and services.",
    analogy:
      "Like checking whether your weekly grocery cart costs more or less than it did last month.",
    relatedTerms: ["PCE", "inflation", "basis point"],
  },
  PCE: {
    definition:
      "Personal Consumption Expenditures index. The Federal Reserve's preferred inflation gauge because it captures spending shifts more flexibly than CPI.",
    analogy:
      "Like a smart budget tracker that updates when people switch from expensive to cheaper options.",
    relatedTerms: ["CPI", "inflation", "Fed"],
  },
  "yield curve": {
    definition:
      "A line that compares interest rates on short-term versus long-term government bonds.",
    analogy:
      "Like a weather forecast slope: normal means sunny ahead, inverted means storm warnings.",
    relatedTerms: ["credit spread", "recession", "basis point"],
  },
  "credit spread": {
    definition:
      "The extra interest borrowers pay above very safe government debt, used as a fear gauge for default risk.",
    analogy:
      "Like insurance premiums rising when people think accidents are more likely.",
    relatedTerms: ["yield curve", "default rate", "contagion"],
  },
  GDP: {
    definition:
      "Gross Domestic Product. The total value of goods and services produced in an economy.",
    analogy: "Like the economy's total monthly sales receipt.",
    relatedTerms: ["Ghost GDP", "labor share", "unemployment rate"],
  },
  "unemployment rate": {
    definition:
      "The share of people actively looking for work who do not currently have a job.",
    analogy:
      "Like tracking how many players are on the bench and still trying to get into the game.",
    relatedTerms: ["JOLTS", "white-collar displacement", "recession"],
  },
  VIX: {
    definition:
      "A market volatility index often called the fear gauge because it rises when investors expect bigger stock swings.",
    analogy: "Like a stress meter for Wall Street.",
    relatedTerms: ["alert", "drawdown", "contagion"],
  },
  stablecoin: {
    definition:
      "A cryptocurrency designed to stay near a stable value, usually pegged to the U.S. dollar.",
    analogy:
      "Like digital cash that tries to keep one-dollar purchasing power.",
    relatedTerms: ["Friction Collapse", "liquidity", "intermediation"],
  },
  "basis point": {
    definition: "One-hundredth of a percent. 100 basis points equals 1.00%.",
    analogy:
      "Like measuring interest rates in pennies instead of whole dollars for precision.",
    relatedTerms: ["yield curve", "credit spread", "threshold"],
  },
  domino: {
    definition:
      "In this dashboard, a domino is one disruption vector that can trigger downstream effects in other parts of the economy.",
    analogy:
      "Like one row in a chain-reaction setup where each tile can knock over the next.",
    relatedTerms: ["signal", "transmission", "contagion"],
  },
  signal: {
    definition:
      "A measurable indicator used to track whether a specific domino is stable, warming up, or breaking down.",
    analogy: "Like a dashboard warning light in a car.",
    relatedTerms: ["threshold", "baseline", "watch"],
  },
  threshold: {
    definition:
      "A predefined level where a signal changes meaning and usually moves to a higher risk status.",
    analogy: "Like a speed limit sign: crossing it changes the situation.",
    relatedTerms: ["signal", "watch", "alert"],
  },
  baseline: {
    definition: "The normal range for a signal when conditions are stable.",
    analogy: "Like your resting heart rate before a workout.",
    relatedTerms: ["watch", "threshold", "signal"],
  },
  watch: {
    definition:
      "A caution status showing early stress that is approaching, but has not yet crossed, a critical threshold.",
    analogy: "Like dark clouds forming before the storm starts.",
    relatedTerms: ["baseline", "alert", "threshold"],
  },
  alert: {
    definition:
      "A high-risk status showing a threshold was breached and immediate attention is needed.",
    analogy: "Like a smoke alarm going off.",
    relatedTerms: ["watch", "threshold", "contagion"],
  },
  inflation: {
    definition:
      "A broad rise in prices that reduces purchasing power over time.",
    analogy: "Like getting less value from the same paycheck.",
    relatedTerms: ["CPI", "PCE", "Fed"],
  },
  recession: {
    definition:
      "A period of broad economic slowdown marked by weaker growth, hiring, and spending.",
    analogy: "Like the economy shifting into a lower gear.",
    relatedTerms: ["GDP", "unemployment rate", "yield curve"],
  },
  liquidity: {
    definition:
      "How easily assets or money can move through markets and the economy without causing big price changes.",
    analogy:
      "Like water pressure in plumbing: low pressure means everything moves slower.",
    relatedTerms: ["stablecoin", "M2 velocity", "credit spread"],
  },
  "default rate": {
    definition:
      "The percentage of borrowers failing to make required debt payments.",
    analogy: "Like the share of monthly bills that go unpaid.",
    relatedTerms: ["credit spread", "delinquency", "contagion"],
  },
  delinquency: {
    definition: "Late debt payments that have not yet become full defaults.",
    analogy:
      "Like repeated overdue notices before an account goes to collections.",
    relatedTerms: ["default rate", "mortgage", "contagion"],
  },
  "labor share": {
    definition:
      "The percentage of national income paid to workers rather than to capital owners.",
    analogy:
      "Like how much of a restaurant's revenue goes to staff paychecks vs. owners.",
    relatedTerms: ["GDP", "Ghost GDP", "white-collar displacement"],
  },
  "M2 velocity": {
    definition:
      "How quickly money is circulating through the economy, often shown as turnover of the M2 money supply.",
    analogy: "Like how fast cash changes hands in a neighborhood.",
    relatedTerms: ["Ghost GDP", "liquidity", "GDP"],
  },
  contagion: {
    definition:
      "Stress spreading from one market or sector into others through financial connections.",
    analogy: "Like a leak in one room damaging the rooms next to it.",
    relatedTerms: ["Financial Contagion", "credit spread", "alert"],
  },
  drawdown: {
    definition: "A decline from a recent peak in price or portfolio value.",
    analogy: "Like dropping from your personal best score before recovering.",
    relatedTerms: ["VIX", "alert", "risk"],
  },
  intermediation: {
    definition:
      "The role of middle platforms or institutions that sit between buyers and sellers.",
    analogy: "Like a travel agent between you and an airline.",
    relatedTerms: ["Friction Collapse", "stablecoin", "take rate"],
  },
  Fed: {
    definition:
      "The U.S. Federal Reserve, which sets monetary policy to influence inflation, employment, and financial conditions.",
    analogy: "Like the economy's thermostat operator.",
    relatedTerms: ["PCE", "inflation", "yield curve"],
  },
  "SaaS compression": {
    definition:
      "The squeeze on software-as-a-service companies as AI tools make it cheaper to build alternatives in-house, reducing their pricing power.",
    analogy:
      "Like taxi companies when ride-sharing apps appeared — suddenly the old pricing doesn't hold.",
    relatedTerms: ["domino", "signal", "white-collar displacement"],
  },
  "white-collar displacement": {
    definition:
      "The reduction of knowledge-worker jobs — analysts, managers, consultants — as AI automates tasks that previously required human judgment.",
    analogy:
      "Like assembly line automation for the office. The work still gets done, just with fewer people.",
    relatedTerms: ["SaaS compression", "unemployment rate", "labor share"],
  },
  "friction collapse": {
    definition:
      "The breakdown of middleman businesses and platforms as AI enables direct connections between buyers and sellers.",
    analogy:
      "Like the difference between booking through a travel agent versus booking directly. AI removes the agent from more industries.",
    relatedTerms: ["intermediation", "stablecoin", "Ghost GDP"],
  },
  "Ghost GDP": {
    definition:
      "An economy where GDP numbers look healthy but the gains are concentrated — productivity rises while fewer people benefit.",
    analogy:
      "Like a company reporting record revenue while laying off half its staff.",
    relatedTerms: ["GDP", "labor share", "M2 velocity"],
  },
  "financial contagion": {
    definition:
      "When financial stress in one sector spreads to others through connected markets — a bank problem becomes a housing problem becomes a credit problem.",
    analogy: "Like one domino knocking over the next in a chain.",
    relatedTerms: ["credit spread", "default rate", "contagion"],
  },
  "policy response": {
    definition:
      "Government and central bank reactions to economic disruption — rate changes, stimulus programs, new regulations, workforce retraining.",
    analogy:
      "Like a thermostat kicking in when the temperature gets too extreme in either direction.",
    relatedTerms: ["Fed", "recession", "inflation"],
  },
  "take rate": {
    definition:
      "The percentage fee a platform charges on each transaction. As AI reduces friction, take rates face downward pressure.",
    analogy:
      "Like a broker's commission — when buyers can go direct, the commission gets squeezed.",
    relatedTerms: ["friction collapse", "intermediation"],
  },
  JOLTS: {
    definition:
      "Job Openings and Labor Turnover Survey. A monthly report from the Bureau of Labor Statistics showing how many jobs are open and how many people are quitting or getting hired.",
    analogy: "Like a help-wanted board for the entire economy.",
    relatedTerms: ["unemployment rate", "white-collar displacement"],
  },
  NRR: {
    definition:
      "Net Revenue Retention. Measures how much revenue a software company keeps and grows from existing customers, including upsells minus cancellations.",
    analogy:
      "Like checking whether your regulars are ordering more or less each month at a restaurant.",
    relatedTerms: ["SaaS compression", "take rate"],
  },
  BATNA: {
    definition:
      "Best Alternative To a Negotiated Agreement. The fallback option a buyer has if a deal falls through — the stronger the alternative, the more negotiating power they hold.",
    analogy:
      "Like knowing you have another job offer in hand before asking for a raise.",
    relatedTerms: ["SaaS compression", "NRR"],
  },
  "private credit": {
    definition:
      "Loans made by non-bank lenders (private equity firms, hedge funds) to companies that cannot or choose not to borrow from traditional banks.",
    analogy:
      "Like borrowing from a wealthy neighbor instead of the bank — more flexible terms, but potentially higher stakes.",
    relatedTerms: ["financial contagion", "default rate", "delinquency"],
  },
  "private equity": {
    definition:
      "Investment firms that buy companies (or large stakes in them) using a mix of their own money and borrowed funds, aiming to improve and resell at a profit.",
    analogy:
      "Like flipping houses but with entire businesses — buy, renovate, sell.",
    relatedTerms: ["private credit", "financial contagion", "drawdown"],
  },
};

export const GLOSSARY_KEYS = Object.keys(GLOSSARY);
