/**
 * Central mock lifecycle manager.
 * Manages Playwright route-based API mocking.
 * Parameterized by group configuration for group-specific mock responses.
 */

import { Page, Route } from '@playwright/test';
import { GroupConfig } from '../data/types';
import { Logger } from '../utils/Logger';

export interface MockRoute {
  /** URL pattern to match (string or RegExp) */
  pattern: string | RegExp;
  /** HTTP method to match (GET, POST, etc.) */
  method?: string;
  /** Response handler */
  handler: (route: Route, config?: GroupConfig) => Promise<void>;
}

export class MockManager {
  private readonly page: Page;
  private readonly logger: Logger;
  private readonly activeMocks: MockRoute[] = [];

  constructor(page: Page, logger: Logger) {
    this.page = page;
    this.logger = logger;
  }

  /**
   * Registers and activates a mock route.
   */
  async addMock(mock: MockRoute, config?: GroupConfig): Promise<void> {
    this.logger.info(`MockManager: Adding mock for ${mock.pattern}`);

    await this.page.route(mock.pattern, async (route) => {
      if (mock.method && route.request().method() !== mock.method) {
        await route.continue();
        return;
      }
      await mock.handler(route, config);
    });

    this.activeMocks.push(mock);
  }

  /**
   * Adds a simple JSON response mock.
   */
  async mockJsonResponse(
    pattern: string | RegExp,
    responseBody: unknown,
    options?: { status?: number; method?: string }
  ): Promise<void> {
    await this.addMock({
      pattern,
      method: options?.method,
      handler: async (route) => {
        await route.fulfill({
          status: options?.status || 200,
          contentType: 'application/json',
          body: JSON.stringify(responseBody),
        });
      },
    });
  }

  /**
   * Removes all active mocks.
   */
  async clearAll(): Promise<void> {
    this.logger.info('MockManager: Clearing all mocks');
    for (const mock of this.activeMocks) {
      await this.page.unroute(mock.pattern);
    }
    this.activeMocks.length = 0;
  }
}
