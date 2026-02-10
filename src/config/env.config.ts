/**
 * Environment configuration loader.
 * Reads from .env file with sensible defaults.
 * All environment-specific values are centralized here.
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface EnvConfig {
  /** Base URL of the application under test */
  baseUrl: string;
  /** Base URL for API endpoints */
  apiBaseUrl: string;
  /** Target browser (empty = all) */
  browser: string;
  /** Whether running in CI environment */
  isCI: boolean;
  /** Email service provider: 'mailosaur' | 'mock' */
  emailService: string;
  /** Mailosaur API key (when emailService = 'mailosaur') */
  mailosaurApiKey: string;
  /** Mailosaur server ID */
  mailosaurServerId: string;
  /** Authenticator service provider: 'mock' */
  authenticatorService: string;
  /** Log level */
  logLevel: string;
  /** Whether to seed test data before runs */
  testDataSeed: boolean;
}

export function loadEnvConfig(): EnvConfig {
  return {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
    browser: process.env.BROWSER || '',
    isCI: process.env.CI === 'true',
    emailService: process.env.EMAIL_SERVICE || 'mock',
    mailosaurApiKey: process.env.MAILOSAUR_API_KEY || '',
    mailosaurServerId: process.env.MAILOSAUR_SERVER_ID || '',
    authenticatorService: process.env.AUTHENTICATOR_SERVICE || 'mock',
    logLevel: process.env.LOG_LEVEL || 'info',
    testDataSeed: process.env.TEST_DATA_SEED === 'true',
  };
}

/** Singleton-free: each call returns a fresh config read from env */
export const envConfig = loadEnvConfig();
