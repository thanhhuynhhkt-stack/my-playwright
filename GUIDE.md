# Guide: How This Project Works

This is a test automation project using Playwright and TypeScript. It was built to be
simple enough that anyone from a manual testing background can understand it, modify it,
and add new tests without needing deep programming knowledge.

If you have been doing manual QC testing and want to move into automation, this project
is meant to be your starting point. Everything is written in plain language with comments
that explain the "why" not just the "what".


## Why we simplified this project

The previous version of this project was built with enterprise software patterns:
dependency injection, strategy pattern, abstract classes, service factories, a flow
engine with step registries, and config-driven test generation. That is great if your
team is full of experienced automation engineers, but for a QC team learning automation
it creates more problems than it solves.

Here is what was wrong with the old approach:

- You could not open a test file and understand what it does. The test just called
  `flowEngine.executeFlow(context)` which is a black box. You had to dig through
  5 different files to understand what steps actually happen.

- Adding a simple test required understanding design patterns like Strategy, Factory,
  and Dependency Injection. That is a lot to ask from someone who just wants to write
  "fill in the username, click login, check the error message".

- There were 30+ source files across 10+ directories. Finding where things live was
  hard even for experienced developers.

- The config-driven test generation was clever (one file auto-generates tests for all
  user groups) but it meant you could not see your test cases listed out explicitly.
  Manual testers think in test cases, not in config objects.

So we rewrote it with one principle: you should be able to read a test file from top
to bottom and know exactly what it does, like reading a manual test case checklist.


## Project structure

Here is everything in the project:

```
my-playwright/
  pages/                  -- Page objects (one per page in your app)
    LoginPage.ts
    RegistrationPage.ts
    ProfilePage.ts
  helpers/                -- Small helper files
    test-setup.ts         -- Sets up page objects for all tests
    test-users.ts         -- Test user data (fake users for testing)
    mock-otp.ts           -- Fake OTP code for tests
  tests/                  -- The actual test files
    login/
      login.spec.ts       -- All login tests
    registration/
      registration-low.spec.ts     -- Low tier registration tests
      registration-medium.spec.ts  -- Medium tier registration tests
      registration-high.spec.ts    -- High tier registration tests
    profile/
      profile.spec.ts     -- Profile page tests
  playwright.config.ts    -- Playwright settings (browsers, timeouts, etc)
  package.json            -- Project dependencies and scripts
  tsconfig.json           -- TypeScript settings
  .env.example            -- Environment variables template
```

That is it. No hidden layers, no abstract factories, no flow engines.


## How to read a test file

Open any test file, for example `tests/login/login.spec.ts`. You will see something like:

```typescript
test('should log in with username, password, and OTP', async ({ loginPage, page }) => {
  const user = createLowTierUser();

  await loginPage.goto();
  await loginPage.login(user.username, user.password);

  await expect(loginPage.otpStep).toBeVisible();

  const otpCode = getMockOtp();
  await loginPage.enterOtp(otpCode);

  await expect(page).not.toHaveURL(/\/login/);
});
```

Read it line by line:
1. Create a test user
2. Go to the login page
3. Enter username and password, click login
4. Check that the OTP step appears
5. Enter the OTP code
6. Check that we are no longer on the login page (meaning login worked)

That is it. No magic, no hidden steps. Every action is visible right there in the test.


## How to read a page object

Open `pages/LoginPage.ts`. A page object is just a class that holds all the elements
and actions for one page in the app. Think of it as a map of the page.

The locators section tells Playwright how to find each element:

```typescript
get usernameInput(): Locator {
  return this.page.locator('[data-testid="login-username"]');
}
```

The actions section provides methods that do things on the page:

```typescript
async login(username: string, password: string) {
  await this.usernameInput.fill(username);
  await this.passwordInput.fill(password);
  await this.loginButton.click();
}
```

Why do we use page objects instead of writing selectors directly in tests?
Because if the app changes a button from `data-testid="login-submit"` to
`data-testid="btn-login"`, you only fix it in one place (the page object),
not in every single test that clicks that button.


## How to add a new test

Say you want to add a test that checks the "forgot password" link on the login page.

1. Open `tests/login/login.spec.ts`
2. Add a new test block inside the describe:

```typescript
test('should show forgot password page', async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.forgotPasswordLink.click();
  await expect(page).toHaveURL(/\/forgot-password/);
});
```

3. If `forgotPasswordLink` does not exist yet in `LoginPage.ts`, add it:

