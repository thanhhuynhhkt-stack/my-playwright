/**
 * Group configuration — single source of truth for all user groups.
 *
 * To add a new user group:
 * 1. Add a new entry to GROUP_CONFIGS below
 * 2. If the group introduces a new step type, add it to StepType in types.ts
 *    and create a corresponding step class in src/flows/steps/
 * 3. That's it — the flow engine, test specs, and fixtures will pick it up automatically
 */

import { GroupConfig } from './types';

export const GROUP_CONFIGS: Record<string, GroupConfig> = {
  high: {
    groupId: 'high',
    displayName: 'High Tier',
    verificationStrategy: 'authenticator-app',
    registrationSteps: [
      'personal-info',
      'email-verification',
      'identity-verification',
      'authenticator-setup',
      'terms-acceptance',
      'approval-wait',
      'profile-setup',
      'welcome',
    ],
    requiresApproval: true,
    profileLayout: 'full',
    tags: ['@high-tier', '@regression'],
  },

  medium: {
    groupId: 'medium',
    displayName: 'Medium Tier',
    verificationStrategy: 'email-otp',
    registrationSteps: [
      'personal-info',
      'email-verification',
      'identity-verification',
      'terms-acceptance',
      'profile-setup',
      'welcome',
    ],
    requiresApproval: false,
    profileLayout: 'standard',
    tags: ['@medium-tier', '@regression'],
  },

  low: {
    groupId: 'low',
    displayName: 'Low Tier',
    verificationStrategy: 'email-otp',
    registrationSteps: [
      'personal-info',
      'email-verification',
      'terms-acceptance',
      'welcome',
    ],
    requiresApproval: false,
    profileLayout: 'basic',
    tags: ['@low-tier', '@smoke', '@regression'],
  },

  // -----------------------------------------------------------------------
  // To add a new group, copy one of the entries above and customize it.
  // Example:
  //
  // premium: {
  //   groupId: 'premium',
  //   displayName: 'Premium Tier',
  //   verificationStrategy: 'authenticator-app',
  //   registrationSteps: ['personal-info', 'email-verification', ...],
  //   requiresApproval: true,
  //   profileLayout: 'full',
  //   tags: ['@premium-tier', '@regression'],
  // },
  // -----------------------------------------------------------------------
};

/** Returns all group IDs */
export function getAllGroupIds(): string[] {
  return Object.keys(GROUP_CONFIGS);
}

/** Returns config for a specific group, throws if not found */
export function getGroupConfig(groupId: string): GroupConfig {
  const config = GROUP_CONFIGS[groupId];
  if (!config) {
    throw new Error(
      `Unknown group ID: "${groupId}". Available groups: ${getAllGroupIds().join(', ')}`
    );
  }
  return config;
}

/** Returns all group configs as an array */
export function getAllGroupConfigs(): GroupConfig[] {
  return Object.values(GROUP_CONFIGS);
}

/** Returns groups that require approval */
export function getApprovalGroups(): GroupConfig[] {
  return getAllGroupConfigs().filter((g) => g.requiresApproval);
}

/** Returns groups matching a specific tag */
export function getGroupsByTag(tag: string): GroupConfig[] {
  return getAllGroupConfigs().filter((g) => g.tags.includes(tag));
}
