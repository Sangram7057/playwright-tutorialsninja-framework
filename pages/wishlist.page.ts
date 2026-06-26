/**
 * WishlistPage — the customer's wish list (route=account/wishlist).
 *
 * Requires an authenticated session. Reads listed products and supports
 * removing items; assertions live in tests.
 */
import type { Locator, Page } from '@playwright/test';
import { StorePage } from '@pages/store.page';
import { ROUTES } from '@constants/routes';

export class WishlistPage extends StorePage {
  private readonly rows: Locator;
  private readonly productLinks: Locator;
  private readonly emptyText: Locator;

  constructor(page: Page) {
    super(page, 'WishlistPage');
    const content = page.locator('#content');
    this.rows = content.locator('table tbody tr');
    this.productLinks = this.rows.locator('td.text-left a');
    this.emptyText = content.getByText('Your wish list is empty.');
  }

  /** Opens the wishlist page directly. */
  async open(): Promise<void> {
    await this.navigateTo(ROUTES.WISHLIST);
  }

  /** Returns the names of products in the wishlist. */
  async getProductNames(): Promise<string[]> {
    if (await this.isEmpty()) {
      return [];
    }
    return this.productLinks.allInnerTexts();
  }

  /** Whether a product is present in the wishlist. */
  async hasProduct(name: string): Promise<boolean> {
    return this.isVisible(this.productLinks.filter({ hasText: name }).first());
  }

  /** Removes a product from the wishlist by name. */
  async removeProduct(name: string): Promise<void> {
    const row = this.rows.filter({ hasText: name });
    const removeButton = row.locator('button[data-original-title="Remove"]');
    await this.click(removeButton, `Remove "${name}" from wishlist`);
  }

  /** Whether the wishlist is empty. */
  async isEmpty(): Promise<boolean> {
    return this.isVisible(this.emptyText);
  }
}
