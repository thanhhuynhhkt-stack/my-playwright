/**
 * Test data provider fixture.
 * Wraps TestDataFactory and provides convenience methods
 * for creating test data tied to the current test's group context.
 */

import { test as base } from './test.fixture';
import { TestUser, GroupConfig, TransactionData } from '../data/types';
import { getGroupConfig, GROUP_CONFIGS } from '../data/group-config';
import { TestDataFactory } from '../data/TestDataFactory';

export interface DataFixtures {
  /** Creates a test user for a specific group */
  createUser: (groupId: string, overrides?: Partial<TestUser>) => TestUser;
  /** Creates test users for all configured groups */
  createUsersForAllGroups: () => Record<string, TestUser>;
  /** Creates sample transaction data */
  createTransactions: (count: number) => TransactionData[];
  /** Gets group config by ID */
  groupConfig: (groupId: string) => GroupConfig;
  /** All group configs */
  allGroupConfigs: Record<string, GroupConfig>;
}

export const test = base.extend<DataFixtures>({
  createUser: async ({ testDataFactory }, use) => {
    await use((groupId: string, overrides?: Partial<TestUser>) =>
      testDataFactory.createTestUser(groupId, overrides)
    );
  },

  createUsersForAllGroups: async ({ testDataFactory }, use) => {
    await use(() => testDataFactory.createTestUsersForAllGroups());
  },

  createTransactions: async ({ testDataFactory }, use) => {
    await use((count: number) => testDataFactory.createTransactions(count));
  },

  groupConfig: async ({}, use) => {
    await use((groupId: string) => getGroupConfig(groupId));
  },

  allGroupConfigs: async ({}, use) => {
    await use(GROUP_CONFIGS);
  },
});

export { expect } from './test.fixture';
