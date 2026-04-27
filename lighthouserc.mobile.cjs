module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:4173/", "http://localhost:4173/articles/"],
      numberOfRuns: 3,
      settings: {
        chromeFlags:
          "--no-sandbox --headless --allow-insecure-localhost --disable-features=HttpsFirstBalancedModeAutoEnable,HTTPS-FirstMode",
        emulatedFormFactor: "mobile",
        throttling: {
          rttMs: 150,
          throughputKbps: 1638,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    assert: {
      assertions: {
        // Mobile-specific thresholds (realistic for current site budget)
        "categories:performance": ["error", { minScore: 0.65 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.95 }],

        // Mobile Core Web Vitals thresholds
        "largest-contentful-paint": ["error", { maxNumericValue: 8000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 2500 }],
        "first-contentful-paint": ["error", { maxNumericValue: 3200 }],
        "speed-index": ["error", { maxNumericValue: 5600 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
    server: {
      command: "pnpm build && pnpm serve",
      port: 4173,
      wait: 5000,
    },
  },
};
