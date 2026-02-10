/**
 * Approval wait step — simulates waiting for an approver to act on a request.
 * Only used by groups where requiresApproval = true.
 * Uses ApprovalService to trigger approval without manual intervention.
 */

import { Step } from './Step';
import { FlowContext } from '../FlowContext';
import { StepType } from '../../data/types';
import { WaitHelper } from '../../utils/WaitHelper';

export class ApprovalWaitStep implements Step {
  readonly type: StepType = 'approval-wait';
  readonly description = 'Wait for approval from approver';

  async execute(context: FlowContext): Promise<void> {
    context.logger.info(`Step: ${this.description}`);

    const approverEmail = 'approver@test.example.com';

    // Trigger approval via the service
    await context.approvalService.approvePendingRequest(approverEmail);

    // Wait for the UI to reflect the approved state
    const waitHelper = new WaitHelper();
    await waitHelper.pollUntil(
      async () => {
        const statusElement = context.page.locator('[data-testid="reg-approval-status"]');
        if (await statusElement.isVisible()) {
          const text = await statusElement.textContent();
          return text?.includes('approved') || text?.includes('Approved');
        }
        return false;
      },
      { timeout: 30_000, message: 'Approval status did not update' }
    );

    context.logger.info('Approval received');
  }
}
