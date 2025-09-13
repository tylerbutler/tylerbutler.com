#!/usr/bin/env node

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * Web Vitals testing using Playwright and web-vitals library
 * Tests Core Web Vitals (LCP, FID, CLS) on key pages
 */

test.describe('Web Vitals Performance Tests', () => {
  const vitalsData = [];
  
  test.beforeEach(async ({ page }) => {
    // Inject web-vitals library
    await page.addInitScript(() => {
      window.vitalsData = [];
      
      // Import and configure web-vitals
      import('https://unpkg.com/web-vitals@5/dist/web-vitals.attribution.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        // Collect all Core Web Vitals
        getCLS(metric => window.vitalsData.push({ name: 'CLS', value: metric.value, rating: metric.rating }));
        getFID(metric => window.vitalsData.push({ name: 'FID', value: metric.value, rating: metric.rating }));
        getFCP(metric => window.vitalsData.push({ name: 'FCP', value: metric.value, rating: metric.rating }));
        getLCP(metric => window.vitalsData.push({ name: 'LCP', value: metric.value, rating: metric.rating }));
        getTTFB(metric => window.vitalsData.push({ name: 'TTFB', value: metric.value, rating: metric.rating }));
      });
    });
  });

  const testPages = [
    { name: 'Homepage', url: '/' },
    { name: 'Article Page', url: '/posts/' }, // Will test first available post
    { name: 'About Page', url: '/about/' },
  ];

  testPages.forEach(({ name, url }) => {
    test(`Web Vitals - ${name}`, async ({ page }) => {
      // Navigate to page
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Wait for vitals to be collected
      await page.waitForTimeout(3000);
      
      // If it's the posts page, click on first article
      if (url === '/posts/') {
        const firstArticle = page.locator('article h1 a').first();
        if (await firstArticle.isVisible()) {
          await firstArticle.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
        }
      }
      
      // Get vitals data
      const vitals = await page.evaluate(() => window.vitalsData || []);
      
      console.log(`\n📊 Web Vitals for ${name}:`);
      console.log('─'.repeat(50));
      
      // Process and validate each metric
      const pageVitals = {
        page: name,
        url: page.url(),
        timestamp: new Date().toISOString(),
        metrics: {},
      };
      
      for (const metric of vitals) {
        pageVitals.metrics[metric.name] = {
          value: metric.value,
          rating: metric.rating,
        };
        
        console.log(`${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
        
        // Assert against Core Web Vitals thresholds
        switch (metric.name) {
          case 'LCP':
            expect(metric.value, `LCP should be under 2.5s (got ${metric.value}ms)`).toBeLessThan(2500);
            expect(metric.rating, 'LCP rating should be good').not.toBe('poor');
            break;
          case 'FID':
            expect(metric.value, `FID should be under 100ms (got ${metric.value}ms)`).toBeLessThan(100);
            expect(metric.rating, 'FID rating should be good').not.toBe('poor');
            break;
          case 'CLS':
            expect(metric.value, `CLS should be under 0.1 (got ${metric.value})`).toBeLessThan(0.1);
            expect(metric.rating, 'CLS rating should be good').not.toBe('poor');
            break;
          case 'FCP':
            expect(metric.value, `FCP should be under 1.8s (got ${metric.value}ms)`).toBeLessThan(1800);
            break;
          case 'TTFB':
            expect(metric.value, `TTFB should be under 600ms (got ${metric.value}ms)`).toBeLessThan(600);
            break;
        }
      }
      
      vitalsData.push(pageVitals);
    });
  });
  
  test.afterAll(async () => {
    // Save vitals data for tracking
    const metricsDir = path.join(process.cwd(), 'metrics');
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }
    
    const metrics = {
      timestamp: new Date().toISOString(),
      testRun: Date.now(),
      pages: vitalsData,
      summary: {
        totalPages: vitalsData.length,
        avgLCP: vitalsData.reduce((sum, p) => sum + (p.metrics.LCP?.value || 0), 0) / vitalsData.length,
        avgFID: vitalsData.reduce((sum, p) => sum + (p.metrics.FID?.value || 0), 0) / vitalsData.length,
        avgCLS: vitalsData.reduce((sum, p) => sum + (p.metrics.CLS?.value || 0), 0) / vitalsData.length,
        avgFCP: vitalsData.reduce((sum, p) => sum + (p.metrics.FCP?.value || 0), 0) / vitalsData.length,
        avgTTFB: vitalsData.reduce((sum, p) => sum + (p.metrics.TTFB?.value || 0), 0) / vitalsData.length,
      },
    };
    
    const metricsFile = path.join(metricsDir, 'web-vitals.json');
    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
    
    console.log(`\n💾 Web Vitals metrics saved to: ${path.relative(process.cwd(), metricsFile)}`);
    
    // Display summary
    console.log('\n📈 Web Vitals Summary:');
    console.log('─'.repeat(50));
    console.log(`Average LCP: ${metrics.summary.avgLCP.toFixed(2)}ms`);
    console.log(`Average FID: ${metrics.summary.avgFID.toFixed(2)}ms`);
    console.log(`Average CLS: ${metrics.summary.avgCLS.toFixed(3)}`);
    console.log(`Average FCP: ${metrics.summary.avgFCP.toFixed(2)}ms`);
    console.log(`Average TTFB: ${metrics.summary.avgTTFB.toFixed(2)}ms`);
  });
});