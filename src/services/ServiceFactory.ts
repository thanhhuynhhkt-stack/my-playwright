/**
 * Service factory — creates service instances based on environment configuration.
 * Centralizes the decision of which implementation to use.
 *
 * To add a new service:
 * 1. Define the interface in src/services/interfaces/
 * 2. Create implementation(s) in src/services/implementations/
 * 3. Add a factory method here
 * 4. Wire it into the fixture in src/fixtures/test.fixture.ts
 */

import { loadEnvConfig } from '../config/env.config';
import { EmailService } from './interfaces/EmailService';
import { AuthenticatorService } from './interfaces/AuthenticatorService';
import { ApprovalService } from './interfaces/ApprovalService';
import { MockEmailService } from './implementations/MockEmailService';
import { MailosaurEmailService } from './implementations/MailosaurEmailService';
import { MockAuthenticatorService } from './implementations/MockAuthenticatorService';
import { MockApprovalService } from './implementations/MockApprovalService';

export class ServiceFactory {
  private readonly config = loadEnvConfig();

  /**
   * Creates an EmailService instance based on EMAIL_SERVICE env var.
   * 'mock' -> MockEmailService (default, no external deps)
   * 'mailosaur' -> MailosaurEmailService (requires API key)
   */
  createEmailService(): EmailService {
    switch (this.config.emailService) {
      case 'mailosaur':
        return new MailosaurEmailService(
          this.config.mailosaurApiKey,
          this.config.mailosaurServerId
        );
      case 'mock':
      default:
        return new MockEmailService();
    }
  }

  /**
   * Creates an AuthenticatorService instance based on AUTHENTICATOR_SERVICE env var.
   * Currently only 'mock' is supported.
   */
  createAuthenticatorService(): AuthenticatorService {
    switch (this.config.authenticatorService) {
      case 'mock':
      default:
        return new MockAuthenticatorService();
    }
  }

  /**
   * Creates an ApprovalService instance.
   * In production, this could use real email + link clicking.
   */
  createApprovalService(): ApprovalService {
    // Future: add 'email-based' implementation that uses EmailService + API client
    return new MockApprovalService();
  }
}
