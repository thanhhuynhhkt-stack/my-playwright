import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { group2User } from '../../helpers/test-users';
import { getGmailOtp } from '../../helpers/gmail-otp';

test.describe('Login - Group 2', () => {
  test.describe.configure({ mode: 'serial' });

  test('Login Group 2 user via password + Gmail OTP @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const user = group2User();

    // Step 1: Open landing page
    await loginPage.goto();

    // Step 2: Click "Login with Changi Identity" → redirects to FIDOUAF URL
    await test.step('Click Login with Changi Identity → redirect to login page', async () => {
      await loginPage.clickLoginWithChangiIdentity();
    });

    // Step 3: Select "Password login" tab → Company Email + Password form appears
    await test.step('Click Password login tab → login form appears', async () => {
      await loginPage.clickPasswordLoginTab();
      await expect(loginPage.companyEmailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
    });

    // Steps 4–5: Enter credentials, click Log in → OTP screen
    const otpSentAfter = Date.now();
    await test.step('Enter credentials and click Log in → OTP screen', async () => {
      await loginPage.login(user.companyEmail, user.password);
      await expect(loginPage.otpScreenHeading).toBeVisible({ timeout: 15_000 });
    });

    // Step 6: Poll Gmail API for OTP and enter the code
    // Step 7: Click Continue → "You have logged in successfully!" screen
    await test.step('Enter Gmail OTP and click Continue → success screen', async () => {
      const otp = await getGmailOtp(otpSentAfter);
      await loginPage.enterOtp(otp);
      await loginPage.clickContinue();
      await expect(loginPage.loginSuccessMessage).toBeVisible();
    });

    // Step 8: Click "Back to home" → profile page
    await test.step('Click Back to home → profile page', async () => {
      await loginPage.clickBackToHome();
      await expect(page).toHaveURL(loginPage.profileUrl);
    });
  });
});
