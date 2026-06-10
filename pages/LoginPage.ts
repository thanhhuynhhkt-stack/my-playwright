// Login page object.
// Each method maps to something you would do manually on the login screen.
// If the app adds a new element to the login page, just add a new locator and method here.

import { Page, Locator, expect, test } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // -- Locators --
  // These match the data-testid attributes in the app HTML.
  // If a selector changes in the app, you only fix it here, not in every test.

  get loginB2bOIDCButton(): Locator {
    return this.page.getByRole('button', { name: 'OIDC login' })
  }

  get registerButton(): Locator {
    return this.page.getByRole('button',{name:'Register'});
  }

  get passwordLoginTab(): Locator {
    return this.page.getByRole('link', { name: 'Password log in' })
  }

  get usernameInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Company Email' })
  }

  get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' })
  }

  get hidePassIcon(): Locator {
    return this.page.locator('#AuthUidPwDialog').getByRole('button')
  }

  get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Log in' })
  }

  get forgotPasswordLink(): Locator {
    return this.page.getByRole('link', { name: 'Forgot password?' })
  }
  get otpPageText(): Locator{
    return this.page.getByText('Please enter the security code which has been sent to your email.')
  }

  get otpCode1(): Locator {
      return this.page.locator('input[name="otpCode1"]')
    }
 
  get otpCode2(): Locator {
    return this.page.locator('input[name="otpCode2"]')
  }

  get otpCode3(): Locator {
    return this.page.locator('input[name="otpCode3"]')
  }

  get otpCode4(): Locator {
    return this.page.locator('input[name="otpCode4"]')
  }

  get otpCode5(): Locator {
    return this.page.locator('input[name="otpCode5"]')
  }

  get otpCode6(): Locator {
    return this.page.locator('input[name="otpCode6"]')
  }

  get otpContinueButton(): Locator {
    return this.page.getByRole('button', { name: 'Continue' })
  }

  get loginSuccessMessage(): Locator {
    return this.page.getByText('You have successfully logged in.')
  }

  get backToHomeButton(): Locator {
    return this.page.getByRole('button', { name: 'Back to Home' })
  }

  get logOutButton(): Locator {
    return this.page.getByRole('button', { name: 'Logout' })
  }

  get failLoginMessage(): Locator {
    return this.page.getByText('Please check your input.')
  }

  // -- Actions --
  // These are the things you actually do on the page, written in plain language.

  async goto() {
    await test.step('Navigate to login page', async () => {
      await this.page.goto('/');
    });
  }

  async login(username: string, password: string) {
    await test.step(`Login with username "${username}"`, async () => {
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
    });
  }

  async enterOtp(code: string) {
    await test.step('Enter OTP code', async () => {
      const otpFields = [this.otpCode1, this.otpCode2, this.otpCode3, this.otpCode4, this.otpCode5, this.otpCode6];
      for (const field of otpFields) {
        await field.click();
        await field.pressSequentially(code);
      }
      await this.otpContinueButton.click();
    });
  }

  async logout() {
    await test.step('Logout', async () => {
      await this.logOutButton.click();
    });
  }
}
