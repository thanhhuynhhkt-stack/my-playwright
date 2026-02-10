/**
 * Welcome step — final step of registration that verifies the success state.
 */

import { Step } from './Step';
import { FlowContext } from '../FlowContext';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { StepType } from '../../data/types';

export class WelcomeStep implements Step {
  readonly type: StepType = 'welcome';
  readonly description = 'Verify welcome/success page';

  async execute(context: FlowContext): Promise<void> {
    context.logger.info(`Step: ${this.description}`);

    const registrationPage = new RegistrationPage(context.page, context.logger);
    await registrationPage.expectSuccessVisible();

    context.logger.info('Registration completed successfully');
  }
}
