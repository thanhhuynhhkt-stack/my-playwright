import { Page, Locator, test } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  private readonly baseUrl: string;
  readonly landingUrl: string;
  readonly profileUrl: string;

  constructor(page: Page) {
    this.page = page;
    if (!process.env.BASE_URL) throw new Error('BASE_URL is not set.');
    this.baseUrl = process.env.BASE_URL.replace(/\/$/, '');
    this.landingUrl = `${this.baseUrl}/fe/authentication/landing`;
    this.profileUrl = `${this.baseUrl}/fe/account-settings/profile`;
  }

  // -- Locators --

  get loginWithChangiIdentityButton(): Locator {
    return this.page.getByRole('button', { name: /log in with changi identity/i });
  }

  get passwordLoginTab(): Locator {
    return this.page.getByText(/password\s+log\s*in/i);
  }

  get companyEmailInput(): Locator {
    return this.page.getByLabel(/company email/i);
  }

  get passwordInput(): Locator {
    return this.page.locator('[name="isiwebpasswd"]');
  }

  get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Log in' });
  }

  // Heading present only on the OTP entry screen — used to confirm we left the login form.
  get otpScreenHeading(): Locator {
    return this.page.getByText(/security code|one-time|enter.*code|otp/i).first();
  }

  // First digit box of the 6-box OTP input; keyboard.type() drives the rest via auto-advance.
  // Only reached after otpScreenHeading confirms we are on the OTP screen.
  get otpFirstBox(): Locator {
    return this.page.locator('input:not([type="hidden"])').first();
  }

  get continueButton(): Locator {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  get loginSuccessMessage(): Locator {
    return this.page.getByText('You have logged in successfully!');
  }

  get backToHomeButton(): Locator {
    return this.page.getByRole('button', { name: /back to home/i });
  }

  // -- Actions --

  async goto() {
    await test.step('Navigate to landing page', async () => {
      await this.page.goto(this.landingUrl);
    });
  }

  async clickLoginWithChangiIdentity() {
    await test.step('Click Login with Changi Identity', async () => {
      await this.loginWithChangiIdentityButton.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async clickPasswordLoginTab() {
    await test.step('Click Password login tab', async () => {
      await this.passwordLoginTab.click();
    });
  }

  async login(email: string, password: string) {
    await test.step(`Login with email "${email}"`, async () => {
      await this.companyEmailInput.click();
      await this.companyEmailInput.pressSequentially(email, { delay: 50 });
      await this.passwordInput.click();
      await this.passwordInput.pressSequentially(password, { delay: 50 });
      await this.loginButton.click();
    });
  }

  async enterOtp(otp: string) {
    await test.step(`Enter OTP: ${otp}`, async () => {
      await this.otpFirstBox.waitFor({ state: 'visible', timeout: 10_000 });
      await this.otpFirstBox.click();
      await this.page.keyboard.type(otp, { delay: 100 });
    });
  }

  async clickContinue() {
    await test.step('Click Continue', async () => {
      await this.continueButton.click();
    });
  }

  async clickBackToHome() {
    await test.step('Click Back to home', async () => {
      await this.backToHomeButton.click();
    });
  }
}
