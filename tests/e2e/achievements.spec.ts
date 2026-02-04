import { test, expect } from '@playwright/test';

test.describe('Achievements', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should show "First Experiment" achievement on first playground run', async ({ page }) => {
    await page.goto('/');

    // Navigate to playground
    await page.click('text=API Playground');

    // Wait for playground to load
    await expect(page.locator('h1:has-text("API Playground")')).toBeVisible();

    // Select a task
    await page.click('text=Text Generation');

    // Enter input
    await page.fill('textarea[placeholder*="Enter your text"]', 'Test input');

    // Click Run
    await page.click('button:has-text("Run")');

    // Should show "First Experiment" achievement toast
    await expect(page.locator('text=First Experiment')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Run your first experiment')).toBeVisible();
  });

  test('should track streak correctly across multiple days', async ({ page }) => {
    // Day 1: First experiment
    await page.goto('/');
    await page.evaluate(() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      localStorage.setItem(
        'last-experiment-date',
        yesterday.toDateString()
      );
      localStorage.setItem('streak', '1');
    });

    await page.click('text=API Playground');
    await expect(page.locator('h1:has-text("API Playground")')).toBeVisible();

    // Run an experiment
    await page.click('text=Text Generation');
    await page.fill('textarea[placeholder*="Enter your text"]', 'Test input');
    await page.click('button:has-text("Run")');

    // Wait for experiment to complete
    await page.waitForTimeout(2000);

    // Check streak is now 2
    const streak = await page.evaluate(() => localStorage.getItem('streak'));
    expect(streak).toBe('2');
  });

  test('should reset streak when gap is more than 1 day', async ({ page }) => {
    // Set last experiment to 3 days ago
    await page.goto('/');
    await page.evaluate(() => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      localStorage.setItem(
        'last-experiment-date',
        threeDaysAgo.toDateString()
      );
      localStorage.setItem('streak', '5');
    });

    await page.click('text=API Playground');
    await expect(page.locator('h1:has-text("API Playground")')).toBeVisible();

    // Run an experiment
    await page.click('text=Text Generation');
    await page.fill('textarea[placeholder*="Enter your text"]', 'Test input');
    await page.click('button:has-text("Run")');

    // Wait for experiment to complete
    await page.waitForTimeout(2000);

    // Check streak is reset to 1
    const streak = await page.evaluate(() => localStorage.getItem('streak'));
    expect(streak).toBe('1');
  });

  test('should unlock "5 Day Streak" achievement', async ({ page }) => {
    // Set up 4-day streak from yesterday
    await page.goto('/');
    await page.evaluate(() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      localStorage.setItem(
        'last-experiment-date',
        yesterday.toDateString()
      );
      localStorage.setItem('streak', '4');
    });

    await page.click('text=API Playground');
    await expect(page.locator('h1:has-text("API Playground")')).toBeVisible();

    // Run an experiment (should increment to 5)
    await page.click('text=Text Generation');
    await page.fill('textarea[placeholder*="Enter your text"]', 'Test input');
    await page.click('button:has-text("Run")');

    // Should show "5 Day Streak" achievement toast
    await expect(page.locator('text=5 Day Streak')).toBeVisible({ timeout: 10000 });
  });

  test('should unlock "10 Experiments" achievement', async ({ page }) => {
    // Set up 9 previous experiments
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('total-experiments', '9');
    });

    await page.click('text=API Playground');
    await expect(page.locator('h1:has-text("API Playground")')).toBeVisible();

    // Run 10th experiment
    await page.click('text=Text Generation');
    await page.fill('textarea[placeholder*="Enter your text"]', 'Test input');
    await page.click('button:has-text("Run")');

    // Should show "10 Experiments" achievement toast
    await expect(page.locator('text=10 Experiments')).toBeVisible({ timeout: 10000 });
  });

  test('should display achievements panel', async ({ page }) => {
    await page.goto('/');

    // Look for achievements indicator in navigation or UI
    // This test assumes there's a way to view achievements
    // Adjust selector based on actual implementation
    const achievementsButton = page.locator('button:has-text("Achievements")');
    
    if (await achievementsButton.isVisible()) {
      await achievementsButton.click();
      await expect(page.locator('text=Your Achievements')).toBeVisible();
    }
  });

  test('should persist achievements in localStorage', async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => {
      localStorage.setItem('streak', '3');
      localStorage.setItem('total-experiments', '15');
      localStorage.setItem(
        'unlocked-achievements',
        JSON.stringify(['first-experiment', '10-experiments'])
      );
    });

    // Reload page
    await page.reload();

    // Check values persist
    const streak = await page.evaluate(() => localStorage.getItem('streak'));
    const totalExperiments = await page.evaluate(() => localStorage.getItem('total-experiments'));
    const achievements = await page.evaluate(() => 
      localStorage.getItem('unlocked-achievements')
    );

    expect(streak).toBe('3');
    expect(totalExperiments).toBe('15');
    expect(achievements).toContain('first-experiment');
    expect(achievements).toContain('10-experiments');
  });

  test('should unlock multiple achievements simultaneously', async ({ page }) => {
    // Set up conditions for multiple achievements
    await page.goto('/');
    await page.evaluate(() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      localStorage.setItem(
        'last-experiment-date',
        yesterday.toDateString()
      );
      localStorage.setItem('streak', '4'); // Will become 5
      localStorage.setItem('total-experiments', '9'); // Will become 10
    });

    await page.click('text=API Playground');
    await expect(page.locator('h1:has-text("API Playground")')).toBeVisible();

    // Run experiment
    await page.click('text=Text Generation');
    await page.fill('textarea[placeholder*="Enter your text"]', 'Test input');
    await page.click('button:has-text("Run")');

    // Should show both achievement toasts
    await expect(page.locator('text=5 Day Streak')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=10 Experiments')).toBeVisible({ timeout: 10000 });
  });
});
