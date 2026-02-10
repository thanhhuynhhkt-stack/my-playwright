/**
 * Extended Playwright test fixture.
 * Injects all framework dependencies (pages, services, logger, flow engine, etc.)
 * into every test via Playwright's fixture system.
 *
 * This is the ONLY place tests get their dependencies — no global state,
 * no static singletons, no imports of implementations.
 *
 * Usage in tests:
 *   import { test, expect } from '../src/fixtures/test.fixture';
 */

import { test as base, expect } from '@playwright/test';
import { Logger } from '../utils/Logger';
import { ScreenshotHelper } from '../utils/ScreenshotHelper';
import { WaitHelper } from '../utils/WaitHelper';
import { RetryHelper } from '../utils/RetryHelper';
import { TestDataFactory } from '../data/TestDataFactory';
import { ServiceFactory } from '../services/ServiceFactory';
import { StepRegistry } from '../flows/StepRegistry';
import { FlowEngine } from '../flows/FlowEngine';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { ProfilePage } from '../pages/ProfilePage';
import { EmailService } from '../services/interfaces/EmailService';
import { AuthenticatorService } from '../services/interfaces/AuthenticatorService';
import { ApprovalService } from '../services/interfaces/ApprovalService';

/** Custom fixture type definitions */
export interface FrameworkFixtures {
  /** Instance-based logger scoped to the current worker */
  logger: Logger;
  /** Screenshot capture helper */
  screenshotHelper: ScreenshotHelper;
  /** Polling utility for async waits */
  waitHelper: WaitHelper;
  /** Retry utility for external service calls */
  retryHelper: RetryHelper;
  /** Test data factory */
  testDataFactory: TestDataFactory;
  /** Email service (mock or real based on env) */
  emailService: EmailService;
  /** Authenticator service */
  authenticatorService: AuthenticatorService;
  /** Approval service */
  approvalService: ApprovalService;
  /** Step registry with all registered steps */
  stepRegistry: StepRegistry;
  /** Flow engine for executing multi-step flows */
  flowEngine: FlowEngine;
  /** Login page object */
  loginPage: LoginPage;
  /** Registration page object */
  registrationPage: RegistrationPage;
  /** Profile page object */
  profilePage: ProfilePage;
}

export const test = base.extend<FrameworkFixtures>({
  // ---- Worker-scoped (read-only, shared across tests in a worker) ----
  // Note: Playwright fixtures default to test scope. Use { scope: 'worker' }
  // only for truly immutable, read-only resources.

  // ---- Test-scoped (fresh per test) ----

  logger: async ({ browser }, use, testInfo) => {
    const browserName = testInfo.project.name || 'unknown';
    const workerId = `worker-${testInfo.workerIndex}`;
    const logger = new Logger({
      workerId,
      browserName,
      minLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    });

    logger.testStart(testInfo.title);
    const startTime = Date.now();

    await use(logger);

    // After test: log result and attach logs to report
    const duration = Date.now() - startTime;
    logger.testEnd(testInfo.title, testInfo.status || 'unknown', duration);

    const logContent = logger.flushBuffer();
    if (logContent) {
      await testInfo.attach('test-logs', {
        body: logContent,
        contentType: 'text/plain',
      });
    }
  },

  screenshotHelper: async ({}, use) => {
    await use(new ScreenshotHelper());
  },

  waitHelper: async ({}, use) => {
    await use(new WaitHelper());
  },

  retryHelper: async ({ logger }, use) => {
    await use(new RetryHelper(logger));
  },

  testDataFactory: async ({}, use) => {
    await use(new TestDataFactory());
  },

  emailService: async ({}, use) => {
    const factory = new ServiceFactory();
    await use(factory.createEmailService());
  },

  authenticatorService: async ({}, use) => {
    const factory = new ServiceFactory();
    await use(factory.createAuthenticatorService());
  },

  approvalService: async ({}, use) => {
    const factory = new ServiceFactory();
    await use(factory.createApprovalService());
  },

  stepRegistry: async ({}, use) => {
    await use(new StepRegistry());
  },

  flowEngine: async ({ stepRegistry, logger }, use) => {
    await use(new FlowEngine(stepRegistry, logger));
  },

  loginPage: async ({ page, logger }, use) => {
    await use(new LoginPage(page, logger));
  },

  registrationPage: async ({ page, logger }, use) => {
    await use(new RegistrationPage(page, logger));
  },

  profilePage: async ({ page, logger }, use) => {
    await use(new ProfilePage(page, logger));
  },
});

// Auto-capture screenshot on failure (runs after every test)
test.afterEach(async ({ page, screenshotHelper }, testInfo) => {
  const browserName = testInfo.project.name || 'unknown';
  await screenshotHelper.captureOnFailure(page, testInfo, browserName);
});

export { expect };
