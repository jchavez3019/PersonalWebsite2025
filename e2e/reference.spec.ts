import { test, expect } from '@playwright/test';

/**
 * PLAYWRIGHT E2E TEST REFERENCE
 *
 * This file serves as a reference for writing Playwright tests.
 * All tests here should always pass and demonstrate common patterns.
 */

// ============================================================================
// BASIC TEST STRUCTURE
// ============================================================================

test('basic test structure', async ({ page }) => {
  // Navigate to a page
  await page.goto('/');

  // Make assertions
  expect(true).toBe(true);
});

// ============================================================================
// PAGE NAVIGATION & LOADING
// ============================================================================

test('navigate to homepage', async ({ page }) => {
  await page.goto('/');

  // Wait for page to be fully loaded
  await page.waitForLoadState('load');

  // Check URL
  expect(page.url()).toContain('localhost:4200');
});

test('check page title', async ({ page }) => {
  await page.goto('/');

  // Get and verify page title
  const title = await page.title();
  expect(title).toBeTruthy(); // Title exists
  expect(typeof title).toBe('string');
});

// ============================================================================
// ELEMENT INTERACTION
// ============================================================================

test('find elements on page', async ({ page }) => {
  await page.goto('/');

  // Find element by CSS selector
  const body = page.locator('body');
  await expect(body).toBeVisible();

  // Count elements
  const links = page.locator('a');
  const linkCount = await links.count();
  expect(linkCount).toBeGreaterThanOrEqual(0);
});

test('interact with elements', async ({ page }) => {
  await page.goto('/');

  // Click a link (if it exists)
  const firstLink = page.locator('a').first();
  const linkExists = await firstLink.count() > 0;

  if (linkExists) {
    // Get href before clicking
    const href = await firstLink.getAttribute('href');
    console.log('First link href:', href);

    // You could click it (but we'll skip to keep test simple)
    // await firstLink.click();
  }

  expect(linkExists).toBeDefined();
});

// ============================================================================
// TEXT & CONTENT VERIFICATION
// ============================================================================

test('verify page has content', async ({ page }) => {
  await page.goto('/');

  // Get all text content
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).toBeTruthy();
  expect(bodyText!.length).toBeGreaterThan(0);
});

test('check for specific text', async ({ page }) => {
  await page.goto('/');

  // Check if body element exists (always true)
  const bodyExists = await page.locator('body').count() > 0;
  expect(bodyExists).toBe(true);
});

// ============================================================================
// WORKING WITH MULTIPLE ELEMENTS
// ============================================================================

test('iterate through elements', async ({ page }) => {
  await page.goto('/');

  // Get all links
  const links = await page.locator('a').all();

  console.log(`Found ${links.length} links on the page`);

  // Iterate and log
  for (let i = 0; i < Math.min(links.length, 3); i++) {
    const href = await links[i].getAttribute('href');
    const text = await links[i].textContent();
    console.log(`Link ${i + 1}: ${text} -> ${href}`);
  }

  expect(links.length).toBeGreaterThanOrEqual(0);
});

// ============================================================================
// SCREENSHOTS & DEBUGGING
// ============================================================================

test('take screenshot', async ({ page }) => {
  await page.goto('/');

  // Take a screenshot
  await page.screenshot({ path: 'test-results/homepage.png' });

  // Take screenshot of specific element
  const body = page.locator('body');
  await body.screenshot({ path: 'test-results/body.png' });

  expect(true).toBe(true);
});

// ============================================================================
// VIEWPORT & RESPONSIVE TESTING
// ============================================================================

test('test responsive design', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  const mobileWidth = page.viewportSize()?.width;
  expect(mobileWidth).toBe(375);

  // Set desktop viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  const desktopWidth = page.viewportSize()?.width;
  expect(desktopWidth).toBe(1920);
});

// ============================================================================
// ASYNC OPERATIONS & TIMEOUTS
// ============================================================================

