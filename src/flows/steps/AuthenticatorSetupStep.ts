/**
 * Authenticator setup step — enrolls TOTP authenticator for high-security groups.
 * Uses the AuthenticatorService interface for mock/real implementation swapping.
 */

import { Step } from './Step';
import { FlowContext } from '../FlowContext';
import { StepType } from '../../data/types';

export class AuthenticatorSetupStep implements Step {
  readonly type: StepType = 'authenticator-setup';
  readonly description = 'Set up authenticator app';

  async execute(context: FlowContext): Promise<void> {
    context.logger.info(`Step: ${this.description}`);

    // Enroll authenticator via the service (bypasses QR code scanning)
    const enrollment = await context.authenticatorService.enroll(context.user.username);
    context.set('authenticatorSecret', enrollment.secret);
    context.set('backupCodes', enrollment.backupCodes);

    // Get a TOTP code to verify enrollment
    const otpResult = await context.authenticatorService.getCode(enrollment.secret);

    // Enter the code in the UI
    const codeInput = context.page.locator('[data-testid="reg-authenticator-code"]');
    if (await codeInput.isVisible()) {
      await codeInput.fill(otpResult.code);
      const verifyButton = context.page.locator('[data-testid="reg-authenticator-verify"]');
      await verifyButton.click();
    }

    context.logger.info('Authenticator setup completed');
  }
}
