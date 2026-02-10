/**
 * Factory for generating test data dynamically based on group configuration.
 * Produces unique test users, transactions, and other entities per test run
 * to ensure full test isolation.
 */

import { GroupConfig, TestUser, TransactionData } from './types';
import { getGroupConfig } from './group-config';

export class TestDataFactory {
  private readonly runId: string;

  constructor() {
    this.runId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /**
   * Creates a unique test user for the given group.
   * Each invocation produces a user with unique email/username.
   */
  createTestUser(groupId: string, overrides: Partial<TestUser> = {}): TestUser {
    const config = getGroupConfig(groupId);
    const uniqueId = this.generateUniqueId();

    return {
      username: `testuser_${config.groupId}_${uniqueId}`,
      password: 'Test@Pass123!',
      email: `testuser_${config.groupId}_${uniqueId}@test.example.com`,
      groupId: config.groupId,
      firstName: 'Test',
      lastName: `User_${uniqueId}`,
      ...overrides,
    };
  }

  /**
   * Creates test users for all configured groups.
   * Useful for cross-group test scenarios.
   */
  createTestUsersForAllGroups(overrides: Partial<TestUser> = {}): Record<string, TestUser> {
    const users: Record<string, TestUser> = {};
    const { getAllGroupIds } = require('./group-config');
    for (const groupId of getAllGroupIds()) {
      users[groupId] = this.createTestUser(groupId, overrides);
    }
    return users;
  }

  /**
   * Creates sample transaction data for testing data-heavy views.
   */
  createTransactions(count: number): TransactionData[] {
    const statuses: TransactionData['status'][] = ['completed', 'pending', 'failed'];
    const currencies = ['USD', 'EUR', 'GBP'];

    return Array.from({ length: count }, (_, i) => ({
      id: `txn_${this.runId}_${i}`,
      amount: Math.round(Math.random() * 10000) / 100,
      currency: currencies[i % currencies.length],
      date: new Date(Date.now() - i * 86400000).toISOString(),
      description: `Test transaction ${i + 1}`,
      status: statuses[i % statuses.length],
    }));
  }

  /**
   * Generates a unique ID for this factory instance.
   * Combines the run ID with an incrementing counter.
   */
  private counter = 0;
  private generateUniqueId(): string {
    this.counter++;
    return `${this.runId}_${this.counter}`;
  }
}
