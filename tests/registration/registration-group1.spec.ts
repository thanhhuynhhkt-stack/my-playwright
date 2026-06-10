// Registration — Group 1 user via Singpass (Mockpass).
//
// Full flow:
// 1.  Open registration page
// 2.  Click "Retrieve MyInfo with Singpass" → redirects to Mockpass
// 3.  Click Login on Mockpass → opens login modal
// 4.  Select username "xxx [Group 1]" → Mockpass reads the assertUrl and
//     navigates back to the Account Information page automatically
// 5.  Click "Log in" (CAG login) on Account Information page
//     → Microsoft login → enter email → Next
//     → intermediate "Taking you to org's sign-in page" (auto-navigates)
//     → ADFS → enter password → Sign in
//     → Microsoft "Stay signed in?" → No
//     → redirected to Complete Profile page
// 6.  Enter company mobile number → Continue
// 7.  Enter new password + confirm password → Confirm
// 8.  Scroll down, accept Terms & Conditions → Create account
// 9.  Verify success screen ("Changi Identity account created successfully!")
// 10. Click Done → verify redirect to landing page

import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { MockpassPage } from '../../pages/MockpassPage';
import { MicrosoftLoginPage } from '../../pages/MicrosoftLoginPage';
import { group1User } from '../../helpers/test-users';

test.describe('Registration - Group 1', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    const user = group1User();
    // Delete the user and all related records before each run so the registration
    // test is repeatable. 200 = deleted, 404 = user didn't exist — both are fine.
    // Uses baseURL from playwright.config.ts (set via BASE_URL in .env).
    await request.delete(`/dev/users/${user.userUid}`);
  });

  test('should register a Group 1 user via Singpass @smoke', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const mockpassPage = new MockpassPage(page);
    const msLoginPage = new MicrosoftLoginPage(page);
    const user = group1User();

    // Step 1: Open registration page
    await registrationPage.goto();

    // Step 2: Click "Retrieve MyInfo with Singpass" → redirects to Mockpass
    await registrationPage.clickRetrieveMyInfo();
    await page.waitForLoadState('load');

    // Step 3: Click Login to open the Mockpass modal
    await mockpassPage.clickLogin();
    await page.waitForLoadState('load');

    // Step 4: Select username → Mockpass navigates back to Account Information page
    await mockpassPage.selectUsername(user.singpassUsername);
    await page.waitForURL(/changi-identity-dev\.changiairport\.com/);

    // Step 5: Click "CAG Log in" → full Microsoft/ADFS login flow
    await registrationPage.clickChangiLogin();
    await msLoginPage.login(user.changiUsername, user.changiPassword);

    // Step 6: On Complete Profile page, enter company mobile and continue
    await registrationPage.enterMobile(user.mobileNumber);
    await registrationPage.clickContinue();

    // Step 7: Enter and confirm password, then click Continue (button says "Continue" not "Confirm")
    await registrationPage.enterPasswords(user.password);
    await registrationPage.clickContinue();

    // Step 8: Accept terms and create account
    await registrationPage.acceptTermsAndCreate();

    // Step 9: Verify success screen
    await expect(registrationPage.successMessage).toBeVisible();
    await expect(registrationPage.doneButton).toBeVisible();

    // Step 10: Click Done → verify redirect to landing page
    await registrationPage.clickDone();
    await expect(page).toHaveURL(registrationPage.landingUrl);
  });
});
