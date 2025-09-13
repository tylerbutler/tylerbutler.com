import { test, expect } from '@playwright/test';

test.describe('Homepage Layout', () => {
  test('homepage full page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-full.png', { 
      fullPage: true,
      threshold: 0.2,
      maxDiffPixels: 1000
    });
  });

  test('homepage header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('header#primary')).toHaveScreenshot('header.png');
  });

  test('homepage sidebar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const sidebar = page.locator('#sidebar');
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('sidebar.png');
    }
  });

  test('homepage main content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('section#main')).toHaveScreenshot('main-content.png');
  });
});

test.describe('Article Layout', () => {
  test('single article page', async ({ page }) => {
    // Navigate to the first article available
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and click on the first article link
    const firstArticleLink = page.locator('article h1 a').first();
    await firstArticleLink.waitFor({ state: 'visible' });
    await firstArticleLink.click();
    
    // Wait for the article page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the full article page
    await expect(page).toHaveScreenshot('article-full.png', {
      fullPage: true,
      threshold: 0.2,
      maxDiffPixels: 1000
    });
  });

  test('article content area', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstArticleLink = page.locator('article h1 a').first();
    await firstArticleLink.waitFor({ state: 'visible' });
    await firstArticleLink.click();
    
    await page.waitForLoadState('networkidle');
    
    // Screenshot just the article content area - try different selectors
    const articleSelectors = ['article.post', 'article', '.post', 'main article', '[role="article"]'];
    let foundSelector = null;
    
    for (const selector of articleSelectors) {
      if (await page.locator(selector).isVisible()) {
        foundSelector = selector;
        break;
      }
    }
    
    if (foundSelector) {
      await expect(page.locator(foundSelector)).toHaveScreenshot('article-content.png');
    } else {
      // Fallback to main content area
      await expect(page.locator('main, #main, .main')).toHaveScreenshot('article-content.png');
    }
  });
});

test.describe('Code Blocks', () => {
  test('code syntax highlighting', async ({ page }) => {
    // Navigate to an article that contains code blocks
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for a code block in any article on the homepage, or navigate to a specific article
    const codeBlock = page.locator('pre code').first();
    if (await codeBlock.isVisible()) {
      await expect(codeBlock).toHaveScreenshot('code-block.png');
    }
  });
});

test.describe('Footer', () => {
  test('footer layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try different footer selectors
    const footerSelectors = ['footer#primary', 'footer', '.footer', '#footer', '[role="contentinfo"]'];
    let foundSelector = null;
    
    for (const selector of footerSelectors) {
      if (await page.locator(selector).isVisible()) {
        foundSelector = selector;
        break;
      }
    }
    
    if (foundSelector) {
      await expect(page.locator(foundSelector)).toHaveScreenshot('footer.png');
    } else {
      // Skip test if no footer found
      console.log('No footer element found, skipping footer screenshot test');
    }
  });
});