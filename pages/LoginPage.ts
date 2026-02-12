// Login page object.
// Each method maps to something you would do manually on the login screen.
// If the app adds a new element to the login page, just add a new locator and method here.

import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // -- Locators --
  // These match the data-testid attributes in the app HTML.
  // If a selector changes in the app, you only fix it here, not in every test.

  get usernameInput(): Locator {
    return this.page.locator('[data-testid="login-username"]');
  }

  get passwordInput(): Locator {
    return this.page.locator('[data-testid="login-password"]');
  }

  get otpInput(): Locator {
    return this.page.locator('[data-testid="login-otp"]');
  }

  get loginButton(): Locator {
    return this.page.locator('[data-testid="login-submit"]');
  }

  get qrCodeLink(): Locator {
    return this.page.locator('[data-testid="login-qr-link"]');
  }

  get qrCodeImage(): Locator {
    return this.page.locator('[data-testid="login-qr-code"]');
  }

  get errorMessage(): Locator {
    return this.page.locator('[data-testid="login-error"]');
  }

  get otpStep(): Locator {
    return this.page.locator('[data-testid="login-otp-step"]');
  }

  // -- Actions --
  // These are the things you actually do on the page, written in plain language.

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async enterOtp(code: string) {
    await this.otpInput.fill(code);
  }

  async switchToQrCodeLogin() {
    await this.qrCodeLink.click();
  }
}
