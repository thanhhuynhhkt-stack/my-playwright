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
