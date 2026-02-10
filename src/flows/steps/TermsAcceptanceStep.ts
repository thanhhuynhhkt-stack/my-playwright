/**
 * Terms acceptance step — checks the terms & conditions checkbox.
 * Simple step used by all groups.
 */

import { Step } from './Step';
import { FlowContext } from '../FlowContext';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { StepType } from '../../data/types';

export class TermsAcceptanceStep implements Step {
  readonly type: StepType = 'terms-acceptance';
  readonly description = 'Accept terms and conditions';

  async execute(context: FlowContext): Promise<void> {
    context.logger.info(`Step: ${this.description}`);

    const registrationPage = new RegistrationPage(context.page, context.logger);
    await registrationPage.acceptTerms();
    await registrationPage.clickNext();
  }
}
