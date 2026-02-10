/**
 * Polling utilities for async events.
 * Used to wait for external service responses (email delivery, approval processing, etc.)
 * without using page.waitForTimeout().
 */

import { testConfig } from '../config/test.config';

export interface WaitOptions {
  /** Maximum time to wait (ms) */
  timeout?: number;
  /** Polling interval (ms) */
  interval?: number;
  /** Descriptive message for timeout errors */
  message?: string;
}

export class WaitHelper {
  /**
   * Polls a condition function until it returns a truthy value or times out.
   * Use this instead of page.waitForTimeout() for async conditions.
   *
   * @param condition - Async function that returns a value. Polling stops when truthy.
   * @param options - Timeout, interval, and error message configuration.
   * @returns The truthy value returned by the condition.
   * @throws Error if the condition does not become truthy within the timeout.
   *
   * @example
   * const otp = await waitHelper.pollUntil(
   *   () => emailService.fetchLatestOTP(user.email),
   *   { timeout: 30000, message: 'OTP email not received' }
   * );
   */
  async pollUntil<T>(
    condition: () => Promise<T>,
    options: WaitOptions = {}
  ): Promise<T> {
    const timeout = options.timeout ?? testConfig.externalServiceTimeout;
    const interval = options.interval ?? testConfig.pollingInterval;
    const message = options.message ?? 'Condition was not met within timeout';

    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      try {
        const result = await condition();
        if (result) {
          return result;
        }
      } catch {
        // Condition threw — keep polling
      }

      await this.delay(Math.min(interval, deadline - Date.now()));
    }

    throw new Error(`WaitHelper timeout (${timeout}ms): ${message}`);
  }

  /**
   * Waits for a specified duration. Use sparingly — prefer pollUntil for conditions.
   * This is only for cases where a fixed delay is genuinely required.
   */
  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
