/**
 * Test data setup script.
 * Seeds the application with test data before a test run.
 * Run via: npm run setup
 *
 * This script:
 * 1. Creates test users for each configured group
 * 2. Seeds transaction data
 * 3. Configures any system states needed for testing
 */

import { request } from '@playwright/test';
import { loadEnvConfig } from '../src/config/env.config';
import { getAllGroupConfigs } from '../src/data/group-config';
import { TestDataFactory } from '../src/data/TestDataFactory';

async function setupTestData(): Promise<void> {
  const config = loadEnvConfig();
  const factory = new TestDataFactory();

  console.log('========== Setting up test data ==========');
  console.log(`Target: ${config.apiBaseUrl}`);

  const context = await request.newContext({
    baseURL: config.apiBaseUrl,
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  });

  try {
    // Create test users for each group
    for (const groupConfig of getAllGroupConfigs()) {
      const user = factory.createTestUser(groupConfig.groupId);
      console.log(`Creating user: ${user.username} (${groupConfig.displayName})`);

      try {
        await context.post('/users', { data: user });
        console.log(`  -> Created successfully`);
      } catch (error) {
        console.warn(`  -> Failed (may already exist): ${error}`);
      }
    }

    // Seed transaction data
    const transactions = factory.createTransactions(50);
    console.log(`Seeding ${transactions.length} transactions...`);
    try {
      await context.post('/test-data/transactions', { data: { transactions } });
      console.log('  -> Transactions seeded');
    } catch (error) {
      console.warn(`  -> Failed: ${error}`);
    }

    // Ensure maintenance mode is off
    try {
      await context.post('/admin/maintenance', {
        data: { enabled: false, message: '' },
      });
      console.log('Maintenance mode: disabled');
    } catch (error) {
      console.warn(`  -> Could not disable maintenance mode: ${error}`);
    }

    console.log('========== Setup complete ==========');
  } finally {
    await context.dispose();
  }
}

setupTestData().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
