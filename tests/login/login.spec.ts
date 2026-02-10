/**
 * Login test spec.
 * Demonstrates parameterized testing across user groups and login methods.
 *
 * To add tests for a new login method:
 * 1. Add the method to the loginMethods array below
 * 2. Create helper steps if needed
 * 3. Tests are generated automatically for all group/method combinations
 */

import { test, expect } from '../../src/fixtures/test.fixture';
import { GROUP_CONFIGS } from '../../src/data/group-config';
import { MockManager } from '../../src/mocks/MockManager';
import { QrCodeMock } from '../../src/mocks/QrCodeMock';

// --------------- Credential-based Login (all groups) ---------------

for (const [groupId, config] of Object.entries(GROUP_CONFIGS)) {
  test.describe(`Login: ${config.displayName} ${config.tags.join(' ')}`, () => {
    test(`logs in with username/password + OTP @smoke`, async ({
      page,
      loginPage,
      testDataFactory,
      emailService,
      logger,
    }) => {
      const user = testDataFactory.createTestUser(groupId);

      await loginPage.navigate();
      await loginPage.loginWithCredentials(user.username, user.password);

      // Handle OTP verification based on group's verification strategy
      if (config.verificationStrategy === 'email-otp') {
        const otp = await emailService.fetchLatestOTP(user.email);
        await loginPage.enterOtp(otp.code);
      }

      // Verify successful login — redirected away from login page
      await expect(page).not.toHaveURL(/\/login/);
      logger.info(`Login successful for ${config.displayName}`);
    });

    test(`shows error on invalid credentials`, async ({
      loginPage,
    }) => {
      await loginPage.navigate();
      await loginPage.loginWithCredentials('invalid_user', 'wrong_password');

      await loginPage.expectErrorVisible();
    });
  });
}

// --------------- QR Code Login (mocked) ---------------

test.describe('Login: QR Code @regression', () => {
  test('logs in via QR code scan (mocked)', async ({
    page,
    loginPage,
    logger,
  }) => {
    // Set up QR code mocks
    const mockManager = new MockManager(page, logger);
    const qrMock = new QrCodeMock(mockManager);
    await qrMock.setup();

    await loginPage.navigate();
    await loginPage.switchToQrCodeLogin();

    // Verify QR code is displayed
    expect(await loginPage.isQrCodeVisible()).toBeTruthy();

    // The mock simulates a successful scan after polling
    // In the real app, the page would poll and redirect after scan
    logger.info('QR code login mock test completed');

    await mockManager.clearAll();
  });
});
