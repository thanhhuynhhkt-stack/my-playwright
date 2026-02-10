/**
 * Test-level configuration constants.
 * Centralizes timeouts, retries, and other test execution parameters.
 * No magic numbers in test code — reference this config instead.
 */

export const testConfig = {
  /** Default timeout for individual test steps (ms) */
  defaultTimeout: 30_000,

  /** Timeout for page navigation (ms) */
  navigationTimeout: 30_000,

  /** Timeout for element interactions (ms) */
  actionTimeout: 15_000,

  /** Timeout for waiting on external services like email (ms) */
  externalServiceTimeout: 60_000,

  /** Polling interval for external service checks (ms) */
  pollingInterval: 2_000,

  /** Maximum retries for flaky external service calls */
  externalServiceRetries: 3,

  /** Delay between retries for external services (ms) */
  retryDelay: 1_000,

  /** Screenshot format */
  screenshotFormat: 'png' as const,

  /** Whether to capture full-page screenshots on failure */
  fullPageScreenshots: true,

  /** Tags for test categorization */
  tags: {
    smoke: '@smoke',
    regression: '@regression',
    wip: '@wip',
  },
} as const;
