// Registration tests for Medium Tier users.
//
// Medium tier has a few more steps than low tier:
// 1. Fill personal info
// 2. Verify email with OTP code
// 3. Identity verification (third party check)
// 4. Accept terms and conditions
// 5. Set up profile
// 6. See the welcome screen
//
// The main difference from low tier is the identity verification step
// and the profile setup step. No approval is needed.

import { test, expect } from '../../helpers/test-setup';
import { createMediumTierUser } from '../../helpers/test-users';
import { getMockOtp } from '../../helpers/mock-otp';

test.describe('Registration - Medium Tier @medium-tier @regression', () => {

  test('should complete the full registration flow', async ({ registrationPage, page }) => {
    const user = createMediumTierUser();

    // Step 1: Go to registration page
    await registrationPage.goto();

    // Step 2: Fill in personal info
    await registrationPage.fillPersonalInfo(user.firstName, user.lastName, user.email);
    await registrationPage.fillPassword(user.password);
    await registrationPage.clickNext();

    // Step 3: Enter the OTP code
    const otpCode = getMockOtp();
    await registrationPage.enterOtp(otpCode);

    // Step 4: Identity verification
    // In this step the app asks the user to verify their identity through a
    // third party service. In tests we just wait for the step to complete
    // since the mock service auto-approves it.
    await expect(registrationPage.stepIndicator).toContainText('identity');
    await registrationPage.clickNext();

    // Step 5: Accept terms and conditions
    await registrationPage.acceptTerms();
    await registrationPage.clickNext();

    // Step 6: Profile setup
    // The medium tier shows a profile setup form after terms acceptance.
    await registrationPage.clickNext();

    // Step 7: Check that the success/welcome message appears
    await expect(registrationPage.successMessage).toBeVisible();
  });

  test('should show error when required fields are empty', async ({ registrationPage }) => {
    await registrationPage.goto();
    await registrationPage.clickNext();

    await expect(registrationPage.errorMessage).toBeVisible();
  });
});
