/**
 * Shared test helpers for AsymmetricBridge e2e tests.
 *
 * The thesis fixture must pass validateThesis() from thesis-schema.js,
 * which requires: meta, dominos (with signals + thresholds), sources,
 * portfolio, and careerProfile (with goals array).
 */

const VALID_THESIS = {
  meta: { name: "Test Thesis", version: "1.0.0" },
  dominos: [
    {
      id: 1,
      name: "SaaS Compression",
      color: "#E63946",
      icon: "◉",
      description: "Enterprise software pricing power collapse",
      signals: [
        {
          name: "Public SaaS Net Revenue Retention",
          source: "Quarterly earnings",
          frequency: "Quarterly",
          currentStatus: "amber",
          baseline: "120-130% NRR was healthy",
          threshold: "Below 110% = compression confirmed",
          notes: "Watch Q1 2026 earnings cycle",
          dataPoints: [{ date: "Q3 2025", value: "118% avg", status: "amber" }],
        },
      ],
      thresholds: {
        "Public SaaS Net Revenue Retention":
          "Below 110% = compression confirmed",
      },
    },
  ],
  sources: [
    {
      title: "The 2028 Global Intelligence Crisis",
      author: "Citrini Research",
      date: "February 22, 2026",
      url: "https://www.citriniresearch.com/p/2028gic",
      type: "Bear Thesis",
      color: "#E63946",
    },
  ],
  portfolio: { legs: [] },
  careerProfile: {
    currentRole: "Software Engineer",
    targetRole: "AI Engineer",
    industry: "Technology",
    experience: "5-10 years",
    goals: ["Learn AI/ML"],
  },
};

/**
 * Seed localStorage with a valid thesis + mark guided tour complete.
 * Use for tests that need the dashboard/app to load normally.
 */
export function seedThesis(page) {
  const thesisJSON = JSON.stringify(VALID_THESIS);
  return page.addInitScript((json) => {
    window.localStorage.setItem("ab-thesis-config", json);
    window.localStorage.setItem("ab-guided-tour-complete", "true");
  }, thesisJSON);
}

/**
 * Seed localStorage with a valid thesis but do NOT mark tour complete.
 * Use for guided tour tests where the tour should appear.
 */
export function seedThesisNoTour(page) {
  const thesisJSON = JSON.stringify(VALID_THESIS);
  return page.addInitScript((json) => {
    window.localStorage.setItem("ab-thesis-config", json);
  }, thesisJSON);
}
