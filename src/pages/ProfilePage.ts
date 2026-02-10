/**
 * Profile page object.
 * Handles interactions with the user profile page.
 * Layout varies by user group — the page object exposes all possible elements;
 * tests/flows decide which elements to interact with based on group config.
 */

import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export class ProfilePage extends BasePage {
  protected readonly path = '/profile';

  constructor(page: Page, logger: Logger) {
    super(page, logger);
  }

  // --------------- Selectors ---------------

  private get displayName(): Locator {
    return this.page.locator('[data-testid="profile-display-name"]');
  }

  private get emailDisplay(): Locator {
    return this.page.locator('[data-testid="profile-email"]');
  }

  private get groupBadge(): Locator {
    return this.page.locator('[data-testid="profile-group-badge"]');
  }

  private get editButton(): Locator {
    return this.page.locator('[data-testid="profile-edit"]');
  }

  private get deleteAccountButton(): Locator {
    return this.page.locator('[data-testid="profile-delete-account"]');
  }

  // Full layout elements (High tier only)
  private get securitySection(): Locator {
    return this.page.locator('[data-testid="profile-security-section"]');
  }

  private get activityLog(): Locator {
    return this.page.locator('[data-testid="profile-activity-log"]');
  }

  // Standard layout elements (Medium + High)
  private get notificationSettings(): Locator {
    return this.page.locator('[data-testid="profile-notification-settings"]');
  }

  // --------------- Actions ---------------

  async getDisplayName(): Promise<string> {
    return this.getText(this.displayName);
  }

  async getEmail(): Promise<string> {
    return this.getText(this.emailDisplay);
  }

  async getGroupBadge(): Promise<string> {
    return this.getText(this.groupBadge);
  }

  async clickEdit(): Promise<void> {
    this.logger.info('Clicking profile edit button');
    await this.click(this.editButton, 'Edit profile button');
  }

  async clickDeleteAccount(): Promise<void> {
    this.logger.info('Clicking delete account button');
    await this.click(this.deleteAccountButton, 'Delete account button');
  }

  // --------------- Layout Verification ---------------

  async expectFullLayout(): Promise<void> {
    this.logger.info('Verifying full profile layout');
    await this.expectVisible(this.securitySection);
    await this.expectVisible(this.activityLog);
    await this.expectVisible(this.notificationSettings);
  }

  async expectStandardLayout(): Promise<void> {
    this.logger.info('Verifying standard profile layout');
    await this.expectVisible(this.notificationSettings);
  }

  async expectBasicLayout(): Promise<void> {
    this.logger.info('Verifying basic profile layout');
    await this.expectVisible(this.displayName);
    await this.expectVisible(this.emailDisplay);
  }

  /**
   * Verifies the profile layout matches the expected type.
   * Called from data-driven tests with the group's profileLayout value.
   */
  async verifyLayout(layout: string): Promise<void> {
    switch (layout) {
      case 'full':
        await this.expectFullLayout();
        break;
      case 'standard':
        await this.expectStandardLayout();
        break;
      case 'basic':
        await this.expectBasicLayout();
        break;
      default:
        throw new Error(`Unknown profile layout: ${layout}`);
    }
  }
}
