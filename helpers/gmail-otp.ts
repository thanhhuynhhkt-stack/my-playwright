// Gmail API OTP helper.
//
// Uses the Gmail REST API (HTTPS/443) to poll for an OTP email — works on
// corporate networks where IMAP port 993 is blocked.
//
// One-time setup:
//   1. console.cloud.google.com → enable Gmail API on your project.
//   2. Create an OAuth2 "Desktop app" credential → note client_id and client_secret.
//   3. Open https://developers.google.com/oauthplayground
//      - Gear icon → "Use your own OAuth credentials" → paste client_id + client_secret
//      - Scope: https://www.googleapis.com/auth/gmail.readonly → Authorize → sign in
//      - "Exchange authorization code for tokens" → copy the refresh_token
//   4. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN in .env.

import 'dotenv/config';

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

async function getAccessToken(): Promise<string> {
  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  });
  const data = (await resp.json()) as { access_token?: string; error?: string };
  if (!data.access_token) throw new Error(`Failed to get Gmail access token: ${data.error}`);
  return data.access_token;
}

export async function getGmailOtp(
  sentAfter: number,
  { timeoutMs = 60_000, pollIntervalMs = 3_000 } = {},
): Promise<string> {
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
    throw new Error('GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN must be set in .env');
  }

  // Gmail API `after:` filter uses Unix seconds
  const afterUnixSec = Math.floor(sentAfter / 1_000);
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const token = await getAccessToken();

    const listResp = await fetch(
      `${GMAIL_API}/users/me/messages?q=${encodeURIComponent(`after:${afterUnixSec}`)}&maxResults=10`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const listData = (await listResp.json()) as { messages?: Array<{ id: string }> };

    for (const { id } of listData.messages ?? []) {
      const msgResp = await fetch(
        `${GMAIL_API}/users/me/messages/${id}?format=full`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const msg = (await msgResp.json()) as { payload?: GmailPayload };
      const body = extractBody(msg.payload);
      const match = body.match(/\b(\d{6})\b/);
      if (match) return match[1];
    }

    await new Promise(r => setTimeout(r, pollIntervalMs));
  }

  throw new Error(`No OTP email found in Gmail within ${timeoutMs / 1_000}s`);
}

interface GmailPayload {
  body?: { data?: string };
  parts?: GmailPayload[];
  mimeType?: string;
}

function extractBody(payload: GmailPayload | undefined): string {
  if (!payload) return '';
  if (payload.body?.data) {
    // Gmail uses base64url encoding
    return Buffer.from(payload.body.data, 'base64url').toString('utf-8');
  }
  for (const part of payload.parts ?? []) {
    const text = extractBody(part);
    if (text) return text;
  }
  return '';
}
