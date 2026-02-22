// Test user data.
//
// These are the fake users we use in our tests. Each user belongs to a different
// tier (high, medium, low) because the app behaves differently for each tier.
//
// The password is the same for all test users to keep things simple.
// If you need a new test user, just add one here following the same pattern.

export const TEST_PASSWORD = 'Test@Pass123!';

// We use a timestamp to make usernames unique every time tests run.
// This avoids "user already exists" errors if your app keeps user data between runs.
function uniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function createHighTierUser() {
  const id = uniqueId();
  return {
    username: `testuser_high_${id}`,
    password: TEST_PASSWORD,
    email: `testuser_high_${id}@test.example.com`,
    firstName: 'Test',
    lastName: `High_${id}`,
  };
}

export function createMediumTierUser() {
  const id = uniqueId();
  return {
    username: `testuser_medium_${id}`,
    password: TEST_PASSWORD,
    email: `testuser_medium_${id}@test.example.com`,
    firstName: 'Test',
    lastName: `Medium_${id}`,
  };
}

export function createLowTierUser() {
  const id = uniqueId();
  return {
    username: `testuser_low_${id}`,
    password: TEST_PASSWORD,
    email: `testuser_low_${id}@test.example.com`,
    firstName: 'Test',
    lastName: `Low_${id}`,
  };
}
