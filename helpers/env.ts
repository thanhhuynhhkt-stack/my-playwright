// Central accessor for environment-specific config.
//
// Playwright loads .env via playwright.config.ts before any test or page object
// is instantiated, so process.env is already populated by the time these are called.
// Add any new environment-specific hostname or URL here rather than reading
// process.env directly in page objects or test files.

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set in .env`);
  return value;
}

export function getEnvConfig() {
  const baseUrl = required('BASE_URL').replace(/\/$/, '');
  const adfsHost = required('ADFS_HOST');
  const appHost = new URL(baseUrl).hostname;

  return {
    baseUrl,
    // Pre-built RegExp patterns for waitForURL — dots are escaped so they match
    // literally rather than acting as wildcards.
    appHostPattern: new RegExp(appHost.replace(/\./g, '\\.')),
    adfsHostPattern: new RegExp(adfsHost.replace(/\./g, '\\.')),
  };
}
