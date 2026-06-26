/**
 * BasePage — the reusable foundation every Page Object extends.
 *
 * Responsibility (SRP + DRY): provide a single, logged, auto-waiting wrapper
 * around the most common Playwright interactions (navigate, click, fill,
 * select, hover, upload, download, scroll, wait, read). Page Objects compose
 * these instead of re-implementing waits/logging, so behaviour is consistent
 * and traceable everywhere.
 *
 * Design rules honoured here:
 *  - NO assertions in action methods (assertions live in tests).
 *  - Every action logs its intent and surfaces a meaningful error on failure
 *    (Playwright then captures trace/video/screenshot automatically).
 *  - Methods accept Locators (web-first, auto-waiting) — never raw waits/sleeps.
 */
import type { Download, Locator, Page, Response } from '@playwright/test';
import type { Logger } from 'winston';
import { createLogger } from '@utils/logger';
import { TIMEOUTS } from '@constants/timeouts';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly log: Logger;

  protected constructor(page: Page, scope: string) {
    this.page = page;
    this.log = createLogger(scope);
  }

  // --------------------------------------------------------------------------
  // Internal helper — wraps every action with consistent logging + error context.
  // --------------------------------------------------------------------------

  /** Runs an action, logging intent on entry and enriching errors on failure. */
  protected async execute<T>(description: string, action: () => Promise<T>): Promise<T> {
    this.log.info(description);
    try {
      return await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.log.error(`Failed: ${description} -> ${message}`);
      throw error instanceof Error ? error : new Error(message);
    }
  }

  // --------------------------------------------------------------------------
  // Navigation
  // --------------------------------------------------------------------------

  /** Navigates to a path relative to the configured baseURL. */
  async navigateTo(path = ''): Promise<Response | null> {
    return this.execute(`Navigate to "${path || '/'}"`, () =>
      this.page.goto(path, { waitUntil: 'domcontentloaded' }),
    );
  }

  /** Waits until the page reaches the given load state (default: networkidle). */
  async waitForLoad(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'load',
  ): Promise<void> {
    await this.execute(`Wait for load state "${state}"`, () =>
      this.page.waitForLoadState(state),
    );
  }

  /** Returns the current page title. */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Returns the current URL. */
  getUrl(): string {
    return this.page.url();
  }

  // --------------------------------------------------------------------------
  // Waiting
  // --------------------------------------------------------------------------

  /** Waits for an element to become visible. */
  async waitForVisible(locator: Locator, name: string): Promise<void> {
    await this.execute(`Wait for "${name}" to be visible`, () =>
      locator.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM }),
    );
  }

  /** Waits for an element to be detached/hidden. */
  async waitForHidden(locator: Locator, name: string): Promise<void> {
    await this.execute(`Wait for "${name}" to be hidden`, () =>
      locator.waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM }),
    );
  }

  // --------------------------------------------------------------------------
  // Interactions
  // --------------------------------------------------------------------------

  /** Clicks an element (auto-waits for actionability). */
  async click(locator: Locator, name: string): Promise<void> {
    await this.execute(`Click "${name}"`, () => locator.click());
  }

  /** Clears then fills a text field. */
  async fill(locator: Locator, value: string, name: string): Promise<void> {
    await this.execute(`Fill "${name}" with "${value}"`, () => locator.fill(value));
  }

  /** Types text key-by-key (use only when real keystrokes are required). */
  async type(locator: Locator, value: string, name: string): Promise<void> {
    await this.execute(`Type into "${name}"`, () => locator.pressSequentially(value));
  }

  /** Selects a dropdown option by its visible label. */
  async selectByLabel(locator: Locator, label: string, name: string): Promise<void> {
    await this.execute(`Select "${label}" in "${name}"`, () =>
      locator.selectOption({ label }),
    );
  }

  /** Selects a dropdown option by its value attribute. */
  async selectByValue(locator: Locator, value: string, name: string): Promise<void> {
    await this.execute(`Select value "${value}" in "${name}"`, () =>
      locator.selectOption({ value }),
    );
  }

  /** Hovers over an element. */
  async hover(locator: Locator, name: string): Promise<void> {
    await this.execute(`Hover over "${name}"`, () => locator.hover());
  }

  /** Checks a checkbox/radio (no-op if already checked). */
  async check(locator: Locator, name: string): Promise<void> {
    await this.execute(`Check "${name}"`, () => locator.check());
  }

  /** Unchecks a checkbox (no-op if already unchecked). */
  async uncheck(locator: Locator, name: string): Promise<void> {
    await this.execute(`Uncheck "${name}"`, () => locator.uncheck());
  }

  /** Presses a keyboard key while focused on an element. */
  async pressKey(locator: Locator, key: string, name: string): Promise<void> {
    await this.execute(`Press "${key}" on "${name}"`, () => locator.press(key));
  }

  /** Scrolls an element into the viewport. */
  async scrollIntoView(locator: Locator, name: string): Promise<void> {
    await this.execute(`Scroll "${name}" into view`, () =>
      locator.scrollIntoViewIfNeeded(),
    );
  }

  // --------------------------------------------------------------------------
  // Upload / Download
  // --------------------------------------------------------------------------

  /** Uploads one or more files to an <input type="file"> element. */
  async uploadFiles(
    locator: Locator,
    files: string | string[],
    name: string,
  ): Promise<void> {
    await this.execute(`Upload file(s) to "${name}"`, () => locator.setInputFiles(files));
  }

  /**
   * Triggers a download by clicking `trigger` and returns the Download object.
   * The caller decides where/whether to persist it.
   */
  async downloadFile(trigger: Locator, name: string): Promise<Download> {
    return this.execute(`Download file via "${name}"`, async () => {
      const [download] = await Promise.all([
        this.page.waitForEvent('download', { timeout: TIMEOUTS.DOWNLOAD }),
        trigger.click(),
      ]);
      return download;
    });
  }

  // --------------------------------------------------------------------------
  // Reads (no assertions — just data retrieval for the test to assert on)
  // --------------------------------------------------------------------------

  /** Returns trimmed inner text of an element. */
  async getText(locator: Locator, name: string): Promise<string> {
    return this.execute(`Read text of "${name}"`, async () =>
      (await locator.innerText()).trim(),
    );
  }

  /** Returns the value of an input element. */
  async getInputValue(locator: Locator, name: string): Promise<string> {
    return this.execute(`Read value of "${name}"`, () => locator.inputValue());
  }

  /** Returns whether an element is currently visible (does not throw/wait long). */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /** Returns the number of elements matching the locator. */
  async count(locator: Locator): Promise<number> {
    return locator.count();
  }
}
