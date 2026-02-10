/**
 * Identity verification step.
 * In real environments, this requires a 3rd party mobile app.
 * The framework mocks this interaction — the step is a placeholder
 * that can be replaced with API-based verification in CI.
 */

import { Step } from './Step';
import { FlowContext } from '../FlowContext';
import { StepType } from '../../data/types';

export class IdentityVerificationStep implements Step {
  readonly type: StepType = 'identity-verification';
  readonly description = 'Complete identity verification';

  async execute(context: FlowContext): Promise<void> {
    context.logger.info(`Step: ${this.description}`);

    // In a real scenario, this would:
    // 1. Trigger the identity verification request from the UI
    // 2. Use an API or mock to simulate the 3rd party app response
    // 3. Wait for the UI to update with verification success

    // For now, we simulate via the page interaction
    const verifyButton = context.page.locator('[data-testid="reg-identity-verify"]');
    if (await verifyButton.isVisible()) {
      await verifyButton.click();
    }

    context.logger.info('Identity verification completed (mocked)');
    context.set('identityVerified', true);
  }
}
