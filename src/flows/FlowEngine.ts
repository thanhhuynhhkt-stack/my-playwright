/**
 * Generic step-based flow engine.
 * Reads the step sequence from a GroupConfig and executes each step in order
 * using the StepRegistry to resolve implementations.
 *
 * This engine is reusable across features (registration, onboarding, etc.).
 * Adding a new group or step never requires modifying this file.
 */

import { GroupConfig, StepType } from '../data/types';
import { FlowContext } from './FlowContext';
import { StepRegistry } from './StepRegistry';
import { Logger } from '../utils/Logger';

export class FlowEngine {
  private readonly registry: StepRegistry;
  private readonly logger: Logger;

  constructor(registry: StepRegistry, logger: Logger) {
    this.registry = registry;
    this.logger = logger;
  }

  /**
   * Executes a complete flow for the given group configuration.
   * Steps are executed in the order defined by the config's step list.
   *
   * @param config - The group config containing the step sequence.
   * @param context - The flow context with page, user, and services.
   * @param stepFilter - Optional filter to run only specific steps (for partial flows).
   */
  async executeFlow(
    config: GroupConfig,
    context: FlowContext,
    stepFilter?: StepType[]
  ): Promise<void> {
    const stepsToRun = stepFilter
      ? config.registrationSteps.filter((s) => stepFilter.includes(s))
      : config.registrationSteps;

    this.logger.info(
      `FlowEngine: Starting flow for group "${config.displayName}" ` +
      `with ${stepsToRun.length} steps: [${stepsToRun.join(', ')}]`
    );

    const startTime = Date.now();

    for (let i = 0; i < stepsToRun.length; i++) {
      const stepType = stepsToRun[i];
      const step = this.registry.get(stepType);

      this.logger.info(
        `FlowEngine: Step ${i + 1}/${stepsToRun.length} — ${step.description} (${stepType})`
      );

      const stepStart = Date.now();

      try {
        await step.execute(context);
        const stepDuration = Date.now() - stepStart;
        this.logger.info(
          `FlowEngine: Step "${stepType}" completed in ${stepDuration}ms`
        );
      } catch (error) {
        const stepDuration = Date.now() - stepStart;
        this.logger.error(
          `FlowEngine: Step "${stepType}" failed after ${stepDuration}ms`,
          error instanceof Error ? error : new Error(String(error))
        );
        throw error;
      }
    }

    const totalDuration = Date.now() - startTime;
    this.logger.info(
      `FlowEngine: Flow for "${config.displayName}" completed in ${totalDuration}ms`
    );
  }

  /**
   * Executes a single step by type.
   * Useful for tests that need to run individual steps in isolation.
   */
  async executeStep(stepType: StepType, context: FlowContext): Promise<void> {
    const step = this.registry.get(stepType);
    this.logger.info(`FlowEngine: Executing single step — ${step.description}`);
    await step.execute(context);
  }
}
