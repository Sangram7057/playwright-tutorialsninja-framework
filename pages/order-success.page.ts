/**
 * OrderSuccessPage — the post-checkout confirmation (route=checkout/success).
 *
 * Reached after a successful order placement. Exposes the confirmation heading
 * so tests can assert the order completed.
 */
import type { Locator, Page } from '@playwright/test';
import { StorePage } from '@pages/store.page';

export class OrderSuccessPage extends StorePage {
  private readonly confirmationHeading: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    super(page, 'OrderSuccessPage');
    const content = page.locator('#content');
    this.confirmationHeading = content.getByRole('heading', {
      name: 'Your Order Has Been Placed!',
    });
    this.continueButton = content.getByRole('link', { name: 'Continue' });
  }

  /** Whether the order-confirmation heading is shown. */
  async isOrderPlaced(): Promise<boolean> {
    return this.isVisible(this.confirmationHeading);
  }

  /** Clicks the post-order Continue button (returns home). */
  async continue(): Promise<void> {
    await this.click(this.continueButton, 'Continue button');
  }
}
