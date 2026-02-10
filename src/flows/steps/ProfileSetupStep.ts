/**
 * Profile setup step — completes the profile configuration during registration.
 * Used by groups that have a profile setup phase.
 */

import { Step } from './Step';
import { FlowContext } from '../FlowContext';
import { StepType } from '../../data/types';

export class ProfileSetupStep implements Step {
  readonly type: StepType = 'profile-setup';
  readonly description = 'Complete profile setup';

  async execute(context: FlowContext): Promise<void> {
    context.logger.info(`Step: ${this.description}`);

    // Fill any profile-specific fields
    const displayNameInput = context.page.locator('[data-testid="reg-display-name"]');
    if (await displayNameInput.isVisible()) {
      await displayNameInput.fill(`${context.user.firstName} ${context.user.lastName}`);
    }

    const nextButton = context.page.locator('[data-testid="reg-next"]');
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    context.logger.info('Profile setup completed');
  }
}