```typescript
get forgotPasswordLink(): Locator {
  return this.page.locator('[data-testid="login-forgot-password"]');
}
```

That is all. Two changes, and your new test is ready.


## How to add a new page object

If the app has a page that does not have a page object yet (for example, a Settings page):

1. Create `pages/SettingsPage.ts`:

```typescript
import { Page, Locator } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get languageDropdown(): Locator {
    return this.page.locator('[data-testid="settings-language"]');
  }

  async goto() {
    await this.page.goto('/settings');
  }

  async changeLanguage(language: string) {
    await this.languageDropdown.selectOption(language);
  }
}
```

2. Add it to `helpers/test-setup.ts`:

```typescript
import { SettingsPage } from '../pages/SettingsPage';

type Pages = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  profilePage: ProfilePage;
  settingsPage: SettingsPage;  // add this
};

export const test = base.extend<Pages>({
  // ... existing page objects ...
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
});
```

3. Now you can use `settingsPage` in any test file.


## How to run tests

```bash
# Install everything (first time only)
npm install
npx playwright install

# Copy the env file and edit it with your app URL
cp .env.example .env

# Run all tests
npm test

# Run on one browser only (faster for development)
npm run test:chrome

# Run only the smoke tests (the most important ones)
npm run test:smoke

# Run all regression tests
npm run test:regression

# Run tests with browser visible (so you can watch what happens)
npm run test:headed

# Open the HTML report after a test run
npm run report
```


## Tags explained

You will see tags like `@smoke` and `@regression` in the test names. These let you run
a subset of tests.

- `@smoke` -- The most critical tests. Run these first. If smoke tests fail, something
  is seriously broken.
- `@regression` -- All tests including less critical ones. Run these before a release
  to make sure nothing is broken.
- `@low-tier`, `@medium-tier`, `@high-tier` -- Tests specific to a user tier.

You can filter by tag when running tests:

```bash
# Run only smoke tests
npm run test:smoke

# Run only high tier tests
npx playwright test --grep @high-tier
```


## Tips for manual testers learning automation

1. Start by reading the existing tests. Do not try to write code from scratch.
   Copy an existing test and modify it for your new scenario.

2. Use the Playwright VS Code extension. It lets you record actions in the browser
   and generates test code for you. Then clean it up using page objects.

3. When something fails, run with `--headed` to watch what happens:
   `npx playwright test --headed --grep "your test name"`

4. The HTML report (`npm run report`) shows screenshots of failures. Use them.

5. You do not need to understand TypeScript deeply. The patterns used here are simple:
   `await something.click()`, `await expect(something).toBeVisible()`. That is 90%
   of what you will write.

6. If you are not sure what selector to use, open the app in Chrome, right-click
   the element, click Inspect, and look for the `data-testid` attribute.


## What we removed and why

Here is what was in the old project and why we took it out:

| What was removed | Why |
|---|---|
| Flow Engine (FlowEngine, FlowContext, StepRegistry) | Tests should show every step explicitly. A flow engine hides what the test actually does. |
| Service interfaces and factory (EmailService interface, ServiceFactory, etc) | We replaced this with one simple function that returns a mock OTP. No need for interfaces when you only have one implementation. |
| Abstract BasePage class | Page objects are simpler without inheritance. Each page just has `page` and its own locators. |
| Custom Logger with per-worker buffering | Playwright has built-in logging and traces. console.log is fine for debugging. |
| Custom Reporter | The built-in HTML and JSON reporters do the job. |
| ScreenshotHelper | Playwright config already has `screenshot: 'only-on-failure'`. No custom code needed. |
| WaitHelper and RetryHelper | Playwright auto-waits for elements. You rarely need manual polling. |
| Config-driven test generation (looping over GROUP_CONFIGS) | We wrote separate test files for each tier. More files but each one is instantly readable. |
| API clients (ApiClient, AuthApi, MaintenanceApi) | Not needed for UI tests. If you need API tests later, add them as separate files. |
| Setup and cleanup scripts | Removed to reduce complexity. If your app needs test data setup, add a simple script when you need it. |
| Path aliases (@config/*, @pages/*, etc) | Simple relative imports are easier to understand. |
| ts-node, winston, eslint, prettier dependencies | Removed unused or optional dependencies. You can add linting later if you want. |

The goal was to go from "I need to understand 10 concepts to write a test" to
"I need to understand 2 concepts: page objects and test blocks".
