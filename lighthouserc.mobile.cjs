module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:4173/", "http://localhost:4173/articles/"],
      numberOfRuns: 3,
      settings: {
        preset: "mobile",
        chromeFlags: "--no-sandbox --headless",
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
        // Slightly more lenient for mobile
        "categories:performance": ["error", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.95 }],

        // Mobile-specific Core Web Vitals (more lenient)
        "largest-contentful-paint": ["error", { maxNumericValue: 4000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 600 }],
        "first-contentful-paint": ["error", { maxNumericValue: 3000 }],
        "speed-index": ["error", { maxNumericValue: 5000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
    server: {
      command: "npm run preview",
      port: 4173,
      wait: 3000,
    },
  },
};
