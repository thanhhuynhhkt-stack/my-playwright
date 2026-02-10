/**
 * Screenshot capture and attachment helper.
 * Captures full-page screenshots on failure and attaches them to the report.
 * Filename format: {timestamp}_{browserName}_{testTitle}.png
 */

import { Page, TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export class ScreenshotHelper {
  private readonly screenshotDir: string;

  constructor(screenshotDir?: string) {
    this.screenshotDir = screenshotDir || path.resolve(process.cwd(), 'reports', 'screenshots');
    fs.mkdirSync(this.screenshotDir, { recursive: true });
  }

  /**
   * Captures a failure screenshot and attaches it to the test report.
   * Should be called in afterEach fixture when test has failed.
   */
  async captureOnFailure(
    page: Page,
    testInfo: TestInfo,
    browserName: string
  ): Promise<string | undefined> {
    if (testInfo.status === testInfo.expectedStatus) {
      return undefined;
    }

    return this.capture(page, testInfo, browserName, 'failure-screenshot');
  }

  /**
   * Captures a screenshot at any point and attaches it to the report.
   */
  async capture(
    page: Page,
    testInfo: TestInfo,
    browserName: string,
    attachmentName: string = 'screenshot'
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedTitle = testInfo.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80);
    const filename = `${timestamp}_${browserName}_${sanitizedTitle}.png`;
    const filepath = path.join(this.screenshotDir, filename);

    const screenshot = await page.screenshot({ fullPage: true });

    fs.writeFileSync(filepath, screenshot);

    await testInfo.attach(attachmentName, {
      body: screenshot,
      contentType: 'image/png',
    });

    return filepath;
  }
}
