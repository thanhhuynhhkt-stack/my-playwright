/**
 * Approval service interface.
 * Handles the "second actor" approval workflow where another user
 * must approve an action (e.g., registration approval via email link).
 */

export interface ApprovalService {
  /**
   * Approves a pending request by clicking the approval link.
   * In real implementations, fetches the email, extracts the link, and visits it.
   * In mock mode, calls the approval API directly.
   */
  approvePendingRequest(approverEmail: string, requestId?: string): Promise<void>;

  /**
   * Rejects a pending request.
   */
  rejectPendingRequest(approverEmail: string, requestId?: string): Promise<void>;

  /**
   * Checks whether a pending request exists for the given approver.
   */
  hasPendingRequest(approverEmail: string): Promise<boolean>;
}
