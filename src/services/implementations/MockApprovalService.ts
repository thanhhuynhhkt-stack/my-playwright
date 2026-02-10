/**
 * Mock approval service implementation.
 * Simulates the second-actor approval workflow for local testing.
 */

import { ApprovalService } from '../interfaces/ApprovalService';

export class MockApprovalService implements ApprovalService {
  private pendingRequests: Map<string, string[]> = new Map();

  async approvePendingRequest(approverEmail: string, _requestId?: string): Promise<void> {
    // In a real implementation, this would:
    // 1. Fetch the approval email
    // 2. Extract the approval link
    // 3. Visit the link to approve
    // Mock: just clear the pending request
    const requests = this.pendingRequests.get(approverEmail) || [];
    requests.shift();
    this.pendingRequests.set(approverEmail, requests);
  }

  async rejectPendingRequest(approverEmail: string, _requestId?: string): Promise<void> {
    const requests = this.pendingRequests.get(approverEmail) || [];
    requests.shift();
    this.pendingRequests.set(approverEmail, requests);
  }

  async hasPendingRequest(approverEmail: string): Promise<boolean> {
    const requests = this.pendingRequests.get(approverEmail) || [];
    return requests.length > 0;
  }

  /**
   * Helper: inject a pending request for testing.
   */
  injectPendingRequest(approverEmail: string, requestId: string): void {
    const requests = this.pendingRequests.get(approverEmail) || [];
    requests.push(requestId);
    this.pendingRequests.set(approverEmail, requests);
  }
}
