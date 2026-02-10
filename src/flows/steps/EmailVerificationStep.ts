/**
 * Email verification step — retrieves OTP from email service and enters it.
 * Demonstrates the pluggable service pattern: uses EmailService interface,
 * not a specific implementation.
 */

import { Step } from './Step';
import { FlowContext } from '../FlowContext';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { StepType } from '../../data/types';

export class EmailVerificationStep implements Step {
  readonly type: StepType = 'email-verification';
  readonly description = 'Verify email address via OTP';

  async execute(context: FlowContext): Promise<void> {
    context.logger.info(`Step: ${this.description}`);

    // Fetch OTP from the pluggable email service
    const otpResult = await context.emailService.fetchLatestOTP(context.user.email);
    context.set('otpCode', otpResult.code);

    context.logger.info(`OTP retrieved for ${context.user.email}`);

    // Enter OTP in the registration form
    const registrationPage = new RegistrationPage(context.page, context.logger);
    await registrationPage.enterOtp(otpResult.code);
  }
}
