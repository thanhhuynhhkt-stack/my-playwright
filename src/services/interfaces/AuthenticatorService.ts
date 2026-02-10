/**
 * Authenticator service interface.
 * Abstracts 3rd party authenticator app interactions (TOTP, QR code, etc.).
 * Since actual mobile app interaction cannot be automated, implementations
 * provide mock or API-based alternatives.
 */

import { OtpResult } from '../../data/types';

export interface AuthenticatorService {
  /**
   * Generates or retrieves a TOTP code for the given secret.
   * In mock mode, returns a pre-configured code.
   * In API mode, computes the code from the shared secret.
   */
  getCode(secret: string): Promise<OtpResult>;

  /**
   * Extracts the secret from a QR code setup URL.
   * Used during authenticator enrollment flows.
   */
  parseSetupUrl(qrCodeUrl: string): string;

  /**
   * Enrolls a new authenticator for the given user via API.
   * Bypasses the QR code scanning step for automation.
   */
  enroll(userId: string): Promise<{ secret: string; backupCodes: string[] }>;
}
