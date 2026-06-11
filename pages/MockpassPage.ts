// Mockpass page object.
//
// Actual flow:
// 1. Click the Login button → opens the login modal
// 2. Select a username from the datalist

import { Page, Locator, test } from '@playwright/test';
import { getEnvConfig } from '../helpers/env';

export class MockpassPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // -- Locators --

  get loginButton(): Locator {
    // Two #loginModelbtn elements exist: first is mobile-only (hidden on desktop),
    // last is the always-visible desktop version.
    return this.page.locator('#loginModelbtn').last();
  }

  // -- Actions --

  async clickLogin() {
    await test.step('Click Login to open MockPass modal', async () => {
      await this.loginButton.click();
    });
  }

  async selectUsername(username: string) {
    await test.step(`Select MockPass username: ${username}`, async () => {
      const assertUrl = await this.page.evaluate((name: string) => {
        const option = Array.from(document.querySelectorAll<HTMLOptionElement>('#id-datalist option'))
          .find(o => o.value === name);
        return option ? option.getAttribute('data-asserturl') : null;
      }, username);

      if (!assertUrl) throw new Error(`MockPass username "${username}" not found in datalist`);
      await this.page.goto(assertUrl);
      await this.page.waitForURL(getEnvConfig().appHostPattern);
    });
  }
}
