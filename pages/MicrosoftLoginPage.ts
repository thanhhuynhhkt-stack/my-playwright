// Microsoft Azure AD / Adnovum ADFS login page object.
//
// Full flow for a federated @adnovum.vn account:
//   1. Microsoft login page (sso_reload=true) — fill email, click Next
//   2. Intermediate "Taking you to your organization's sign-in page" — no action, auto-navigates
//   3. ADFS — email pre-filled, fill password, click Sign in
//   4. Microsoft "Stay signed in?" (login.microsoftonline.com/login.srf) — click No
//   5. Page redirects back to Web Application.

import { Page, Locator, test } from '@playwright/test';
import { getEnvConfig } from '../helpers/env';

export class MicrosoftLoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // -- Step 1: Microsoft login page --

  get emailInput(): Locator {
    return this.page.locator('input[name="loginfmt"]');
  }

  get msNextButton(): Locator {
    return this.page.locator('#idSIButton9');
  }

  // -- Step 3: ADFS page --
  // Email is pre-filled by the federation; only password needs to be entered.

  get adfsPasswordInput(): Locator {
    return this.page.locator('input[name="Password"], #passwordInput, input[placeholder="Password"]').first();
  }

  get adfsSignInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign in' });
  }

  // -- Step 4: Microsoft "Stay signed in?" prompt --
  // "No" button — keeps test sessions clean and avoids cached auth state between runs.

  get staySignedInNoButton(): Locator {
    return this.page.locator('#idBtn_Back');
  }

  // -- Actions --

  async login(username: string, password: string) {
    await test.step(`Sign in with corporate account: ${username}`, async () => {
      // Step 1: Fill email and click Next on Microsoft login
      // The email field may not appear immediately (page reloads via sso_reload loop) —
      // waitFor ensures it is visible before filling.
      await this.emailInput.waitFor({ state: 'visible', timeout: 30_000 });
      await this.emailInput.fill(username);
      await this.msNextButton.click();

      // Step 2: Intermediate "Taking you to your org's sign-in page" — no action needed.
      // Wait until the browser arrives at ADFS.
      await this.page.waitForURL(getEnvConfig().adfsHostPattern, { timeout: 30_000 });

      // Step 3: Fill password on ADFS and sign in.
      await this.adfsPasswordInput.fill(password);
      await this.adfsSignInButton.click();

      // Step 4: "Stay signed in?" always appears after ADFS auth returns to Microsoft.
      // Click No to avoid caching session state across test runs.
      await this.page.waitForURL(/login\.srf/, { timeout: 30_000 });
      await this.staySignedInNoButton.click();

      // Step 5: Wait for redirect back to Web Application.
      await this.page.waitForURL(getEnvConfig().appHostPattern, { timeout: 30_000 });
    });
  }
}
