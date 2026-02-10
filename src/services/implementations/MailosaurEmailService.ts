/**
 * Mailosaur email service implementation.
 * Integrates with Mailosaur API for real email testing in CI environments.
 * Requires MAILOSAUR_API_KEY and MAILOSAUR_SERVER_ID environment variables.
 *
 * To use a different real email provider:
 * 1. Create a new class implementing EmailService
 * 2. Register it in ServiceFactory
 */

import { Email, OtpResult } from '../../data/types';
import { EmailService } from '../interfaces/EmailService';

export class MailosaurEmailService implements EmailService {
  private readonly apiKey: string;
  private readonly serverId: string;
  private readonly baseUrl = 'https://mailosaur.com/api';

  constructor(apiKey: string, serverId: string) {
    if (!apiKey || !serverId) {
      throw new Error(
        'MailosaurEmailService requires MAILOSAUR_API_KEY and MAILOSAUR_SERVER_ID'
      );
    }
    this.apiKey = apiKey;
    this.serverId = serverId;
  }

  async fetchLatestOTP(emailAddress: string): Promise<OtpResult> {
    const email = await this.fetchLatestEmail(emailAddress);
    const otpMatch = email.body.match(/\b(\d{6})\b/);
    if (!otpMatch) {
      throw new Error(`No 6-digit OTP found in email to ${emailAddress}`);
    }
    return { code: otpMatch[1] };
  }

  async fetchLatestEmail(emailAddress: string): Promise<Email> {
    const response = await fetch(
      `${this.baseUrl}/messages/await?server=${this.serverId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sentTo: emailAddress,
          timeout: 30000,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Mailosaur API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      from: data.from?.[0]?.email || '',
      to: emailAddress,
      subject: data.subject || '',
      body: data.text?.body || '',
      html: data.html?.body || '',
      receivedAt: new Date(data.received),
    };
  }

  async extractLink(emailAddress: string, linkPattern: RegExp): Promise<string> {
    const email = await this.fetchLatestEmail(emailAddress);
    const match = email.html.match(linkPattern);
    if (!match) {
      throw new Error(
        `No link matching ${linkPattern} found in email to ${emailAddress}`
      );
    }
    return match[0];
  }

  async clearInbox(emailAddress: string): Promise<void> {
    await fetch(`${this.baseUrl}/messages?server=${this.serverId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
      },
    });
  }
}
