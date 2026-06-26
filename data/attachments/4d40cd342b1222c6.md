# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: regression/currency.regression.spec.ts >> Currency >> switching currency updates the product price symbol
- Location: tests/regression/currency.regression.spec.ts:8:3

# Error details

```
Error: page.goto: Operation was cancelled; maybe frame was detached?
Call log:
  - navigating to "https://tutorialsninja.com/demo/index.php?route=common/home", waiting until "domcontentloaded"

```

# Test source

```ts
  1   | /**
  2   |  * BasePage — the reusable foundation every Page Object extends.
  3   |  *
  4   |  * Responsibility (SRP + DRY): provide a single, logged, auto-waiting wrapper
  5   |  * around the most common Playwright interactions (navigate, click, fill,
  6   |  * select, hover, upload, download, scroll, wait, read). Page Objects compose
  7   |  * these instead of re-implementing waits/logging, so behaviour is consistent
  8   |  * and traceable everywhere.
  9   |  *
  10  |  * Design rules honoured here:
  11  |  *  - NO assertions in action methods (assertions live in tests).
  12  |  *  - Every action logs its intent and surfaces a meaningful error on failure
  13  |  *    (Playwright then captures trace/video/screenshot automatically).
  14  |  *  - Methods accept Locators (web-first, auto-waiting) — never raw waits/sleeps.
  15  |  */
  16  | import type { Download, Locator, Page, Response } from '@playwright/test';
  17  | import type { Logger } from 'winston';
  18  | import { createLogger } from '@utils/logger';
  19  | import { TIMEOUTS } from '@constants/timeouts';
  20  | 
  21  | export abstract class BasePage {
  22  |   protected readonly page: Page;
  23  |   protected readonly log: Logger;
  24  | 
  25  |   protected constructor(page: Page, scope: string) {
  26  |     this.page = page;
  27  |     this.log = createLogger(scope);
  28  |   }
  29  | 
  30  |   // --------------------------------------------------------------------------
  31  |   // Internal helper — wraps every action with consistent logging + error context.
  32  |   // --------------------------------------------------------------------------
  33  | 
  34  |   /** Runs an action, logging intent on entry and enriching errors on failure. */
  35  |   protected async execute<T>(description: string, action: () => Promise<T>): Promise<T> {
  36  |     this.log.info(description);
  37  |     try {
  38  |       return await action();
  39  |     } catch (error) {
  40  |       const message = error instanceof Error ? error.message : String(error);
  41  |       this.log.error(`Failed: ${description} -> ${message}`);
  42  |       throw error instanceof Error ? error : new Error(message);
  43  |     }
  44  |   }
  45  | 
  46  |   // --------------------------------------------------------------------------
  47  |   // Navigation
  48  |   // --------------------------------------------------------------------------
  49  | 
  50  |   /** Navigates to a path relative to the configured baseURL. */
  51  |   async navigateTo(path = ''): Promise<Response | null> {
  52  |     return this.execute(`Navigate to "${path || '/'}"`, () =>
> 53  |       this.page.goto(path, { waitUntil: 'domcontentloaded' }),
      |                 ^ Error: page.goto: Operation was cancelled; maybe frame was detached?
  54  |     );
  55  |   }
  56  | 
  57  |   /** Waits until the page reaches the given load state (default: networkidle). */
  58  |   async waitForLoad(
  59  |     state: 'load' | 'domcontentloaded' | 'networkidle' = 'load',
  60  |   ): Promise<void> {
  61  |     await this.execute(`Wait for load state "${state}"`, () =>
  62  |       this.page.waitForLoadState(state),
  63  |     );
  64  |   }
  65  | 
  66  |   /** Returns the current page title. */
  67  |   async getTitle(): Promise<string> {
  68  |     return this.page.title();
  69  |   }
  70  | 
  71  |   /** Returns the current URL. */
  72  |   getUrl(): string {
  73  |     return this.page.url();
  74  |   }
  75  | 
  76  |   // --------------------------------------------------------------------------
  77  |   // Waiting
  78  |   // --------------------------------------------------------------------------
  79  | 
  80  |   /** Waits for an element to become visible. */
  81  |   async waitForVisible(locator: Locator, name: string): Promise<void> {
  82  |     await this.execute(`Wait for "${name}" to be visible`, () =>
  83  |       locator.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM }),
  84  |     );
  85  |   }
  86  | 
  87  |   /** Waits for an element to be detached/hidden. */
  88  |   async waitForHidden(locator: Locator, name: string): Promise<void> {
  89  |     await this.execute(`Wait for "${name}" to be hidden`, () =>
  90  |       locator.waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM }),
  91  |     );
  92  |   }
  93  | 
  94  |   // --------------------------------------------------------------------------
  95  |   // Interactions
  96  |   // --------------------------------------------------------------------------
  97  | 
  98  |   /** Clicks an element (auto-waits for actionability). */
  99  |   async click(locator: Locator, name: string): Promise<void> {
  100 |     await this.execute(`Click "${name}"`, () => locator.click());
  101 |   }
  102 | 
  103 |   /** Clears then fills a text field. */
  104 |   async fill(locator: Locator, value: string, name: string): Promise<void> {
  105 |     await this.execute(`Fill "${name}" with "${value}"`, () => locator.fill(value));
  106 |   }
  107 | 
  108 |   /** Types text key-by-key (use only when real keystrokes are required). */
  109 |   async type(locator: Locator, value: string, name: string): Promise<void> {
  110 |     await this.execute(`Type into "${name}"`, () => locator.pressSequentially(value));
  111 |   }
  112 | 
  113 |   /** Selects a dropdown option by its visible label. */
  114 |   async selectByLabel(locator: Locator, label: string, name: string): Promise<void> {
  115 |     await this.execute(`Select "${label}" in "${name}"`, () =>
  116 |       locator.selectOption({ label }),
  117 |     );
  118 |   }
  119 | 
  120 |   /** Selects a dropdown option by its value attribute. */
  121 |   async selectByValue(locator: Locator, value: string, name: string): Promise<void> {
  122 |     await this.execute(`Select value "${value}" in "${name}"`, () =>
  123 |       locator.selectOption({ value }),
  124 |     );
  125 |   }
  126 | 
  127 |   /** Hovers over an element. */
  128 |   async hover(locator: Locator, name: string): Promise<void> {
  129 |     await this.execute(`Hover over "${name}"`, () => locator.hover());
  130 |   }
  131 | 
  132 |   /** Checks a checkbox/radio (no-op if already checked). */
  133 |   async check(locator: Locator, name: string): Promise<void> {
  134 |     await this.execute(`Check "${name}"`, () => locator.check());
  135 |   }
  136 | 
  137 |   /** Unchecks a checkbox (no-op if already unchecked). */
  138 |   async uncheck(locator: Locator, name: string): Promise<void> {
  139 |     await this.execute(`Uncheck "${name}"`, () => locator.uncheck());
  140 |   }
  141 | 
  142 |   /** Presses a keyboard key while focused on an element. */
  143 |   async pressKey(locator: Locator, key: string, name: string): Promise<void> {
  144 |     await this.execute(`Press "${key}" on "${name}"`, () => locator.press(key));
  145 |   }
  146 | 
  147 |   /** Scrolls an element into the viewport. */
  148 |   async scrollIntoView(locator: Locator, name: string): Promise<void> {
  149 |     await this.execute(`Scroll "${name}" into view`, () =>
  150 |       locator.scrollIntoViewIfNeeded(),
  151 |     );
  152 |   }
  153 | 
```