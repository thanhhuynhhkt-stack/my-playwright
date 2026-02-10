/**
 * Test data cleanup script.
 * Removes test data after a test run to leave the environment clean.
 * Run via: npm run cleanup
 */

import { request } from '@playwright/test';
import { loadEnvConfig } from '../src/config/env.config';

async function cleanupTestData(): Promise<void> {
  const config = loadEnvConfig();

  console.log('========== Cleaning up test data ==========');
  console.log(`Target: ${config.apiBaseUrl}`);

  const context = await request.newContext({
    baseURL: config.apiBaseUrl,
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  });

  try {
    // Delete all test users (those matching the test username pattern)
    console.log('Deleting test users...');
    try {
      await context.delete('/test-data/users?pattern=testuser_*');
      console.log('  -> Test users deleted');
    } catch (error) {
      console.warn(`  -> Failed: ${error}`);
    }

    // Delete seeded transactions
    console.log('Deleting test transactions...');
    try {
      await context.delete('/test-data/transactions');
      console.log('  -> Test transactions deleted');
    } catch (error) {
      console.warn(`  -> Failed: ${error}`);
    }

    // Reset maintenance mode
    try {
      await context.post('/admin/maintenance', {
        data: { enabled: false, message: '' },
      });
      console.log('Maintenance mode: reset');
    } catch (error) {
      console.warn(`  -> Could not reset maintenance mode: ${error}`);
    }

    console.log('========== Cleanup complete ==========');
  } finally {
    await context.dispose();
  }
}

cleanupTestData().catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
