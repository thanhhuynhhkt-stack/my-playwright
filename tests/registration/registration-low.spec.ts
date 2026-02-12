// Registration tests for Low Tier users.
//
// Low tier is the simplest registration flow. The steps are:
// 1. Fill personal info (name, email, password)
// 2. Verify email with OTP code
// 3. Accept terms and conditions
// 4. See the welcome/success screen
//
// We write out every step explicitly so you can read this test like a checklist.
// If the flow changes (for example, a new step gets added), just update the steps here.

import { test, expect } from '../../helpers/test-setup';
import { createLowTierUser } from '../../helpers/test-users';
import { getMockOtp } from '../../helpers/mock-otp';

test.describe('Registration - Low Tier @low-tier @smoke', () => {

  test('should complete the full registration flow', async ({ registrationPage }) => {
    const user = createLowTierUser();

    // Step 1: Go to registration page
    await registrationPage.goto();

    // Step 2: Fill in personal info
    await registrationPage.fillPersonalInfo(user.firstName, user.lastName, user.email);
    await registrationPage.fillPassword(user.password);
    await registrationPage.clickNext();

    // Step 3: Enter the OTP code sent to the email
    const otpCode = getMockOtp();
    await registrationPage.enterOtp(otpCode);

    // Step 4: Accept terms and conditions
    await registrationPage.acceptTerms();
    await registrationPage.submit();

    // Step 5: Check that the success message appears
    await expect(registrationPage.successMessage).toBeVisible();
  });

  test('should show error when required fields are empty', async ({ registrationPage }) => {
    // Try to go to the next step without filling anything.
    // The app should show a validation error.
    await registrationPage.goto();
    await registrationPage.clickNext();

    await expect(registrationPage.errorMessage).toBeVisible();
  });

  test('should show password strength indicators', async ({ registrationPage }) => {
    // When the user types a password, the app shows indicators for
    // length, uppercase, and special characters. This test checks they work.
    await registrationPage.goto();

    await registrationPage.passwordInput.fill('Test@Pass123!');

    // All three indicators should show as valid
    await expect(registrationPage.passwordLengthIndicator).toHaveClass(/valid/);
    await expect(registrationPage.passwordUppercaseIndicator).toHaveClass(/valid/);
    await expect(registrationPage.passwordSpecialIndicator).toHaveClass(/valid/);
  });
});
