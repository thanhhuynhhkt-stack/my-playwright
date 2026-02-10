/**
 * Instance-based, thread-safe logger.
 * Each worker gets its own Logger instance via fixture injection.
 * Buffers log entries per-worker to prevent interleaving in parallel execution.
 *
 * Log format: [LEVEL] [TIMESTAMP] [WORKER-ID] [BROWSER] message
 */

import fs from 'fs';
import path from 'path';
import { LogEntry } from '../data/types';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  private readonly workerId: string;
  private readonly browserName: string;
  private readonly minLevel: LogLevel;
  private readonly buffer: LogEntry[] = [];
  private readonly logFilePath: string;

  constructor(options: {
    workerId: string;
    browserName: string;
    minLevel?: LogLevel;
    logDir?: string;
  }) {
    this.workerId = options.workerId;
    this.browserName = options.browserName;
    this.minLevel = options.minLevel || 'info';

    const logDir = options.logDir || path.resolve(process.cwd(), 'reports', 'logs');
    fs.mkdirSync(logDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFilePath = path.join(logDir, `test-run-${timestamp}-worker-${this.workerId}.log`);
  }

  debug(message: string): void {
    this.log('debug', message);
  }

  info(message: string): void {
    this.log('info', message);
  }

  warn(message: string): void {
    this.log('warn', message);
  }

  error(message: string, error?: Error): void {
    this.log('error', message, error);
  }

  /**
   * Returns all buffered log entries for the current worker.
   * Useful for attaching logs to test reports.
   */
  getBuffer(): LogEntry[] {
    return [...this.buffer];
  }

  /**
   * Returns buffered entries as a formatted string and clears the buffer.
   * Called at the end of each test to attach logs to the report.
   */
  flushBuffer(): string {
    const formatted = this.buffer.map((entry) => this.formatEntry(entry)).join('\n');
    this.buffer.length = 0;
    return formatted;
  }

  /**
   * Writes a test boundary marker to the log.
   */
  testStart(testName: string): void {
    this.info(`========== TEST START: ${testName} ==========`);
  }

  testEnd(testName: string, status: string, durationMs: number): void {
    this.info(
      `========== TEST END: ${testName} | Status: ${status} | Duration: ${durationMs}ms ==========`
    );
  }

  private log(level: LogLevel, message: string, error?: Error): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      workerId: this.workerId,
      browser: this.browserName,
      message,
      error,
    };

    this.buffer.push(entry);

    const formatted = this.formatEntry(entry);

    // Console output
    console.log(formatted);

    // File output (append, non-blocking)
    fs.appendFile(this.logFilePath, formatted + '\n', () => {
      // Fire-and-forget write
    });
  }

  private formatEntry(entry: LogEntry): string {
    const level = entry.level.toUpperCase().padEnd(5);
    let line = `[${level}] [${entry.timestamp}] [${entry.workerId}] [${entry.browser}] ${entry.message}`;

    if (entry.error) {
      line += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        line += `\n  Stack: ${entry.error.stack}`;
      }
    }

    return line;
  }
}
