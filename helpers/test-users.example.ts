// Test user data template.
//
// Copy this file to test-users.ts and fill in real values before running tests.
// test-users.ts is gitignored to prevent credentials from being committed.
//
// CHANGI_USERNAME / CHANGI_PASSWORD: the corporate Microsoft/ADFS account used
// during the "Log in with Changi" step of the registration flow.
//
// userUid: the Changi Identity user ID used by the cleanup API (DELETE /dev/users/:uid)
// to reset the account before each test run. Find it in the dev/QA database.

const CHANGI_USERNAME = 'your.name@your-company.com';
const CHANGI_PASSWORD = 'YourPassword@123';

export function group1User() {
  return {
    singpassUsername: 'yoursingpassusername [Group 1]',
    mobileNumber: '81234567',
    password: 'YourPassword@123',
    changiUsername: CHANGI_USERNAME,
    changiPassword: CHANGI_PASSWORD,
    userUid: 'U000000000000',
  };
}

export function group2User() {
  return {
    singpassUsername: 'yoursingpassusername [Group 2]',
    mobileNumber: '81234567',
    password: 'YourPassword@123',
    changiUsername: CHANGI_USERNAME,
    changiPassword: CHANGI_PASSWORD,
    userUid: 'U000000000001',
  };
}

export function group3User() {
  return {
    singpassUsername: 'yoursingpassusername [Group 3]',
    mobileNumber: '81234567',
    password: 'YourPassword@123',
    changiUsername: CHANGI_USERNAME,
    changiPassword: CHANGI_PASSWORD,
    userUid: 'U000000000002',
  };
}

export function sauceStandardUser() {
  return {
    username: 'standard_user',
    password: 'secret_sauce',
  };
}
