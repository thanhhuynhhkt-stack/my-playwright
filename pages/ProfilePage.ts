// Profile page object.
// The profile page looks different depending on the user tier (high, medium, low).
// High tier users see security section and activity log.
// Medium tier users see notification settings.
// Low tier users see just the basics (name and email).

import { Page, Locator } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // -- Locators --

  get displayName(): Locator {
    return this.page.locator('[data-testid="profile-display-name"]');
  }

  get email(): Locator {
    return this.page.locator('[data-testid="profile-email"]');
  }

  get groupBadge(): Locator {
    return this.page.locator('[data-testid="profile-group-badge"]');
  }

  get editButton(): Locator {
    return this.page.locator('[data-testid="profile-edit"]');
  }

  get deleteAccountButton(): Locator {
    return this.page.locator('[data-testid="profile-delete-account"]');
  }

  // These sections only show up for certain tiers
  get securitySection(): Locator {
    return this.page.locator('[data-testid="profile-security-section"]');
  }

  get activityLog(): Locator {
    return this.page.locator('[data-testid="profile-activity-log"]');
  }

  get notificationSettings(): Locator {
    return this.page.locator('[data-testid="profile-notification-settings"]');
  }

  // -- Actions --

  async goto() {
    await this.page.goto('/profile');
  }

  async clickEdit() {
    await this.editButton.click();
  }

  async clickDeleteAccount() {
    await this.deleteAccountButton.click();
  }
}
