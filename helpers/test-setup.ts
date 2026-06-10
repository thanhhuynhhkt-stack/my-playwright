// This file sets up the page objects so every test can use them automatically.
// Instead of creating "new LoginPage(page)" in every single test,
// we do it once here, and then tests just use "loginPage" directly.

import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { ProfilePage } from '../pages/ProfilePage';

type Pages = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  profilePage: ProfilePage;
};

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
