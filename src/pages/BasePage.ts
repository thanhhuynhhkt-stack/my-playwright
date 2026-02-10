/**
 * Abstract base page object.
 * All page objects extend this class to inherit common navigation,
 * wait, screenshot, and interaction methods.
 *
 * Pages are group-agnostic — they handle UI interactions only.
 * Group-specific logic lives in flows and steps.
 */

import { Page, Locator, expect } from '@playwright/test';
import { Logger } from '../utils/Logger';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly logger: Logger;

  /** Subclasses must define their page URL path */
  protected abstract readonly path: string;

  constructor(page: Page, logger: Logger) {
    this.page = page;
    this.logger = logger;
  }

  /**
   * Navigates to this page using the configured base URL + page path.
   */
  async navigate(): Promise<void> {
    this.logger.info(`Navigating to: ${this.path}`);
    await this.page.goto(this.path);
    await this.waitForPageLoad();
  }

  /**
   * Waits for the page to finish loading.
   * Override in subclasses for pages with specific load indicators.
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Returns the current page URL.
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Returns the page title.
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Fills a form field identified by a locator.
   */
  async fill(locator: Locator, value: string): Promise<void> {
    this.logger.debug(`Filling field with value: ${value.slice(0, 20)}...`);
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Clicks an element with logging.
   */
  async click(locator: Locator, description?: string): Promise<void> {
    this.logger.debug(`Clicking: ${description || 'element'}`);
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Selects an option from a dropdown.
   */
  async selectOption(locator: Locator, value: string): Promise<void> {
    this.logger.debug(`Selecting option: ${value}`);
    await locator.selectOption(value);
  }

  /**
   * Checks if an element is visible on the page.
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Gets text content of an element.
   */
  async getText(locator: Locator): Promise<string> {
    const text = await locator.textContent();
    return text?.trim() || '';
  }

  /**
   * Asserts that an element is visible.
   */
  async expectVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible();
  }

  /**
   * Asserts that an element contains specific text.
   */
  async expectText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toContainText(text);
  }

  /**
   * Asserts that an element has a specific CSS class.
   * Useful for real-time validation feedback (e.g., password strength indicators).
   */
  async expectHasClass(locator: Locator, className: string): Promise<void> {
    await expect(locator).toHaveClass(new RegExp(className));
  }

  /**
   * Asserts that an element has a specific CSS property value.
   * Useful for verifying dynamic style changes.
   */
  async expectCssProperty(
    locator: Locator,
    property: string,
    value: string
  ): Promise<void> {
    await expect(locator).toHaveCSS(property, value);
  }

  /**
   * Waits for an element to appear within a timeout.
   */
  async waitForElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Waits for navigation to complete after an action.
   */
  async waitForNavigation(action: () => Promise<void>): Promise<void> {
    await Promise.all([this.page.waitForNavigation(), action()]);
  }
}
