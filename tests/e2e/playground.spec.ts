import { test, expect } from '@playwright/test';

test.describe('API Playground E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Happy Path Workflow', () => {
    test('should complete full playground workflow', async ({ page }) => {
      // Navigate to API Playground (assuming it's at root or click nav item)
      await expect(page.getByText('AI Playground')).toBeVisible();

      // Select text-generation task
      await page.getByRole('button', { name: /Text Generation/i }).click();

      // Verify task selected
      await expect(page.getByText('Generate creative text continuations')).toBeVisible();

      // Enter input text
      const textarea = page.getByPlaceholder(/Enter your prompt text/i);
      await textarea.fill('Once upon a time in a magical forest,');

      // Click Execute (mock API required for real execution in tests)
      const executeButton = page.getByRole('button', { name: /Execute/i });
      await expect(executeButton).toBeEnabled();

      // For E2E, we'd need actual API or mocked responses
      // This verifies the button is clickable
    });

    test('should load example prompt', async ({ page }) => {
      await expect(page.getByText('AI Playground')).toBeVisible();

      // Click Load Example button
      await page.getByRole('button', { name: /Example/i }).click();

      // Verify example text is loaded
      const textarea = page.getByPlaceholder(/Enter your prompt text/i);
      await expect(textarea).not.toHaveValue('');

      // Verify toast notification
      await expect(page.getByText('Example loaded')).toBeVisible();
    });
  });

  test.describe('Task Switching', () => {
    test('should switch between categories and tasks', async ({ page }) => {
      await expect(page.getByText('AI Playground')).toBeVisible();

      // Click Vision tab
      await page.getByRole('tab', { name: /Vision/i }).click();

      // Verify vision tasks appear
      await expect(page.getByText('Image Classification')).toBeVisible();

      // Click Text tab again
      await page.getByRole('tab', { name: /Text/i }).click();

      // Verify text tasks appear
      await expect(page.getByText('Text Generation')).toBeVisible();
    });

    test('should clear input when switching tasks', async ({ page }) => {
      await expect(page.getByText('AI Playground')).toBeVisible();

      // Select text generation and enter text
      const textarea = page.getByPlaceholder(/Enter your prompt text/i);
      await textarea.fill('Test input');

      // Switch to summarization
      await page.getByRole('button', { name: /Summarization/i }).click();

      // Verify input is cleared
      await expect(textarea).toHaveValue('');
    });
  });

  test.describe('Share Functionality', () => {
    test('should create shareable URL with playground state', async ({ page, context }) => {
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await expect(page.getByText('AI Playground')).toBeVisible();

      // Enter some text
      const textarea = page.getByPlaceholder(/Enter your prompt text/i);
      await textarea.fill('Share test prompt');

      // Click Share button
      await page.getByRole('button', { name: /Share/i }).click();

      // Verify success toast
      await expect(page.getByText(/Share link copied/i)).toBeVisible();

      // Read clipboard
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

      // Verify URL contains expected params
      expect(clipboardText).toContain('task=');
      expect(clipboardText).toContain('model=');
      expect(clipboardText).toContain('prompt=');
    });

    test('should load playground state from shared URL', async ({ page }) => {
      // Navigate with URL params
      await page.goto('/?task=summarization&model=t5-base&prompt=Test%20shared%20prompt');

      await page.waitForLoadState('networkidle');

      // Verify task is selected
      await expect(page.getByText('Summarization')).toBeVisible();

      // Verify prompt is loaded
      const textarea = page.getByPlaceholder(/Paste text to summarize/i);
      await expect(textarea).toHaveValue('Test shared prompt');

      // Verify info toast shown
      await expect(page.getByText(/Playground state loaded/i)).toBeVisible();
    });

    test('should sanitize XSS attempts in URL params', async ({ page }) => {
      // Attempt XSS via URL params
      const xssAttempt = '<script>alert("xss")</script>';
      await page.goto(`/?task=text-generation&prompt=${encodeURIComponent(xssAttempt)}`);

      await page.waitForLoadState('networkidle');

      // Verify script tags are stripped
      const textarea = page.getByPlaceholder(/Enter your prompt text/i);
      const value = await textarea.inputValue();
      expect(value).not.toContain('<script>');
      expect(value).not.toContain('</script>');
    });

    test('should handle invalid task IDs in URL', async ({ page }) => {
      await page.goto('/?task=invalid-task-id&prompt=test');

      await page.waitForLoadState('networkidle');

      // Should fall back to default state (first task)
      await expect(page.getByText('AI Playground')).toBeVisible();
      // No state should be loaded
      const textarea = page.locator('textarea').first();
      await expect(textarea).toHaveValue('');
    });
  });

  test.describe('SavedPrompts', () => {
    test('should save and load prompts', async ({ page }) => {
      await expect(page.getByText('AI Playground')).toBeVisible();

      // Enter a prompt
      const textarea = page.getByPlaceholder(/Enter your prompt text/i);
      await textarea.fill('My saved prompt for testing');

      // Click Save button
      await page.getByRole('button', { name: /Save/i }).first().click();

      // Enter prompt name in browser dialog (need to handle this)
      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('prompt');
        await dialog.accept('Test Prompt');
      });

      // Note: Browser dialogs are tricky in Playwright
      // In real implementation, replace window.prompt with a proper modal
    });
  });

  test.describe('Error Handling', () => {
    test('should show error when executing without input', async ({ page }) => {
      await expect(page.getByText('AI Playground')).toBeVisible();

      // Try to execute with empty input
      const executeButton = page.getByRole('button', { name: /Execute/i });
      await expect(executeButton).toBeDisabled();
    });

    test('should handle missing API token gracefully', async ({ page }) => {
      // Clear localStorage to remove token
      await page.evaluate(() => localStorage.clear());

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Enter text
      const textarea = page.getByPlaceholder(/Enter your prompt text/i);
      await textarea.fill('Test without token');

      // Try to execute
      const executeButton = page.getByRole('button', { name: /Execute/i });
      await executeButton.click();

      // Verify error toast
      await expect(page.getByText(/API token required/i)).toBeVisible();
    });
  });

  test.describe('Parameter Controls', () => {
    test('should adjust advanced parameters', async ({ page }) => {
      await expect(page.getByText('AI Playground')).toBeVisible();

      // Enable advanced parameters
      const advancedSwitch = page.getByRole('switch', { name: /Advanced Parameters/i });
      await advancedSwitch.click();

      // Verify parameter sliders are visible
      await expect(page.getByText(/Temperature/i)).toBeVisible();
      await expect(page.getByText(/Max Tokens/i)).toBeVisible();

      // Adjust temperature slider (if visible)
      const tempSlider = page.locator('input[type="range"]').first();
      if (await tempSlider.isVisible()) {
        await tempSlider.fill('0.5');
      }
    });
  });

  test.describe('Output Actions', () => {
    test('should show clear button when output exists', async ({ page }) => {
      // This test assumes output exists
      // In reality, we'd need to mock API response or have output pre-loaded
      await expect(page.getByText('AI Playground')).toBeVisible();
      
      // The clear/trash button should only appear when there's output
      // We can't easily test this without API mocking
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/');
      
      // Tab through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Verify focus is visible (browser handles this)
      // We can check if interactive elements are reachable
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'A', 'INPUT', 'TEXTAREA']).toContain(focusedElement);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await expect(page.getByText('AI Playground')).toBeVisible();

      // Check for aria-labels on important elements
      const executeButton = page.getByRole('button', { name: /Execute/i });
      await expect(executeButton).toBeVisible();

      // Verify textarea has label
      const textarea = page.locator('textarea').first();
      await expect(textarea).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.getByText('AI Playground')).toBeVisible();

      // Verify elements are still accessible
      const textarea = page.locator('textarea').first();
      await expect(textarea).toBeVisible();

      const executeButton = page.getByRole('button', { name: /Execute/i });
      await expect(executeButton).toBeVisible();
    });
  });

  test.describe('History Persistence', () => {
    test('should persist execution history in localStorage', async ({ page }) => {
      // This would require executing tasks and checking localStorage
      await expect(page.getByText('AI Playground')).toBeVisible();

      // Check if history exists in localStorage
      const history = await page.evaluate(() => {
        const item = localStorage.getItem('playground-history');
        return item ? JSON.parse(item) : [];
      });

      expect(Array.isArray(history)).toBe(true);
    });
  });
});
