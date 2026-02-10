/**
 * Flow execution context.
 * Passed to each step during flow execution.
 * Carries the current user, group config, services, page objects, and shared state.
 *
 * Steps read from and write to this context to share data (e.g., OTP codes,
 * approval links) without direct coupling between steps.
 */

import { Page } from '@playwright/test';
import { GroupConfig, TestUser } from '../data/types';
import { Logger } from '../utils/Logger';
import { EmailService } from '../services/interfaces/EmailService';
import { AuthenticatorService } from '../services/interfaces/AuthenticatorService';
import { ApprovalService } from '../services/interfaces/ApprovalService';

export interface FlowContextDependencies {
  page: Page;
  logger: Logger;
  emailService: EmailService;
  authenticatorService: AuthenticatorService;
  approvalService: ApprovalService;
}

export class FlowContext {
  readonly page: Page;
  readonly logger: Logger;
  readonly user: TestUser;
  readonly groupConfig: GroupConfig;
  readonly emailService: EmailService;
  readonly authenticatorService: AuthenticatorService;
  readonly approvalService: ApprovalService;

  /** Shared key-value store for passing data between steps */
  private readonly store: Map<string, unknown> = new Map();

  constructor(
    user: TestUser,
    groupConfig: GroupConfig,
    deps: FlowContextDependencies
  ) {
    this.user = user;
    this.groupConfig = groupConfig;
    this.page = deps.page;
    this.logger = deps.logger;
    this.emailService = deps.emailService;
    this.authenticatorService = deps.authenticatorService;
    this.approvalService = deps.approvalService;
  }

  /**
   * Stores a value in the context for use by subsequent steps.
   * @example context.set('otpCode', '123456');
   */
  set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  /**
   * Retrieves a value from the context.
   * @example const otp = context.get<string>('otpCode');
   */
  get<T>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }

  /**
   * Retrieves a required value — throws if not present.
   */
  require<T>(key: string): T {
    const value = this.get<T>(key);
    if (value === undefined) {
      throw new Error(`FlowContext: required key "${key}" not found in store`);
    }
    return value;
  }

  /**
   * Checks if a key exists in the context store.
   */
  has(key: string): boolean {
    return this.store.has(key);
  }
}
