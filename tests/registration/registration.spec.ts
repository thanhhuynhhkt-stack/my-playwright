/**
 * Registration flow test spec.
 * Demonstrates the DATA-DRIVEN test generation pattern:
 * - One spec file dynamically creates tests for ALL groups
 * - Adding a new group in group-config.ts automatically creates new tests here
 * - No per-group test files needed
 *
 * Tags are derived from the group config for filtering (@smoke, @regression, etc.)
 */

import { test, expect } from '../../src/fixtures/test.fixture';
import { GROUP_CONFIGS, getGroupConfig } from '../../src/data/group-config';
import { FlowContext, FlowContextDependencies } from '../../src/flows/FlowContext';

// Dynamically generate tests for every configured group
for (const [groupId, config] of Object.entries(GROUP_CONFIGS)) {
  test.describe(`Registration: ${config.displayName} ${config.tags.join(' ')}`, () => {
    test(`completes full registration flow for ${config.displayName}`, async ({
      page,
      logger,
      testDataFactory,
      emailService,
      authenticatorService,
      approvalService,
      flowEngine,
    }) => {
      // Create a unique test user for this group
      const user = testDataFactory.createTestUser(groupId);

      // Build the flow context with all dependencies
      const deps: FlowContextDependencies = {
        page,
        logger,
        emailService,
        authenticatorService,
        approvalService,
      };
      const context = new FlowContext(user, config, deps);

      // Navigate to registration
      await page.goto('/register');

      // Execute the full registration flow for this group
      // The FlowEngine reads the steps from the group config and runs them in order
      await flowEngine.executeFlow(config, context);
    });

    test(`validates required fields for ${config.displayName}`, async ({
      page,
      registrationPage,
    }) => {
      await registrationPage.navigate();

      // Try to submit without filling any fields
      await registrationPage.clickNext();

      // Verify validation error appears
      const errorMessage = await registrationPage.getErrorMessage();
      expect(errorMessage).toBeTruthy();
    });

    // Only test approval flow for groups that require it
    if (config.requiresApproval) {
      test(`handles approval workflow for ${config.displayName}`, async ({
        page,
        logger,
        testDataFactory,
        emailService,
        authenticatorService,
        approvalService,
        flowEngine,
      }) => {
        const user = testDataFactory.createTestUser(groupId);
        const deps: FlowContextDependencies = {
          page,
          logger,
          emailService,
          authenticatorService,
          approvalService,
        };
        const context = new FlowContext(user, config, deps);

        await page.goto('/register');

        // Run only up to the approval step
        await flowEngine.executeFlow(config, context, [
          'personal-info',
          'email-verification',
          'identity-verification',
          'authenticator-setup',
          'terms-acceptance',
          'approval-wait',
        ]);
      });
    }
  });
}
