// Profile page tests.
//
// The profile page shows different sections depending on the user tier:
// - High tier: sees everything (security section, activity log, notification settings)
// - Medium tier: sees notification settings but not security or activity log
// - Low tier: sees just the basics (display name and email)
//
// The profile page requires login. Each test uses loginAs() to authenticate
// with the appropriate tier before navigating to the profile page.

import { test, expect } from '../../helpers/test-setup';

test.describe('Profile Page', () => {

  test('should show basic profile info for all users @smoke', async ({ loginAs, profilePage }) => {
    // Every user, regardless of tier, should see their display name and email.
    await loginAs('low');
    await profilePage.goto();

    await expect(profilePage.displayName).toBeVisible();
    await expect(profilePage.email).toBeVisible();
  });

  test('should show the group badge @regression', async ({ loginAs, profilePage }) => {
    // The profile page shows a badge indicating which tier the user belongs to.
    await loginAs('low');
    await profilePage.goto();

    await expect(profilePage.groupBadge).toBeVisible();
  });

  test('should show security section for high tier users @regression', async ({ loginAs, profilePage }) => {
    // Only high tier users should see the security section and activity log.
    await loginAs('high');
    await profilePage.goto();

    await expect(profilePage.securitySection).toBeVisible();
    await expect(profilePage.activityLog).toBeVisible();
    await expect(profilePage.notificationSettings).toBeVisible();
  });

  test('should show notification settings for medium tier users @regression', async ({ loginAs, profilePage }) => {
    // Medium tier sees notification settings but not security or activity log.
    await loginAs('medium');
    await profilePage.goto();

    await expect(profilePage.notificationSettings).toBeVisible();
  });

  test('should show edit and delete buttons @regression', async ({ loginAs, profilePage }) => {
    // Every user should be able to edit their profile or delete their account.
    await loginAs('low');
    await profilePage.goto();

    await expect(profilePage.editButton).toBeVisible();
    await expect(profilePage.deleteAccountButton).toBeVisible();
  });
});
