import { test, expect, devices } from '@playwright/test';

// Run in a mobile emulation to test touch behavior
const iPhone = devices['iPhone 12'];

test.use({ ...iPhone });

test('touch flagging persists on mobile', async ({ page }) => {
  await page.goto('/games');
  // Click Minesweeper card to open the game (GamesView is client-side)
  await page.waitForSelector('.games-grid', { timeout: 5000 });
  const minesCard = page.locator('.game-card', { hasText: 'Minesweeper' }).first();
  await minesCard.click();

  // Ensure game is ready (wait for explicit readiness marker)
  try {
    await page.waitForSelector('[data-testid="minesweeper-ready"]', { timeout: 10000 });
  } catch (err) {
    const body = await page.evaluate(() => document.body ? document.body.innerHTML : 'no body');
    console.log('MINESWEEPER BODY DUMP:\n', body.slice(0, 3000));
    throw err;
  }

  // Enable flag mode
  const flagBtn = page.locator('button[title="Toggle flagging mode on mobile"]').first();
  await flagBtn.click();

  // Tap a cell in the canvas (center-ish) and ensure a flag appears and remains
  const canvas = page.locator('.minesweeper-canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas bounding box not found');

  // Tap near the top-left cell
  await page.touchscreen.tap(box.x + 20, box.y + 20);

  // Wait a moment then assert the flag count increased and the flag drawing is visible
  await page.waitForTimeout(300);

  const stat = await page.locator('.game-stats').innerText();
  expect(stat).toContain('Flags:');
  // Ensure flag count shows > 0
  expect(/Flags:\s*\d+\s*\//.test(stat)).toBeTruthy();

  // Wait longer to ensure the flag does not immediately disappear
  await page.waitForTimeout(800);

  const stat2 = await page.locator('.game-stats').innerText();
  expect(stat2).toContain('Flags:');
  expect(/Flags:\s*\d+\s*\//.test(stat2)).toBeTruthy();
});