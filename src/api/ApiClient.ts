/**
 * Base HTTP client wrapping Playwright's APIRequestContext.
 * Provides typed request methods for API setup/teardown operations.
 * Each test gets its own instance via fixture — no shared state.
 */

import { APIRequestContext, request } from '@playwright/test';
import { loadEnvConfig } from '../config/env.config';
import { Logger } from '../utils/Logger';
import { ApiResponse } from '../data/types';

export class ApiClient {
  private readonly baseUrl: string;
  private readonly logger: Logger;
  private context: APIRequestContext | null = null;

  constructor(logger: Logger, baseUrl?: string) {
    this.baseUrl = baseUrl || loadEnvConfig().apiBaseUrl;
    this.logger = logger;
  }

  /**
   * Initializes the API request context.
   * Must be called before making requests.
   */
  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Closes the API request context and releases resources.
   */
  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    this.logger.debug(`API GET: ${endpoint}`);
    const ctx = this.getContext();
    const response = await ctx.get(endpoint, { headers });
    return this.parseResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    this.logger.debug(`API POST: ${endpoint}`);
    const ctx = this.getContext();
    const response = await ctx.post(endpoint, { data, headers });
    return this.parseResponse<T>(response);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    this.logger.debug(`API PUT: ${endpoint}`);
    const ctx = this.getContext();
    const response = await ctx.put(endpoint, { data, headers });
    return this.parseResponse<T>(response);
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    this.logger.debug(`API DELETE: ${endpoint}`);
    const ctx = this.getContext();
    const response = await ctx.delete(endpoint, { headers });
    return this.parseResponse<T>(response);
  }

  /**
   * Sets an authorization header for subsequent requests.
   */
  async setAuthToken(token: string): Promise<void> {
    await this.dispose();
    this.context = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private getContext(): APIRequestContext {
    if (!this.context) {
      throw new Error('ApiClient not initialized. Call init() first.');
    }
    return this.context;
  }

  private async parseResponse<T>(response: {
    status: () => number;
    headers: () => Record<string, string>;
    json: () => Promise<T>;
  }): Promise<ApiResponse<T>> {
    const status = response.status();
    const headers = response.headers();
    let data: T;

    try {
      data = await response.json();
    } catch {
      data = {} as T;
    }

    this.logger.debug(`API Response: ${status}`);
    return { status, data, headers };
  }
}
