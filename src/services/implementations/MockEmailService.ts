/**
 * Mock email service implementation for local testing.
 * Returns pre-configured OTP codes and email bodies.
 * No external dependencies required.
 */

import { Email, OtpResult } from '../../data/types';
import { EmailService } from '../interfaces/EmailService';

export class MockEmailService implements EmailService {
  private readonly mockOtp = '123456';
  private readonly mockEmails: Map<string, Email[]> = new Map();

  async fetchLatestOTP(emailAddress: string): Promise<OtpResult> {
    return {
      code: this.mockOtp,
      expiresAt: new Date(Date.now() + 300_000), // 5 minutes
    };
  }

  async fetchLatestEmail(emailAddress: string): Promise<Email> {
    const inbox = this.mockEmails.get(emailAddress);
    if (inbox && inbox.length > 0) {
      return inbox[inbox.length - 1];
    }

    // Return a default mock email
    return {
      id: `mock-${Date.now()}`,
      from: 'noreply@app.example.com',
      to: emailAddress,
      subject: 'Your verification code',
      body: `Your OTP code is: ${this.mockOtp}`,
      html: `<p>Your OTP code is: <strong>${this.mockOtp}</strong></p>`,
      receivedAt: new Date(),
    };
  }

  async extractLink(emailAddress: string, linkPattern: RegExp): Promise<string> {
    const email = await this.fetchLatestEmail(emailAddress);
    const match = email.html.match(linkPattern);
    if (!match) {
      // Return a default mock link
      return 'http://localhost:3000/verify?token=mock-token-123';
    }
    return match[0];
  }

  async clearInbox(emailAddress: string): Promise<void> {
    this.mockEmails.delete(emailAddress);
  }

  /**
   * Helper: injects a mock email into the inbox (for testing the framework itself).
   */
  injectEmail(emailAddress: string, email: Email): void {
    const inbox = this.mockEmails.get(emailAddress) || [];
    inbox.push(email);
    this.mockEmails.set(emailAddress, inbox);
  }
}
