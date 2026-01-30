import { test, expect } from '@playwright/test';

// Test that runtime override of RELATED_QA_FUZZY plus injected QA data causes Related Q&A to appear for a term
test('RELATED_QA_FUZZY runtime override shows Related Q&A for fuzzy matches', async ({ page }) => {
  // Inject runtime overrides before any scripts run
  // Debug console logs from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.addInitScript(() => {
    (window as any).__RELATED_QA_FUZZY = true;
    (window as any).__QA_DATA_OVERRIDE = {
      'cs-3': {
        'Memory': [
          { question: 'What is cache memory?', answer: '', paper: 'S-test', topic: 'Memory', keywords: ['cache'] }
        ]
      }
    };
  });

  // Visit the unit page that contains the 'Cache memory' term (cs-3 exists in content)
  await page.goto('/unit/cs-3');

  // Wait for app to mount and render unit content
  await page.waitForSelector('.content-header', { timeout: 8000 });

  const btnTestId = 'related-qa-cache-memory';
  const btn = page.locator(`button[data-testid="${btnTestId}"]`).first();
  try {
    await expect(btn).toBeVisible({ timeout: 5000 });
  } catch (err) {
    // Dump page body for debugging
    const body = await page.evaluate(() => document.body ? document.body.innerHTML : 'no body');
    console.log('PAGE BODY DUMP:\n', body.slice(0, 2000));
    throw err;
  }

  // Click to navigate to QA view and expect /qa in url
  await btn.click();
  await page.waitForURL('**/qa/**', { timeout: 5000 });

  // Ensure QA view contains the injected fuzzy question
  const qaCard = page.locator('.qa .qa-card', { hasText: /cache/i }).first();
  await expect(qaCard).toBeVisible({ timeout: 5000 });
});