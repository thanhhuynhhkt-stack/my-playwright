/**
 * Registration page object.
 * Handles the multi-step registration form UI interactions.
 * Group-agnostic — which steps appear is controlled by flow configuration.
 */

import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export class RegistrationPage extends BasePage {
  protected readonly path = '/register';

  constructor(page: Page, logger: Logger) {
    super(page, logger);
  }

  // --------------- Selectors ---------------

  private get firstNameInput(): Locator {
    return this.page.locator('[data-testid="reg-first-name"]');
  }

  private get lastNameInput(): Locator {
    return this.page.locator('[data-testid="reg-last-name"]');
  }

  private get emailInput(): Locator {
    return this.page.locator('[data-testid="reg-email"]');
  }

  private get passwordInput(): Locator {
    return this.page.locator('[data-testid="reg-password"]');
  }

  private get confirmPasswordInput(): Locator {
    return this.page.locator('[data-testid="reg-confirm-password"]');
  }

  private get nextButton(): Locator {
    return this.page.locator('[data-testid="reg-next"]');
  }

  private get submitButton(): Locator {
    return this.page.locator('[data-testid="reg-submit"]');
  }

  private get otpInput(): Locator {
    return this.page.locator('[data-testid="reg-otp"]');
  }

  private get verifyOtpButton(): Locator {
    return this.page.locator('[data-testid="reg-verify-otp"]');
  }

  private get termsCheckbox(): Locator {
    return this.page.locator('[data-testid="reg-terms-checkbox"]');
  }

  private get stepIndicator(): Locator {
    return this.page.locator('[data-testid="reg-step-indicator"]');
  }

  private get successMessage(): Locator {
    return this.page.locator('[data-testid="reg-success"]');
  }

  private get errorMessage(): Locator {
    return this.page.locator('[data-testid="reg-error"]');
  }

  // Password strength indicators
  private get passwordLengthIndicator(): Locator {
    return this.page.locator('[data-testid="pwd-length"]');
  }

  private get passwordUppercaseIndicator(): Locator {
    return this.page.locator('[data-testid="pwd-uppercase"]');
  }

  private get passwordSpecialIndicator(): Locator {
    return this.page.locator('[data-testid="pwd-special"]');
  }

  // --------------- Actions ---------------

  async fillPersonalInfo(data: {
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<void> {
    this.logger.info(`Filling personal info for: ${data.email}`);
    await this.fill(this.firstNameInput, data.firstName);
    await this.fill(this.lastNameInput, data.lastName);
    await this.fill(this.emailInput, data.email);
  }

  async fillPassword(password: string, confirmPassword?: string): Promise<void> {
    this.logger.info('Filling password fields');
    await this.fill(this.passwordInput, password);
    await this.fill(this.confirmPasswordInput, confirmPassword || password);
  }

  async clickNext(): Promise<void> {
    this.logger.info('Clicking next step');
    await this.click(this.nextButton, 'Next button');
  }

  async submitRegistration(): Promise<void> {
    this.logger.info('Submitting registration');
    await this.click(this.submitButton, 'Submit button');
  }

  async enterOtp(code: string): Promise<void> {
    this.logger.info('Entering registration OTP');
    await this.fill(this.otpInput, code);
    await this.click(this.verifyOtpButton, 'Verify OTP button');
  }

  async acceptTerms(): Promise<void> {
    this.logger.info('Accepting terms and conditions');
    await this.termsCheckbox.check();
  }

  // --------------- State Checks ---------------

  async getCurrentStep(): Promise<string> {
    return this.getText(this.stepIndicator);
  }

  async expectSuccessVisible(): Promise<void> {
    await this.expectVisible(this.successMessage);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  // --------------- Password Validation UI Checks ---------------

  async expectPasswordLengthValid(): Promise<void> {
    await this.expectHasClass(this.passwordLengthIndicator, 'valid');
  }

  async expectPasswordUppercaseValid(): Promise<void> {
    await this.expectHasClass(this.passwordUppercaseIndicator, 'valid');
  }

  async expectPasswordSpecialValid(): Promise<void> {
    await this.expectHasClass(this.passwordSpecialIndicator, 'valid');
  }
}
