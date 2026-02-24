/**
 * Synthetic portfolio positions for demo mode.
 * These are fictional holdings used to showcase the Performance Lab
 * when no real brokerage CSV has been uploaded.
 */
export const SAMPLE_POSITIONS = [
  // AI Infrastructure leg
  { symbol: "NVDA", quantity: 45, marketValue: 5850, costBasis: 4200 },
  { symbol: "AMD", quantity: 60, marketValue: 3120, costBasis: 2700 },
  { symbol: "MSFT", quantity: 20, marketValue: 8400, costBasis: 7200 },
  { symbol: "GOOG", quantity: 25, marketValue: 4375, costBasis: 3900 },
  { symbol: "AMZN", quantity: 30, marketValue: 5700, costBasis: 4500 },

  // SaaS Survivors leg
  { symbol: "CRM", quantity: 30, marketValue: 8100, costBasis: 7500 },
  { symbol: "NOW", quantity: 10, marketValue: 7500, costBasis: 6800 },
  { symbol: "PANW", quantity: 15, marketValue: 2850, costBasis: 2400 },
  { symbol: "ZS", quantity: 12, marketValue: 2160, costBasis: 1900 },

  // Duration Hedge leg
  { symbol: "TLT", quantity: 80, marketValue: 7200, costBasis: 7600 },
  { symbol: "EDV", quantity: 40, marketValue: 3200, costBasis: 3400 },

  // Hard Assets leg
  { symbol: "GLD", quantity: 35, marketValue: 7350, costBasis: 6500 },
  { symbol: "SLV", quantity: 100, marketValue: 2800, costBasis: 2500 },
  { symbol: "PDBC", quantity: 150, marketValue: 2100, costBasis: 2200 },

  // Displacement Beneficiaries leg
  { symbol: "UBER", quantity: 50, marketValue: 3750, costBasis: 3100 },
  { symbol: "HUBS", quantity: 8, marketValue: 4800, costBasis: 4200 },
  { symbol: "DDOG", quantity: 25, marketValue: 3250, costBasis: 2800 },

  // Unaligned (cash-like / speculative)
  { symbol: "AAPL", quantity: 15, marketValue: 3300, costBasis: 2700 },
  { symbol: "TSLA", quantity: 10, marketValue: 2500, costBasis: 3200 },
];
