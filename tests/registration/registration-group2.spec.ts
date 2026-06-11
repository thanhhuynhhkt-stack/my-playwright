// Registration — Group 2 user via Singpass (Mockpass).
//
// Full flow:
// 1.  Open registration page
// 2.  Click "Retrieve MyInfo with Singpass" → redirects to Mockpass
// 3.  Click Login on Mockpass → opens login modal
// 4.  Select username "thanhhuynh [Group 2]" → navigates back to Account Information page
// 5.  Click "Continue" → navigate to Complete Profile page
// 6.  Enter company email + company mobile, click Continue → Identity verification popup
// 7.  Click "Verify email" → Enter OTP screen
// 8.  Poll Gmail API for the real OTP → enter it, click Continue → Set password
// 9.  Enter password + confirm → Continue → Terms & Conditions
// 10. Scroll, accept T&C → Create account → success screen
// 11. Click Done → verify redirect to landing page

import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { MockpassPage } from '../../pages/MockpassPage';
import { group2User } from '../../helpers/test-users';
import { getGmailOtp } from '../../helpers/gmail-otp';

test.describe('Registration - Group 2', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    const user = group2User();
    if (user.userUid) {
      // Delete the user before each run so the registration test is repeatable.
      // 200 = deleted, 404 = user didn't exist — both are fine.
      await request.delete(`/dev/users/${user.userUid}`);
    }
  });

  test('Register a Group 2 user via Singpass successfully @smoke', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const mockpassPage = new MockpassPage(page);
    const user = group2User();

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

    // Account Information page: Group 2 users are non-CAG, so click Continue
    await registrationPage.clickContinue();

    // Step 5: Enter company email + mobile, then Continue → Identity verification popup
    await registrationPage.enterEmail(user.companyEmail);
    await registrationPage.enterMobile(user.mobileNumber);
    const otpSentAfter = Date.now(); // capture before Continue so we only match the new OTP email
    await registrationPage.clickContinue();

    // Step 6: Click "Verify email" → moves to OTP entry screen
    await registrationPage.clickVerifyEmail();

    // Step 7: Poll Gmail API for the OTP email sent in step 5 and enter the code
    const otp = await getGmailOtp(otpSentAfter);
    await registrationPage.enterOtp(otp);
    await registrationPage.clickContinue();

    // Step 8: Enter and confirm password → Continue → Terms & Conditions screen
    await registrationPage.enterPasswords(user.password);
    await registrationPage.clickContinue();

    // Step 9: Scroll down, accept T&C, create account
    await registrationPage.acceptTermsAndCreate();

    // Verify success screen
    await expect(registrationPage.successMessage).toBeVisible();
    await expect(registrationPage.doneButton).toBeVisible();

    // Step 10: Click Done → verify redirect to landing page
    await registrationPage.clickDone();
    await expect(page).toHaveURL(registrationPage.landingUrl);
  });
});
