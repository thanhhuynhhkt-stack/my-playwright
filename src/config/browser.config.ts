/**
 * Browser-specific configurations and quirk handling.
 * Centralizes viewport overrides, timeout adjustments, and
 * browser-specific workarounds.
 */

export interface BrowserConfig {
  /** Default viewport size */
  viewport: { width: number; height: number };
  /** Navigation timeout override (ms) */
  navigationTimeout: number;
  /** Action timeout override (ms) */
  actionTimeout: number;
  /** Extra launch options */
  launchOptions: Record<string, unknown>;
}

const defaultConfig: BrowserConfig = {
  viewport: { width: 1280, height: 720 },
  navigationTimeout: 30_000,
  actionTimeout: 15_000,
  launchOptions: {},
};

const browserConfigs: Record<string, Partial<BrowserConfig>> = {
  chromium: {
    // Chrome-specific settings
  },
  firefox: {
    // Firefox tends to be slower on some actions
    actionTimeout: 20_000,
  },
  webkit: {
    // Safari-specific viewport
    viewport: { width: 1280, height: 800 },
    navigationTimeout: 35_000,
  },
  edge: {
    // Edge inherits from Chromium, usually no overrides needed
  },
};

/**
 * Returns the merged browser configuration for the given browser name.
 * Falls back to defaults for unknown browsers.
 */
export function getBrowserConfig(browserName: string): BrowserConfig {
  const overrides = browserConfigs[browserName] || {};
  return {
    ...defaultConfig,
    ...overrides,
    viewport: { ...defaultConfig.viewport, ...overrides.viewport },
    launchOptions: { ...defaultConfig.launchOptions, ...overrides.launchOptions },
  };
}
