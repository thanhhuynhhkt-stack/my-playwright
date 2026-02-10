/**
 * Step interface — the contract all flow steps must implement.
 *
 * To create a new step:
 * 1. Create a new file in src/flows/steps/ implementing this interface
 * 2. Register it in the StepRegistry (src/flows/StepRegistry.ts)
 * 3. Reference the step type in the group config (src/data/group-config.ts)
 */

import { FlowContext } from '../FlowContext';
import { StepType } from '../../data/types';

export interface Step {
  /** Unique step type identifier — must match a StepType value */
  readonly type: StepType;

  /** Human-readable description for logging */
  readonly description: string;

  /**
   * Executes the step.
   * @param context - The flow context with page, services, and shared state.
   */
  execute(context: FlowContext): Promise<void>;
}
