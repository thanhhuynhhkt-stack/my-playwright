// Registration page object.
// This page has a multi-step form. Each method matches one thing you would do
// as a manual tester filling out the registration form.

import { Page, Locator } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // -- Locators --

  get firstNameInput(): Locator {
    return this.page.locator('[data-testid="reg-first-name"]');
  }

  get lastNameInput(): Locator {
    return this.page.locator('[data-testid="reg-last-name"]');
  }

  get emailInput(): Locator {
    return this.page.locator('[data-testid="reg-email"]');
  }

  get passwordInput(): Locator {
    return this.page.locator('[data-testid="reg-password"]');
  }

  get confirmPasswordInput(): Locator {
    return this.page.locator('[data-testid="reg-confirm-password"]');
  }

  get nextButton(): Locator {
    return this.page.locator('[data-testid="reg-next"]');
  }

  get submitButton(): Locator {
    return this.page.locator('[data-testid="reg-submit"]');
  }

  get otpInput(): Locator {
    return this.page.locator('[data-testid="reg-otp"]');
  }

  get verifyOtpButton(): Locator {
    return this.page.locator('[data-testid="reg-verify-otp"]');
  }

  get termsCheckbox(): Locator {
    return this.page.locator('[data-testid="reg-terms-checkbox"]');
  }

  get stepIndicator(): Locator {
    return this.page.locator('[data-testid="reg-step-indicator"]');
  }

  get successMessage(): Locator {
    return this.page.locator('[data-testid="reg-success"]');
  }

  get errorMessage(): Locator {
    return this.page.locator('[data-testid="reg-error"]');
  }

  // Password strength indicators
  get passwordLengthIndicator(): Locator {
    return this.page.locator('[data-testid="pwd-length"]');
  }

  get passwordUppercaseIndicator(): Locator {
    return this.page.locator('[data-testid="pwd-uppercase"]');
  }

  get passwordSpecialIndicator(): Locator {
    return this.page.locator('[data-testid="pwd-special"]');
  }

  // -- Actions --

  async goto() {
    await this.page.goto('/register');
  }

  async fillPersonalInfo(firstName: string, lastName: string, email: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async enterOtp(code: string) {
    await this.otpInput.fill(code);
    await this.verifyOtpButton.click();
  }

  async acceptTerms() {
    await this.termsCheckbox.check();
  }

  async submit() {
    await this.submitButton.click();
  }
}
