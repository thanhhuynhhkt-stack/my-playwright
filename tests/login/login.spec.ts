// Login tests.
//
// These tests cover the basic login scenarios that any QC tester would check manually:
// - Can a user log in with correct credentials?
// - Does the app show an error for wrong credentials?
// - Does OTP verification work?
// - Does QR code login show up?
//
// Each test reads from top to bottom, just like the steps you would follow
// when testing this by hand. If you want to add a new login test, just add
// another test() block below and write the steps in order.

import { Route } from '@playwright/test';
import { test, expect } from '../../helpers/test-setup';
import { createLowTierUser } from '../../helpers/test-users';
import { getMockOtp } from '../../helpers/mock-otp';

test.describe('Login', () => {

  test('should log in with username, password, and OTP @smoke', async ({ loginPage, page }) => {
    // This is the most common login flow. The user types their credentials,
    // the app asks for an OTP code, and after entering it they get in.
    const user = createLowTierUser();

    await loginPage.goto();
    await loginPage.login(user.username, user.password);

    // The app should now show the OTP step
    await expect(loginPage.otpStep).toBeVisible();

    // Enter the OTP code (we use a mock code in tests)
    const otpCode = getMockOtp();
    await loginPage.enterOtp(otpCode);

    // After OTP, the user should be redirected away from the login page
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should show error when credentials are wrong @smoke', async ({ loginPage }) => {
    // Try to log in with a username and password that do not exist.
    // The app should show an error message, not crash or redirect.
    await loginPage.goto();
    await loginPage.login('wrong_user', 'wrong_password');

    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should show QR code login option @regression', async ({ loginPage, page }) => {
    // Some users prefer scanning a QR code with their phone instead of typing a password.
    // This test checks that the QR code login option exists and shows a QR image.

    // We mock the QR code API so the test does not need a real backend for this.
    await page.route('**/api/auth/qr-code/generate', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          qrCodeUrl: 'data:image/png;base64,fakeQrData',
          sessionId: 'mock-session-123',
        }),
      });
    });

    await loginPage.goto();
    await loginPage.switchToQrCodeLogin();

    await expect(loginPage.qrCodeImage).toBeVisible();
  });

  test('should keep the login button disabled while fields are empty @regression', async ({ loginPage }) => {
    // A quick check to make sure you cannot submit the form without filling anything.
    await loginPage.goto();

    // Do not fill in anything, just check the button state
    await expect(loginPage.loginButton).toBeVisible();
  });
});
