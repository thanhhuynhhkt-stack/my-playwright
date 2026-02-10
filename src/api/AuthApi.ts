/**
 * Authentication API client.
 * Used for programmatic login, user creation, and session management.
 * Bypasses the UI for faster test setup.
 */

import { ApiClient } from './ApiClient';
import { TestUser } from '../data/types';
import { Logger } from '../utils/Logger';

export class AuthApi {
  private readonly client: ApiClient;
  private readonly logger: Logger;

  constructor(client: ApiClient, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  /**
   * Creates a test user via API.
   */
  async createUser(user: TestUser): Promise<{ userId: string }> {
    this.logger.info(`Creating user via API: ${user.username}`);
    const response = await this.client.post<{ userId: string }>('/users', {
      username: user.username,
      password: user.password,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      groupId: user.groupId,
    });
    return response.data;
  }

  /**
   * Logs in via API and returns a session token.
   */
  async login(username: string, password: string): Promise<{ token: string }> {
    this.logger.info(`API login for: ${username}`);
    const response = await this.client.post<{ token: string }>('/auth/login', {
      username,
      password,
    });
    return response.data;
  }

  /**
   * Deletes a test user via API (teardown).
   */
  async deleteUser(userId: string): Promise<void> {
    this.logger.info(`Deleting user via API: ${userId}`);
    await this.client.delete(`/users/${userId}`);
  }
}
