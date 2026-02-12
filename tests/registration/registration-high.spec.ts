// Registration tests for High Tier users.
//
// High tier is the most complete registration flow. It includes everything:
// 1. Fill personal info
// 2. Verify email with OTP code
// 3. Identity verification
// 4. Authenticator app setup (instead of email OTP, high tier uses an app like Google Authenticator)
// 5. Accept terms and conditions
// 6. Wait for admin approval (high tier accounts need to be approved by an admin)
// 7. Set up profile
// 8. See the welcome screen
//
// The two unique steps here are the authenticator setup and the approval wait.
// This is the flow that takes the longest and has the most things to verify.

import { test, expect } from '../../helpers/test-setup';
import { createHighTierUser } from '../../helpers/test-users';
import { getMockOtp } from '../../helpers/mock-otp';

test.describe('Registration - High Tier @high-tier @regression', () => {

  test('should complete the full registration flow', async ({ registrationPage, page }) => {
    const user = createHighTierUser();

    // Step 1: Go to registration page
    await registrationPage.goto();

    // Step 2: Fill in personal info
    await registrationPage.fillPersonalInfo(user.firstName, user.lastName, user.email);
    await registrationPage.fillPassword(user.password);
    await registrationPage.clickNext();

    // Step 3: Enter the OTP code for email verification
    const otpCode = getMockOtp();
    await registrationPage.enterOtp(otpCode);

    // Step 4: Identity verification
    await expect(registrationPage.stepIndicator).toContainText('identity');
    await registrationPage.clickNext();

    // Step 5: Authenticator app setup
    // High tier users set up an authenticator app (like Google Authenticator)
    // instead of using email OTP for future logins.
    // In tests, the mock authenticator service handles this automatically.
    await expect(registrationPage.stepIndicator).toContainText('authenticator');
    await registrationPage.clickNext();

    // Step 6: Accept terms and conditions
    await registrationPage.acceptTerms();
    await registrationPage.clickNext();

    // Step 7: Approval wait
    // High tier accounts need admin approval. The app shows a waiting screen.
    // In tests, the mock approval service auto-approves after a short wait.
    await expect(registrationPage.stepIndicator).toContainText('approval');
    await registrationPage.clickNext();

    // Step 8: Profile setup
    await registrationPage.clickNext();

    // Step 9: Check that the success/welcome message appears
    await expect(registrationPage.successMessage).toBeVisible();
  });

  test('should show error when required fields are empty', async ({ registrationPage }) => {
    await registrationPage.goto();
    await registrationPage.clickNext();

    await expect(registrationPage.errorMessage).toBeVisible();
  });

  test('should handle the approval wait step', async ({ registrationPage, page }) => {
    // This test specifically checks that the approval step works.
    // It goes through the flow up to the approval step and verifies the waiting UI.
    const user = createHighTierUser();

    await registrationPage.goto();

    await registrationPage.fillPersonalInfo(user.firstName, user.lastName, user.email);
    await registrationPage.fillPassword(user.password);
    await registrationPage.clickNext();

    const otpCode = getMockOtp();
    await registrationPage.enterOtp(otpCode);

    // Go through identity verification
    await registrationPage.clickNext();

    // Go through authenticator setup
    await registrationPage.clickNext();

    // Accept terms
    await registrationPage.acceptTerms();
    await registrationPage.clickNext();

    // Now we should be at the approval step
    await expect(registrationPage.stepIndicator).toContainText('approval');
  });
});
