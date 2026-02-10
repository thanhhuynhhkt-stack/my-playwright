/**
 * Personal information step — fills the first registration form section.
 * This step is used by all user groups.
 */

import { Step } from './Step';
import { FlowContext } from '../FlowContext';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { StepType } from '../../data/types';

export class PersonalInfoStep implements Step {
  readonly type: StepType = 'personal-info';
  readonly description = 'Fill personal information form';

  async execute(context: FlowContext): Promise<void> {
    context.logger.info(`Step: ${this.description}`);

    const registrationPage = new RegistrationPage(context.page, context.logger);

    await registrationPage.fillPersonalInfo({
      firstName: context.user.firstName,
      lastName: context.user.lastName,
      email: context.user.email,
    });

    await registrationPage.fillPassword(context.user.password);
    await registrationPage.clickNext();
  }
}