test('handle async operations', async ({ page }) => {
  await page.goto('/');

  // Wait for specific time (not recommended, but shown for reference)
  await page.waitForTimeout(100);

  // Better: wait for network to be idle
  await page.waitForLoadState('networkidle');

  // Better: wait for specific element
  await page.waitForSelector('body', { timeout: 5000 });

  expect(true).toBe(true);
});

// ============================================================================
// CONSOLE & NETWORK MONITORING
// ============================================================================

test('monitor console messages', async ({ page }) => {
  const messages: string[] = [];

  // Listen to console events
  page.on('console', msg => {
    messages.push(`${msg.type()}: ${msg.text()}`);
  });

  await page.goto('/');

  console.log(`Captured ${messages.length} console messages`);

  expect(messages.length).toBeGreaterThanOrEqual(0);
});

// ============================================================================
// CONDITIONAL TESTING
// ============================================================================

test('conditional checks', async ({ page }) => {
  await page.goto('/');

  // Check if element exists before interacting
  const navExists = await page.locator('nav').count() > 0;

  if (navExists) {
    console.log('Navigation found on page');
    const navText = await page.locator('nav').textContent();
    expect(navText).toBeTruthy();
  } else {
    console.log('No navigation found on page');
  }

  // Test always passes regardless
  expect(true).toBe(true);
});

// ============================================================================
// GROUPING TESTS WITH DESCRIBE
// ============================================================================

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Runs before each test in this group
    await page.goto('/');
  });

  test('has title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('has body', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

// ============================================================================
// TAGS FOR ORGANIZING TESTS
// ============================================================================

test('quick smoke test', {
  tag: '@smoke',
}, async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});

test('detailed component test', {
  tag: '@detailed',
}, async ({ page }) => {
  await page.goto('/');

  const elements = await page.locator('*').count();
  console.log(`Page has ${elements} total elements`);

  expect(elements).toBeGreaterThan(0);
});

// ============================================================================
// TIMEOUT CONFIGURATION
// ============================================================================

test('test with custom timeout', async ({ page }) => {
  // Set timeout for this specific test
  test.setTimeout(30000); // 30 seconds

  await page.goto('/');
  expect(true).toBe(true);
});

// ============================================================================
// SKIP & ONLY (for development)
// ============================================================================

// Uncomment to skip a test
// test.skip('skipped test', async ({ page }) => {
//   // This test won't run
// });

// Uncomment to run only this test
// test.only('only this test runs', async ({ page }) => {
//   await page.goto('/');
//   expect(true).toBe(true);
// });

// ============================================================================
// API TESTING (without page navigation)
// ============================================================================

test('check external API endpoint', async ({ request }) => {
  // Make HTTP request without browser
  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');

  expect(response.ok()).toBe(true);
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data).toHaveProperty('id');
  expect(data).toHaveProperty('title');
});

// ============================================================================
// HELPFUL COMMANDS TO REMEMBER
// ============================================================================

/*
RUN TESTS:
  npm run e2e                    - Run all tests
  npx playwright test            - Run all tests
  npx playwright test --headed   - Show browser
  npx playwright test --debug    - Debug mode with inspector
  npx playwright test --ui       - Interactive UI mode
  npx playwright test example.spec.ts  - Run specific file
  npx playwright test --grep @smoke    - Run tests with @smoke tag

DEBUGGING:
  await page.pause()             - Pause execution, open inspector
  npx playwright show-report     - View HTML report
  npx playwright codegen         - Record interactions

COMMON LOCATORS:
  page.locator('button')         - Find by tag
  page.locator('#id')            - Find by ID
  page.locator('.class')         - Find by class
  page.locator('[data-testid="x"]')  - Find by test ID
  page.getByRole('button')       - Find by ARIA role
  page.getByText('Hello')        - Find by text
  page.getByLabel('Email')       - Find by label

COMMON ASSERTIONS:
  expect(value).toBe(expected)
  expect(value).toEqual(expected)
  expect(value).toBeTruthy()
  expect(value).toContain(substring)
  expect(array).toHaveLength(3)
  await expect(locator).toBeVisible()
  await expect(locator).toHaveText('text')
  await expect(locator).toHaveAttribute('href', 'url')
*/
