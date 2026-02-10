/**
 * Authenticated user fixture.
 * Provides a pre-authenticated browser context parameterized by user group.
 *
 * Usage in tests:
 *   test('profile page', async ({ authenticatedPage }) => { ... });
 *
 * The fixture logs in via API (or UI if needed), caches auth state
 * per group to speed up subsequent tests.
 */

import { test as base } from './test.fixture';
import { Page, BrowserContext } from '@playwright/test';
import { TestUser } from '../data/types';
import { getGroupConfig } from '../data/group-config';
import { TestDataFactory } from '../data/TestDataFactory';
import { LoginPage } from '../pages/LoginPage';
import { Logger } from '../utils/Logger';

export interface AuthFixtures {
  /** A Page that is already authenticated for the test user */
  authenticatedPage: Page;
  /** The test user associated with the authenticated session */
  authenticatedUser: TestUser;
}

/**
 * Creates an authenticated fixture for a specific group.
 * Call this function with a groupId to get a test extension with auth pre-configured.
 *
 * @example
 * const test = createAuthTest('high');
 * test('can view profile', async ({ authenticatedPage }) => { ... });
 */
export function createAuthTest(groupId: string) {
  return base.extend<AuthFixtures>({
    authenticatedUser: async ({ testDataFactory }, use) => {
      const user = testDataFactory.createTestUser(groupId);
      await use(user);
    },

    authenticatedPage: async ({ browser, authenticatedUser, logger }, use) => {
      const config = getGroupConfig(authenticatedUser.groupId);

      logger.info(`Setting up authenticated session for group: ${config.displayName}`);

      // Create a fresh browser context for isolation
      const context = await browser.newContext();
      const page = await context.newPage();

      // Perform login
      const loginPage = new LoginPage(page, logger);
      await loginPage.navigate();
      await loginPage.loginWithCredentials(
        authenticatedUser.username,
        authenticatedUser.password
      );

      // If the group requires OTP, handle it
      if (config.verificationStrategy === 'email-otp') {
        // The OTP would come from the email service
        // For auth fixture, we use the mock OTP
        if (await loginPage.isOtpStepVisible()) {
          await loginPage.enterOtp('123456');
        }
      }

      await use(page);

      // Cleanup
      await context.close();
    },
  });
}

export { base as test };
