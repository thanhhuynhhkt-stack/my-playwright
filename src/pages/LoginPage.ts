/**
 * Login page object.
 * Handles both username/password + OTP login and QR code login.
 * Group-agnostic — the login method selection is driven by flow steps.
 *
 * To add a new page object:
 * 1. Create a new file in src/pages/ extending BasePage
 * 2. Define selectors as private Locator getters
 * 3. Implement interaction methods (no business logic or group-specific behavior)
 */

import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export class LoginPage extends BasePage {
  protected readonly path = '/login';

  constructor(page: Page, logger: Logger) {
    super(page, logger);
  }

  // --------------- Selectors ---------------

  private get usernameInput(): Locator {
    return this.page.locator('[data-testid="login-username"]');
  }

  private get passwordInput(): Locator {
    return this.page.locator('[data-testid="login-password"]');
  }

  private get otpInput(): Locator {
    return this.page.locator('[data-testid="login-otp"]');
  }

  private get loginButton(): Locator {
    return this.page.locator('[data-testid="login-submit"]');
  }

  private get qrCodeLoginLink(): Locator {
    return this.page.locator('[data-testid="login-qr-link"]');
  }

  private get qrCodeImage(): Locator {
    return this.page.locator('[data-testid="login-qr-code"]');
  }

  private get errorMessage(): Locator {
    return this.page.locator('[data-testid="login-error"]');
  }

  private get otpStep(): Locator {
    return this.page.locator('[data-testid="login-otp-step"]');
  }

  // --------------- Actions ---------------

  async enterUsername(username: string): Promise<void> {
    this.logger.info(`Entering username: ${username}`);
    await this.fill(this.usernameInput, username);
  }

  async enterPassword(password: string): Promise<void> {
    this.logger.info('Entering password');
    await this.fill(this.passwordInput, password);
  }

  async submitCredentials(): Promise<void> {
    this.logger.info('Submitting login credentials');
    await this.click(this.loginButton, 'Login button');
  }

  async enterOtp(code: string): Promise<void> {
    this.logger.info('Entering OTP code');
    await this.fill(this.otpInput, code);
  }

  async loginWithCredentials(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.submitCredentials();
  }

  async switchToQrCodeLogin(): Promise<void> {
    this.logger.info('Switching to QR code login');
    await this.click(this.qrCodeLoginLink, 'QR code login link');
  }

  // --------------- Assertions / State Checks ---------------

  async isOtpStepVisible(): Promise<boolean> {
    return this.isVisible(this.otpStep);
  }

  async isQrCodeVisible(): Promise<boolean> {
    return this.isVisible(this.qrCodeImage);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  async expectErrorVisible(expectedText?: string): Promise<void> {
    await this.expectVisible(this.errorMessage);
    if (expectedText) {
      await this.expectText(this.errorMessage, expectedText);
    }
  }
}
