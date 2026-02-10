# Playwright Test Automation Framework

Production-grade Playwright + TypeScript test automation framework built on extensibility principles.

## Quick Start

```bash
# Install dependencies
npm install

# Install browsers
npx playwright install

# Copy and configure environment
cp .env.example .env

# Run all tests
npm test

# Run specific browser
npm run test:chrome
npm run test:firefox
npm run test:safari
npm run test:edge

# Run by tag
npm run test:smoke
npm run test:regression

# View report
npm run report
```

## Architecture Overview

```
src/
├── config/          # Environment, browser, and test configuration
├── data/            # Group configs (source of truth), types, test data factory
├── pages/           # Page Object Model — group-agnostic UI interactions
├── flows/           # Flow engine + step-based orchestration
├── services/        # Pluggable external service abstractions
├── fixtures/        # Playwright fixture injection (DI layer)
├── api/             # API clients for setup/teardown
├── mocks/           # Route-based API mocking
└── utils/           # Logger, reporter, screenshot, wait, retry helpers

tests/               # Test specs organized by feature
scripts/             # Setup and cleanup scripts
reports/             # Generated reports (gitignored)
```

## How To: Add a New User Group

Adding a new user group requires **zero changes** to existing framework code.

### Step 1: Add the group config

Edit `src/data/group-config.ts`:

```typescript
export const GROUP_CONFIGS: Record<string, GroupConfig> = {
  // ... existing groups ...

  premium: {
    groupId: 'premium',
    displayName: 'Premium Tier',
    verificationStrategy: 'authenticator-app',
    registrationSteps: [
      'personal-info',
      'email-verification',
      'identity-verification',
      'authenticator-setup',
      'terms-acceptance',
      'approval-wait',
      'profile-setup',
      'welcome',
    ],
    requiresApproval: true,
    profileLayout: 'full',
    tags: ['@premium-tier', '@regression'],
  },
};
```

### Step 2: That's it

All data-driven test specs automatically pick up the new group. The flow engine reads the step sequence from the config and executes the registered steps.

If the new group introduces a **new step type** not yet in the registry:
1. Add the step type to `StepType` in `src/data/types.ts`
2. Create a step class in `src/flows/steps/`
3. Register it in `src/flows/StepRegistry.ts`

## How To: Add a New Feature

### Step 1: Create the page object

```typescript
// src/pages/TransactionPage.ts
import { BasePage } from './BasePage';

export class TransactionPage extends BasePage {
  protected readonly path = '/transactions';

  // Define selectors as locator getters
  private get searchInput() { return this.page.locator('[data-testid="txn-search"]'); }
  private get filterDropdown() { return this.page.locator('[data-testid="txn-filter"]'); }

  // Implement interaction methods
  async search(query: string) { await this.fill(this.searchInput, query); }
  async filterByStatus(status: string) { await this.selectOption(this.filterDropdown, status); }
}
```

### Step 2: Add to fixtures (if used across tests)

Edit `src/fixtures/test.fixture.ts`:

```typescript
import { TransactionPage } from '../pages/TransactionPage';

export interface FrameworkFixtures {
  // ... existing fixtures ...
  transactionPage: TransactionPage;
}

export const test = base.extend<FrameworkFixtures>({
  // ... existing fixtures ...
  transactionPage: async ({ page, logger }, use) => {
    await use(new TransactionPage(page, logger));
  },
});
```

### Step 3: Create the test spec

```typescript
// tests/transactions/transactions.spec.ts
import { test, expect } from '../../src/fixtures/test.fixture';

test.describe('Transactions @regression', () => {
  test('filters by status', async ({ transactionPage }) => {
    await transactionPage.navigate();
    await transactionPage.filterByStatus('completed');
    // assertions...
  });
});
```

## How To: Add a New External Service

### Step 1: Define the interface

```typescript
// src/services/interfaces/SmsService.ts
export interface SmsService {
  fetchLatestOTP(phoneNumber: string): Promise<OtpResult>;
  clearInbox(phoneNumber: string): Promise<void>;
}
```

### Step 2: Create implementation(s)

```typescript
// src/services/implementations/MockSmsService.ts
export class MockSmsService implements SmsService {
  async fetchLatestOTP(phoneNumber: string): Promise<OtpResult> {
    return { code: '123456' };
  }
  async clearInbox(phoneNumber: string): Promise<void> {}
}
```

### Step 3: Register in ServiceFactory

```typescript
// src/services/ServiceFactory.ts
createSmsService(): SmsService {
  switch (this.config.smsService) {
    case 'twilio': return new TwilioSmsService(...);
    default: return new MockSmsService();
  }
}
```

### Step 4: Wire into fixtures

```typescript
// src/fixtures/test.fixture.ts
smsService: async ({}, use) => {
  const factory = new ServiceFactory();
  await use(factory.createSmsService());
},
```

## Key Design Patterns

| Pattern | Usage |
|---------|-------|
| **Strategy/Step Engine** | Registration flows vary by group — step sequence is config-driven |
| **Pluggable Services** | Email, authenticator, approval abstracted behind interfaces |
| **Data-Driven Tests** | Test specs generated from group config — one file covers all groups |
| **Fixture-Based DI** | All dependencies injected via Playwright fixtures, no singletons |
| **Page Object Model** | UI interactions encapsulated in page classes, group-agnostic |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | Application base URL |
| `API_BASE_URL` | `http://localhost:3000/api` | API base URL |
| `BROWSER` | (all) | Target browser: `chromium`, `firefox`, `webkit`, `edge` |
| `EMAIL_SERVICE` | `mock` | Email provider: `mock` or `mailosaur` |
| `AUTHENTICATOR_SERVICE` | `mock` | Authenticator provider |
| `LOG_LEVEL` | `info` | Logging level: `debug`, `info`, `warn`, `error` |
| `CI` | `false` | CI mode (enables retries, limits workers) |
