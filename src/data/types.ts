/**
 * Core type definitions shared across the framework.
 * All interfaces and types used by multiple modules are defined here.
 */

/** Supported verification strategies for user groups */
export type VerificationStrategy = 'email-otp' | 'authenticator-app' | 'qr-code' | 'sms';

/** Step types available in the registration/onboarding flow */
export type StepType =
  | 'personal-info'
  | 'email-verification'
  | 'identity-verification'
  | 'authenticator-setup'
  | 'terms-acceptance'
  | 'approval-wait'
  | 'profile-setup'
  | 'welcome';

/** Profile layout types for different user groups */
export type ProfileLayout = 'full' | 'standard' | 'basic';

/** User group configuration — single source of truth for group behavior */
export interface GroupConfig {
  groupId: string;
  displayName: string;
  verificationStrategy: VerificationStrategy;
  registrationSteps: StepType[];
  requiresApproval: boolean;
  profileLayout: ProfileLayout;
  tags: string[];
}

/** Test user credentials and metadata */
export interface TestUser {
  username: string;
  password: string;
  email: string;
  groupId: string;
  firstName: string;
  lastName: string;
}

/** Email message structure returned from email services */
export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  html: string;
  receivedAt: Date;
}

/** OTP result extracted from email or authenticator */
export interface OtpResult {
  code: string;
  expiresAt?: Date;
}

/** API response wrapper */
export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

/** Test data for transaction/history views */
export interface TransactionData {
  id: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

/** Maintenance mode state */
export interface MaintenanceState {
  enabled: boolean;
  message: string;
  estimatedEndTime?: string;
}

/** Flow execution context passed between steps */
export interface FlowContextData {
  user: TestUser;
  groupConfig: GroupConfig;
  otpCode?: string;
  approvalLink?: string;
  sessionToken?: string;
  [key: string]: unknown;
}

/** Log entry structure */
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  timestamp: string;
  workerId: string;
  browser: string;
  message: string;
  error?: Error;
}

/** Custom reporter test result summary */
export interface TestResultSummary {
  testName: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  browser: string;
  retries: number;
  error?: string;
  screenshotPath?: string;
}

/** Custom reporter run summary */
export interface RunSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  timedOut: number;
  duration: number;
  startTime: string;
  endTime: string;
  results: TestResultSummary[];
}
