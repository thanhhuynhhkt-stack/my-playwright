/**
 * Step registry — maps StepType identifiers to Step implementations.
 *
 * To register a new step:
 * 1. Create the step class in src/flows/steps/
 * 2. Import it here
 * 3. Add it to the registerDefaults() method
 *
 * The registry is instantiated per-test (via fixture) to avoid shared state.
 */

import { StepType } from '../data/types';
import { Step } from './steps/Step';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { EmailVerificationStep } from './steps/EmailVerificationStep';
import { IdentityVerificationStep } from './steps/IdentityVerificationStep';
import { AuthenticatorSetupStep } from './steps/AuthenticatorSetupStep';
import { TermsAcceptanceStep } from './steps/TermsAcceptanceStep';
import { ApprovalWaitStep } from './steps/ApprovalWaitStep';
import { ProfileSetupStep } from './steps/ProfileSetupStep';
import { WelcomeStep } from './steps/WelcomeStep';

export class StepRegistry {
  private readonly steps: Map<StepType, Step> = new Map();

  constructor() {
    this.registerDefaults();
  }

  /**
   * Registers all built-in step implementations.
   * Called automatically in the constructor.
   */
  private registerDefaults(): void {
    this.register(new PersonalInfoStep());
    this.register(new EmailVerificationStep());
    this.register(new IdentityVerificationStep());
    this.register(new AuthenticatorSetupStep());
    this.register(new TermsAcceptanceStep());
    this.register(new ApprovalWaitStep());
    this.register(new ProfileSetupStep());
    this.register(new WelcomeStep());
  }

  /**
   * Registers a step implementation.
   * Can be used to override defaults or add custom steps in tests.
   */
  register(step: Step): void {
    this.steps.set(step.type, step);
  }

  /**
   * Retrieves a step implementation by type.
   * Throws if the step type is not registered.
   */
  get(type: StepType): Step {
    const step = this.steps.get(type);
    if (!step) {
      throw new Error(
        `Step type "${type}" is not registered. ` +
        `Available steps: ${Array.from(this.steps.keys()).join(', ')}`
      );
    }
    return step;
  }

  /**
   * Checks if a step type is registered.
   */
  has(type: StepType): boolean {
    return this.steps.has(type);
  }

  /**
   * Returns all registered step types.
   */
  getRegisteredTypes(): StepType[] {
    return Array.from(this.steps.keys());
  }
}
