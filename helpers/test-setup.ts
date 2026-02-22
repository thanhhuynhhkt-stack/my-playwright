// This file sets up the page objects so every test can use them automatically.
// Instead of creating "new LoginPage(page)" in every single test,
// we do it once here, and then tests just use "loginPage" directly.
//
// Think of it like this: before each test, Playwright prepares these objects
// for you and hands them over. You just use them.
//
// loginAs is a special fixture for tests that need to be authenticated before
// they can test something else (e.g. profile, settings). It is NOT for login
// tests themselves — those test the login flow explicitly on purpose.

import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { ProfilePage } from '../pages/ProfilePage';
import { createHighTierUser, createMediumTierUser, createLowTierUser } from './test-users';
import { getMockOtp } from './mock-otp';

// This tells TypeScript what extra things our tests will have access to.
type Pages = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  profilePage: ProfilePage;
  loginAs: (tier: 'low' | 'medium' | 'high') => Promise<void>;
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

  // loginAs logs in as the given user tier and returns control to the test.
  // Use this in any test that requires authentication but is not testing login itself.
  // Example: await loginAs('high')
  loginAs: async ({ loginPage }, use) => {
    await use(async (tier: 'low' | 'medium' | 'high') => {
      const user = tier === 'high' ? createHighTierUser()
                 : tier === 'medium' ? createMediumTierUser()
                 : createLowTierUser();
      await loginPage.goto();
      await loginPage.login(user.username, user.password);
      await loginPage.enterOtp(getMockOtp());
    });
  },
});

export { expect } from '@playwright/test';
