/**
 * Mock authenticator service implementation.
 * Simulates TOTP/authenticator app interactions for local testing.
 * In production test environments, swap with an API-based implementation.
 */

import { OtpResult } from '../../data/types';
import { AuthenticatorService } from '../interfaces/AuthenticatorService';

export class MockAuthenticatorService implements AuthenticatorService {
  private readonly mockCode = '654321';
  private readonly mockSecret = 'JBSWY3DPEHPK3PXP';

  async getCode(_secret: string): Promise<OtpResult> {
    return {
      code: this.mockCode,
      expiresAt: new Date(Date.now() + 30_000), // 30 seconds (TOTP window)
    };
  }

  parseSetupUrl(qrCodeUrl: string): string {
    // Real implementation would parse otpauth:// URL
    // Mock returns a fixed secret
    const match = qrCodeUrl.match(/secret=([A-Z2-7]+)/i);
    return match ? match[1] : this.mockSecret;
  }

  async enroll(_userId: string): Promise<{ secret: string; backupCodes: string[] }> {
    return {
      secret: this.mockSecret,
      backupCodes: ['12345678', '23456789', '34567890', '45678901'],
    };
  }
}
