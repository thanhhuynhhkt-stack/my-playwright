// Demo login tests.

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { Group2User } from '../../helpers/test-users';
import { getMockOtp } from 'helpers/mock-otp';

test.describe('2FA Login', () => {
  test.describe.configure({ mode: 'serial' });

  test('Log in with correct username and password @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const user = Group2User();

    await loginPage.goto();
    await test.step(`Click Login with OIDC -> Login page appear`, async () => {
      await loginPage.loginB2bOIDCButton.click();
      await page.waitForLoadState('networkidle');
      await expect(loginPage.passwordLoginTab).toBeVisible();
      await expect(loginPage.registerButton).toBeVisible();
    });

    await test.step(`Click Password log in tab -> Change tab success `, async () => {
      await loginPage.passwordLoginTab.click();
      await page.waitForURL(`https://login-test.adnsg-demo.getnevis.net/auth/2fa/`);
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
    });

    await test.step(`Input correct username & password and click Login`, async () => {
      await loginPage.login(user.username, user.password);
      await expect(loginPage.otpPageText).toBeVisible();
    });
    
    await test.step(`Input OTP code and click Continue`, async () => {
      const otpCode = getMockOtp();
      await loginPage.enterOtp(otpCode);
      await expect(loginPage.loginSuccessMessage).toBeVisible();
    });

    await test.step(`Click Back to Home button`, async () => {
      await loginPage.backToHomeButton.click();
      await expect(page).toHaveURL(`https://ci-mock-web-int.inferno-squad.adnovumlabs.com:8443/landing-page`);
    });

    await loginPage.logout();
  });

  test('Log in with incorrect username or password @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const user = Group2User();

    await loginPage.goto();
    await test.step(`Click Login with OIDC -> Login page appear`, async () => {
      await loginPage.loginB2bOIDCButton.click();
      await page.waitForLoadState('networkidle');
      await expect(loginPage.passwordLoginTab).toBeVisible();
      await expect(loginPage.registerButton).toBeVisible();
    });

    await test.step(`Click Password log in tab -> Change tab success `, async () => {
      await loginPage.passwordLoginTab.click();
      await page.waitForURL(`https://login-test.adnsg-demo.getnevis.net/auth/2fa/`);
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
    });

    await test.step(`Login with wrong username: thanh@gmail.com`, async () => {
      await loginPage.login('thanh@gmail.com', user.password); // Wrong username
      await expect(loginPage.failLoginMessage).toBeVisible();
    });

    await test.step(`Login with wrong password: 123456`, async () => {
      await loginPage.login(user.username, '123456'); // Wrong password
      await expect(loginPage.failLoginMessage).toBeVisible();
    });
  });

});
