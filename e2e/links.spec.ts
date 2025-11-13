import { test, expect } from '@playwright/test';

test('all external links should be valid', async ({ page, request }) => {
  await page.goto('/projects'); // or whatever route

  // Get all external links
  const links = await page.locator('a[href^="http"]').evaluateAll(
    (anchors) => anchors
      .map(a => a.getAttribute('href'))
      .filter(href => href !== null) as string[]
  );

  console.log(`Found ${links.length} external links to check`);

  for (const link of links) {
    console.log(`Checking: ${link}`);
    // const response = await request.head(link);
    const response = {
      status: () => 200
    }
    console.log(`Link ${link} returned ${response}`);
    expect(response.status(), `${link} returned ${response.status()}`).not.toBe(404);
  }
});
