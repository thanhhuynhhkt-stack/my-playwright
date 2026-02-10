/**
 * Email service interface.
 * All email integrations (Mailosaur, mock, etc.) implement this interface.
 * Test scripts depend on this interface, never on a specific implementation.
 */

import { Email, OtpResult } from '../../data/types';

export interface EmailService {
  /**
   * Fetches the latest OTP code sent to the given email address.
   * Polls until an OTP is found or times out.
   */
  fetchLatestOTP(emailAddress: string): Promise<OtpResult>;

  /**
   * Fetches the latest email sent to the given address.
   * Returns the full email object for link extraction, body inspection, etc.
   */
  fetchLatestEmail(emailAddress: string): Promise<Email>;

  /**
   * Extracts the first link matching a pattern from the latest email.
   * Useful for approval links, verification links, etc.
   */
  extractLink(emailAddress: string, linkPattern: RegExp): Promise<string>;

  /**
   * Deletes all emails for the given address.
   * Used in setup/teardown to ensure a clean state.
   */
  clearInbox(emailAddress: string): Promise<void>;
}
