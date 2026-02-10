/**
 * Retry logic for external dependency calls.
 * Wraps async operations with configurable retry count, delay, and backoff.
 * Used by service implementations for flaky external APIs.
 */

import { testConfig } from '../config/test.config';
import { Logger } from './Logger';

export interface RetryOptions {
  /** Maximum number of attempts */
  maxRetries?: number;
  /** Initial delay between retries (ms) */
  delay?: number;
  /** Whether to use exponential backoff */
  exponentialBackoff?: boolean;
  /** Descriptive label for logging */
  label?: string;
}

export class RetryHelper {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Retries an async operation with configurable backoff.
   *
   * @param operation - The async function to retry.
   * @param options - Retry configuration.
   * @returns The result of the operation on success.
   * @throws The last error if all retries are exhausted.
   *
   * @example
   * const email = await retryHelper.withRetry(
   *   () => emailService.fetchLatestEmail(address),
   *   { maxRetries: 3, label: 'Fetch email' }
   * );
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? testConfig.externalServiceRetries;
    const baseDelay = options.delay ?? testConfig.retryDelay;
    const exponential = options.exponentialBackoff ?? true;
    const label = options.label ?? 'operation';

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          const delay = exponential ? baseDelay * Math.pow(2, attempt - 1) : baseDelay;
          this.logger.warn(
            `${label}: attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms... Error: ${lastError.message}`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          this.logger.error(
            `${label}: all ${maxRetries} attempts failed.`,
            lastError
          );
        }
      }
    }

    throw lastError!;
  }
}
