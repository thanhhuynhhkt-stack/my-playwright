/**
 * Maintenance mode API client.
 * Toggles maintenance mode via API for testing system-level states.
 *
 * To add a new API service:
 * 1. Create a new file in src/api/ following this pattern
 * 2. Use ApiClient for HTTP requests
 * 3. Wire into fixtures if needed
 */

import { ApiClient } from './ApiClient';
import { MaintenanceState } from '../data/types';
import { Logger } from '../utils/Logger';

export class MaintenanceApi {
  private readonly client: ApiClient;
  private readonly logger: Logger;

  constructor(client: ApiClient, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  /**
   * Enables maintenance mode with an optional message.
   */
  async enable(message: string = 'System under maintenance'): Promise<void> {
    this.logger.info(`Enabling maintenance mode: "${message}"`);
    await this.client.post('/admin/maintenance', {
      enabled: true,
      message,
    });
  }

  /**
   * Disables maintenance mode.
   */
  async disable(): Promise<void> {
    this.logger.info('Disabling maintenance mode');
    await this.client.post('/admin/maintenance', {
      enabled: false,
      message: '',
    });
  }

  /**
   * Gets the current maintenance mode state.
   */
  async getState(): Promise<MaintenanceState> {
    const response = await this.client.get<MaintenanceState>('/admin/maintenance');
    return response.data;
  }
}
