/**
 * QR code login mock.
 * Intercepts QR code generation and scanning API calls
 * to simulate QR code login without actual mobile app interaction.
 *
 * To add a new service mock:
 * 1. Create a new file in src/mocks/ following this pattern
 * 2. Define the mock routes
 * 3. Register them via MockManager in your test or fixture
 */

import { MockManager, MockRoute } from './MockManager';
import { GroupConfig } from '../data/types';

export class QrCodeMock {
  private readonly mockManager: MockManager;

  constructor(mockManager: MockManager) {
    this.mockManager = mockManager;
  }

  /**
   * Sets up QR code login mocks.
   * Simulates QR code generation and the mobile app scanning response.
   */
  async setup(config?: GroupConfig): Promise<void> {
    // Mock QR code generation endpoint
    await this.mockManager.addMock({
      pattern: '**/api/auth/qr-code/generate',
      method: 'POST',
      handler: async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            qrCodeUrl: 'data:image/png;base64,mockQrCodeData',
            sessionId: 'mock-qr-session-123',
          }),
        });
      },
    });

    // Mock QR code status polling (simulates successful scan after one poll)
    let pollCount = 0;
    await this.mockManager.addMock({
      pattern: '**/api/auth/qr-code/status*',
      method: 'GET',
      handler: async (route) => {
        pollCount++;
        const scanned = pollCount >= 2;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: scanned ? 'authenticated' : 'pending',
            token: scanned ? 'mock-jwt-token-from-qr' : null,
          }),
        });
      },
    });
  }
}
