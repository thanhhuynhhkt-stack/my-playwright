// IMAP OTP helper.
//
// Polls the configured IMAP inbox until an email arrives that was sent
// after `sentAfter` (millisecond Unix timestamp), then extracts the first
// 6-digit OTP code from the message body.
//
// Setup (Gmail):
//   1. Enable IMAP in Gmail → Settings → See all settings → Forwarding and POP/IMAP.
//   2. Create an App Password: Google Account → Security → 2-Step Verification → App passwords.
//   3. Fill in IMAP_HOST / IMAP_PORT / IMAP_USER / IMAP_PASS in .env.
//   4. Set companyEmail in test-users.ts to the same address as IMAP_USER.

import { ImapFlow } from 'imapflow';

export async function getImapOtp(
  sentAfter: number,
  { timeoutMs = 60_000, pollIntervalMs = 3_000 } = {},
): Promise<string> {
  const host = process.env.IMAP_HOST;
  const user = process.env.IMAP_USER;
  const pass = process.env.IMAP_PASS;
  const port = Number(process.env.IMAP_PORT ?? '993');

  if (!host || !user || !pass) {
    throw new Error('IMAP_HOST, IMAP_USER, and IMAP_PASS must all be set in .env');
  }

  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const client = new ImapFlow({ host, port, secure: true, auth: { user, pass }, logger: false });

    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');
      let otp: string | null = null;

      try {
        // IMAP SINCE is date-only; use start-of-day to cast a wide net,
        // then filter to the exact millisecond via the envelope date.
        const sinceDate = new Date(sentAfter);
        sinceDate.setHours(0, 0, 0, 0);

        // search() returns false when the inbox has no matching messages
        const seqNums = (await client.search({ since: sinceDate })) || [];

        for (const seq of [...seqNums].reverse()) { // newest first
          const msg = await client.fetchOne(`${seq}`, { envelope: true, source: true });
          if (!msg) continue;

          const receivedAt = msg.envelope?.date?.getTime() ?? 0;
          if (receivedAt < sentAfter) continue;

          otp = extractOtp(msg.source?.toString('utf-8') ?? '');
          if (otp) break;
        }
      } finally {
        lock.release();
      }

      await client.logout();
      if (otp) return otp;
    } catch {
      // Connection error — will retry after pollIntervalMs
    }

    await new Promise(r => setTimeout(r, pollIntervalMs));
  }

  throw new Error(`No OTP email found in IMAP inbox within ${timeoutMs / 1_000}s`);
}

function extractOtp(raw: string): string | null {
  // Strip MIME headers (everything before the first blank line)
  const bodyStart = raw.indexOf('\r\n\r\n');
  const body = bodyStart >= 0 ? raw.slice(bodyStart + 4) : raw;

  // If the body part is base64-encoded, decode it first
  if (/Content-Transfer-Encoding:\s*base64/i.test(raw)) {
    const decoded = Buffer.from(body.replace(/\s/g, ''), 'base64').toString('utf-8');
    const m = decoded.match(/\b(\d{6})\b/);
    if (m) return m[1];
  }

  // Quoted-printable and 7bit/8bit — digits appear verbatim
  const m = body.match(/\b(\d{6})\b/);
  return m ? m[1] : null;
}
