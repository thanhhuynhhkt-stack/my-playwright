// This file sets up the page objects so every test can use them automatically.
// Instead of creating "new LoginPage(page)" in every single test,
// we do it once here, and then tests just use "loginPage" directly.
//
// Think of it like this: before each test, Playwright prepares these objects
// for you and hands them over. You just use them.

import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { ProfilePage } from '../pages/ProfilePage';

// This tells TypeScript what extra things our tests will have access to.
type Pages = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  profilePage: ProfilePage;
};

// We extend the default Playwright test with our page objects.
// Now every test automatically gets loginPage, registrationPage, and profilePage.
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
});

export { expect } from '@playwright/test';
