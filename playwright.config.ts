// Playwright configuration.
//
// This file controls how your tests run: which browsers, timeouts, retries, etc.
// Most of the time you do not need to change this. The defaults work well.
//
// If you want to run tests on just one browser during development, set the
// BROWSER environment variable. For example: BROWSER=chromium npm test

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Which browsers to test on. You can filter this with the BROWSER env variable.
const browserFilter = process.env.BROWSER;

const allBrowsers = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'edge',
    use: { channel: 'msedge' },
  },
];

const projects = browserFilter
  ? allBrowsers.filter((b) => b.name === browserFilter)
  : allBrowsers;

export default defineConfig({
  // Where the test files live
  testDir: './tests',

  // Registration tests involve multiple external redirects (Mockpass → Microsoft → ADFS)
  // and take well over 30 s; 120 s is a safe upper bound.
  timeout: 120_000,

  // Run tests in parallel for speed
  fullyParallel: true,

  // In CI, do not allow test.only (it would skip other tests by accident)
  forbidOnly: !!process.env.CI,

  // Retry failed tests in CI to handle flaky tests
  retries: process.env.CI ? 2 : 0,

  // Limit workers in CI so it does not overload the machine
  workers: process.env.CI ? 4 : undefined,

  // Reports: HTML report, JSON for CI tools, and Allure for detailed reporting
  reporter: [
    ['html', { open: 'never', outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],

  use: {
    // Target environment URL — set BASE_URL in your .env file to switch environments.
    baseURL: process.env.BASE_URL,

    // Save traces on the first retry so you can debug flaky tests
    trace: 'on-first-retry',

    // Take a screenshot when a test fails. Helps a lot when debugging.
    screenshot: 'only-on-failure',

    // Always record video as evidence (attached to Allure report)
    video: 'on',

    // How long to wait for a click or fill before giving up
    actionTimeout: 15_000,

    // How long to wait for a page to load
    navigationTimeout: 30_000,

    ignoreHTTPSErrors: true,
  },

  projects,

  // Where test results (screenshots, videos, traces) are saved
  outputDir: 'reports/test-results',
});
