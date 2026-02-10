/**
 * Custom Playwright Reporter implementation.
 * Thread-safe: collects per-worker data and merges in onEnd().
 * Outputs a JSON summary for CI integration.
 */

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import { RunSummary, TestResultSummary } from '../data/types';

class CustomReporter implements Reporter {
  private results: TestResultSummary[] = [];
  private startTime = '';
  private outputDir: string;

  constructor(options?: { outputDir?: string }) {
    this.outputDir = options?.outputDir || path.resolve(process.cwd(), 'reports');
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.startTime = new Date().toISOString();
    const totalTests = suite.allTests().length;
    console.log(`\n[CustomReporter] Starting test run: ${totalTests} tests across ${config.projects.length} projects\n`);
  }

  onTestBegin(test: TestCase): void {
    const browserName = test.parent.project()?.name || 'unknown';
    console.log(`  [${browserName}] Running: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const browserName = test.parent.project()?.name || 'unknown';
    const status = result.status as TestResultSummary['status'];

    const summary: TestResultSummary = {
      testName: test.title,
      status,
      duration: result.duration,
      browser: browserName,
      retries: result.retry,
    };

    if (result.error) {
      summary.error = result.error.message;
    }

    // Check for screenshot attachments
    const screenshotAttachment = result.attachments.find(
      (a) => a.name === 'failure-screenshot'
    );
    if (screenshotAttachment?.path) {
      summary.screenshotPath = screenshotAttachment.path;
    }

    this.results.push(summary);

    const icon = status === 'passed' ? 'PASS' : status === 'failed' ? 'FAIL' : status.toUpperCase();
    console.log(`  [${browserName}] ${icon}: ${test.title} (${result.duration}ms)`);
  }

  async onEnd(result: FullResult): Promise<void> {
    const endTime = new Date().toISOString();

    const summary: RunSummary = {
      totalTests: this.results.length,
      passed: this.results.filter((r) => r.status === 'passed').length,
      failed: this.results.filter((r) => r.status === 'failed').length,
      skipped: this.results.filter((r) => r.status === 'skipped').length,
      timedOut: this.results.filter((r) => r.status === 'timedOut').length,
      duration: result.duration,
      startTime: this.startTime,
      endTime,
      results: this.results,
    };

    // Print summary to console
    console.log('\n========== TEST RUN SUMMARY ==========');
    console.log(`Total:   ${summary.totalTests}`);
    console.log(`Passed:  ${summary.passed}`);
    console.log(`Failed:  ${summary.failed}`);
    console.log(`Skipped: ${summary.skipped}`);
    console.log(`Timed Out: ${summary.timedOut}`);
    console.log(`Duration: ${(summary.duration / 1000).toFixed(1)}s`);
    console.log('=======================================\n');

    // Write JSON summary for CI integration
    fs.mkdirSync(this.outputDir, { recursive: true });
    const summaryPath = path.join(this.outputDir, 'custom-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`[CustomReporter] Summary written to: ${summaryPath}`);
  }
}

export default CustomReporter;
