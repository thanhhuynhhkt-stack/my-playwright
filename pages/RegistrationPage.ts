// Registration page object.
// Covers the full registration flow: Singpass retrieval → mobile → password → terms → done.
// Works for Group 1, Group 2, and Group 3 — all groups share the same steps,
// only the test user data (Singpass username, mobile, password) differs per group.

import { Page, Locator, test } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;
  private readonly baseUrl: string;
  private readonly registerUrl: string;
  readonly landingUrl: string;

  constructor(page: Page) {
    this.page = page;
    if (!process.env.BASE_URL) {
      throw new Error(
        'BASE_URL is not set.'
      );
    }
    this.baseUrl = process.env.BASE_URL.replace(/\/$/, '');
    this.registerUrl = `${this.baseUrl}/fe/authentication/register-information`;
    this.landingUrl = `${this.baseUrl}/fe/authentication/landing`;
  }

  // -- Locators --

  get retrieveMyInfoButton(): Locator {
    // Button contains only an <img alt=""> so no text-based selector works;
    // target it via the image's src attribute instead.
    return this.page.locator('button:has(img[src*="retrieve-myinfo"])');
  }

  // Group 2: company email input on the Complete Profile page.
  // Uses getByRole so it works regardless of the exact placeholder text.
  get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: /email/i });
  }

  get mobileInput(): Locator {
    return this.page.getByPlaceholder('0000 0000');
  }

  // Used on both the "Complete profile" (mobile) step and the "Set password" step.
  get continueButton(): Locator {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  // Group 2: "Verify email" button in the Identity verification popup
  get verifyEmailButton(): Locator {
    return this.page.getByRole('button', { name: 'Verify email' });
  }

  // Group 2: OTP input on "Enter OTP to verify email" screen.
  // The app may render 6 individual digit boxes — if so, target the first
  // and use pressSequentially to tab through, or adjust to fill each box.
  get otpInput(): Locator {
    return this.page.locator('input[type="text"], input[type="number"]').first();
  }

  // From the "Set password" page: placeholders are "New password" / "Re-enter password"
  get newPasswordInput(): Locator {
    return this.page.getByPlaceholder('New password');
  }

  get confirmPasswordInput(): Locator {
    return this.page.getByPlaceholder('Re-enter password');
  }

  get termsCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: /Terms & Conditions/i });
  }

  get createAccountButton(): Locator {
    return this.page.getByRole('button', { name: 'Create account' });
  }

  // Text is matched as-is from the actual success screen
  get successMessage(): Locator {
    return this.page.getByText('Changi Identity account created successfully!');
  }

  // "Log in" button on the Account Information page — triggers SSO via Microsoft
  get changiLoginButton(): Locator {
    return this.page.locator('.cag-login-button');
  }

  get doneButton(): Locator {
    return this.page.getByRole('button', { name: 'Done' });
  }

  // -- Actions --

  async goto() {
    await test.step('Navigate to registration page', async () => {
      await this.page.goto(this.registerUrl);
    });
  }

  async clickChangiLogin() {
    await test.step('Click Log in with Changi on Account Information page', async () => {
      await this.changiLoginButton.click();
    });
  }

  async clickRetrieveMyInfo() {
    await test.step('Click Retrieve MyInfo with Singpass', async () => {
      await this.retrieveMyInfoButton.click();
    });
  }

  async enterEmail(email: string) {
    await test.step(`Enter company email: ${email}`, async () => {
      await this.emailInput.waitFor({ state: 'visible', timeout: 15_000 });
      await this.emailInput.click();
      await this.emailInput.pressSequentially(email, { delay: 50 });
    });
  }

  async enterMobile(mobile: string) {
    await test.step(`Enter company mobile: ${mobile}`, async () => {
      // Wait for the "Company information" heading to confirm the Angular component
      // has fully initialized its OAuth session before interacting with the form.
      await this.page.getByRole('heading', { name: 'Company information' }).waitFor({ state: 'visible', timeout: 15_000 });
      // Use pressSequentially to trigger keydown/keyup events that Angular reactive
      // forms need for proper two-way binding (fill() alone may not trigger validators).
      await this.mobileInput.click();
      await this.mobileInput.pressSequentially(mobile, { delay: 50 });
    });
  }

  async clickVerifyEmail() {
    await test.step('Click Verify email', async () => {
      await this.verifyEmailButton.waitFor({ state: 'visible', timeout: 10_000 });
      await this.verifyEmailButton.click();
    });
  }

  async enterOtp(otp: string) {
    await test.step(`Enter OTP: ${otp}`, async () => {
      await this.otpInput.waitFor({ state: 'visible', timeout: 10_000 });
      await this.otpInput.pressSequentially(otp, { delay: 80 });
    });
  }

  async clickContinue() {
    await test.step('Click Continue', async () => {
      await this.continueButton.click();
    });
  }

  async enterPasswords(password: string) {
    await test.step('Enter new password and confirm password', async () => {
      await this.newPasswordInput.fill(password);
      await this.confirmPasswordInput.fill(password);
    });
  }

  async acceptTermsAndCreate() {
    await test.step('Scroll down, check Terms & Conditions, click Create account', async () => {
      await this.termsCheckbox.scrollIntoViewIfNeeded();
      await this.termsCheckbox.check();
      await this.createAccountButton.click();
    });
  }

  async clickDone() {
    await test.step('Click Done', async () => {
      await this.doneButton.click();
    });
  }
}
