# my-playwright

Simple Playwright test automation project. Built to be easy to understand and modify,
especially for teams coming from manual QC testing.

Read `GUIDE.md` for a full explanation of how everything works and how to add new tests.

## Quick start

```bash
npm install
npx playwright install
cp .env.example .env
npm test
```

## Run specific tests

```bash
npm run test:chrome          # Chrome only
npm run test:smoke           # Smoke tests only
npm run test:regression      # All regression tests
npm run test:headed          # Watch tests run in browser
npm run report               # Open HTML report
```

## Project structure

```
pages/       -- Page objects (one per page in the app)
helpers/     -- Test setup, test users, mock helpers
tests/       -- Test files organized by feature
```

---

## Gmail API setup (required for Group 2 registration test)

The Group 2 registration flow sends a real OTP to a Gmail inbox. The test reads that OTP
automatically via the Gmail REST API over HTTPS — this works on any network, including
corporate ones that block IMAP (port 993).

You need to complete this setup **once**. After that, the test runs without any manual steps.

### What you will need

- A Gmail account dedicated to testing (e.g. `yourname.test@gmail.com`)
- A Google account that can create Google Cloud projects (can be the same account)

---

### Step 1 — Create a Google Cloud project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click the project selector at the top → **New Project**
3. Give it a name (e.g. `playwright-tests`) → click **Create**
4. Make sure the new project is selected in the top bar before continuing

---

### Step 2 — Enable the Gmail API

1. In the left sidebar go to **APIs & Services → Library**
2. Search for **Gmail API**
3. Click on it → click **Enable**

---

### Step 3 — Configure the OAuth consent screen

1. In the left sidebar go to **APIs & Services → OAuth consent screen**
   (in newer Google Cloud UI this is called **Audience**)
2. Choose **External** → click **Create**
3. Fill in the required fields:
   - App name: anything (e.g. `Playwright Tests`)
   - User support email: your email
   - Developer contact email: your email
4. Click **Save and Continue** through the remaining steps (Scopes, Test users) — you will add a test user in the next step
5. On the **Test users** section, click **Add users**
6. Enter the Gmail address that will receive the OTP (e.g. `yourname.test@gmail.com`)
7. Click **Save**

> **Why this step?** While the app is in Testing mode (not published), Google only allows
> explicitly whitelisted accounts to sign in. Skipping this causes `Error 403: access_denied`.

---

### Step 4 — Create OAuth 2.0 credentials

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Web application**
   > Must be Web application — Desktop app does not support custom redirect URIs,
   > which are required by the OAuth Playground in the next step.
4. Under **Authorized redirect URIs** → click **Add URI** → paste:
   ```
   https://developers.google.com/oauthplayground
   ```
5. Click **Create**
6. Copy the **Client ID** and **Client Secret** shown in the confirmation dialog
   (you can also find them later under the credential's detail page)

---

### Step 5 — Get a refresh token via OAuth Playground

1. Open [https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
2. Click the **gear icon ⚙** (top right) → tick **"Use your own OAuth credentials"**
3. Paste your **Client ID** and **Client Secret** from Step 4 → close the panel
4. In the left panel, scroll to **Gmail API v1** → tick:
   ```
   https://www.googleapis.com/auth/gmail.readonly
   ```
5. Click **Authorize APIs** → a Google sign-in window opens
6. Sign in with the Gmail account you added as a test user in Step 3
7. Grant the requested permission
8. Back in the Playground, click **Exchange authorization code for tokens**
9. Copy the value of **refresh_token** from the response

> **Important:** the `access_token` expires in 1 hour. The `refresh_token` does not expire
> and is what the test helper uses to get a fresh access token on each run.

---

### Step 6 — Add credentials to `.env`

Open your `.env` file and fill in the three values:

```env
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
GMAIL_REFRESH_TOKEN=1//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Also set `TEST_COMPANY_EMAIL` to the same Gmail address — this is entered in the registration
form as the company email so the OTP lands in the inbox the helper is reading:

```env
TEST_COMPANY_EMAIL=yourname.test@gmail.com
```

---

### Step 7 — Verify the setup

Run only the Group 2 test to confirm everything is wired up:

```bash
npx playwright test tests/registration/registration-group2.spec.ts --project=chromium --headed
```

A passing run means:
- The registration form submitted successfully
- The Gmail API found the OTP email
- The OTP was entered and accepted
- The account was created and the success screen appeared

---

### Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Error 400: redirect_uri_mismatch` | OAuth Playground URL not in allowed redirect URIs | Add `https://developers.google.com/oauthplayground` to the credential's Authorized redirect URIs (Step 4) |
| `Error 403: access_denied` | Gmail account not added as a test user | Add the account under OAuth consent screen → Test users (Step 3) |
| `GMAIL_CLIENT_ID … must be set in .env` | Env vars missing or `.env` not saved | Check `.env` has all three values and is saved |
| `Failed to get Gmail access token` | Wrong Client ID / Secret / expired refresh token | Re-check values in `.env`; if refresh token expired, repeat Step 5 |
| `No OTP email found in Gmail within 60s` | OTP email never arrived or arrived in wrong inbox | Confirm `TEST_COMPANY_EMAIL` in `.env` matches the email entered in the registration form |
