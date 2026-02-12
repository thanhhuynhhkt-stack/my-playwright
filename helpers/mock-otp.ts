// Simple OTP mock helper.
//
// In real life, the app sends an OTP code to your email or authenticator app.
// In tests, we do not have a real email inbox, so we use a fake OTP code.
// The mock service always returns "123456" as the code.
//
// If your app has a test mode or sandbox that accepts a fixed OTP,
// you can just hardcode it here. If you later switch to a real email service
// like Mailosaur, you would change this file to call their API instead.

export function getMockOtp(): string {
  return '123456';
}
