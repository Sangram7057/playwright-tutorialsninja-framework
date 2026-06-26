/**
 * CartPage — shopping cart (route=checkout/cart).
 *
 * Reads line items + totals and supports quantity update / removal /
 * proceed-to-checkout. Assertions are left to tests.
 */
import type { Locator, Page } from '@playwright/test';
import { StorePage } from '@pages/store.page';
import { ROUTES } from '@constants/routes';

export class CartPage extends StorePage {
  private readonly rows: Locator;
  private readonly productLinks: Locator;
  private readonly totalsTable: Locator;
  private readonly checkoutButton: Locator;
  private readonly emptyText: Locator;

  constructor(page: Page) {
    super(page, 'CartPage');
    const content = page.locator('#content');
    this.rows = content.locator('.table-responsive table tbody tr');
    this.productLinks = this.rows.locator('td.text-left a');
    this.totalsTable = content.locator('table.table tbody').last();
    this.checkoutButton = content.getByRole('link', { name: 'Checkout' });
    this.emptyText = content.getByText('Your shopping cart is empty!');
  }

  /** Opens the cart page directly. */
  async open(): Promise<void> {
    await this.navigateTo(ROUTES.CART);
  }

  /** Returns the names of products in the cart. */
  async getProductNames(): Promise<string[]> {
    if (await this.isEmpty()) {
      return [];
    }
    return this.productLinks.allInnerTexts();
  }

  /** Whether a product is present in the cart. */
  async hasProduct(name: string): Promise<boolean> {
    return this.isVisible(this.productLinks.filter({ hasText: name }).first());
  }

  /** Updates the quantity for a product row and applies the change. */
  async updateQuantity(name: string, quantity: number): Promise<void> {
    const row = this.rows.filter({ hasText: name });
    const quantityInput = row.locator('input[type="text"]');
    const updateButton = row.locator('button[data-original-title="Update"]');
    await this.fill(quantityInput, String(quantity), `Quantity for "${name}"`);
    await this.click(updateButton, `Update "${name}"`);
  }

  /** Removes a product row from the cart. */
  async removeProduct(name: string): Promise<void> {
    const row = this.rows.filter({ hasText: name });
    const removeButton = row.locator('button[data-original-title="Remove"]');
    await this.click(removeButton, `Remove "${name}"`);
  }

  /** Returns the rendered totals block text (Sub-Total / Total etc.). */
  async getTotalsText(): Promise<string> {
    return this.getText(this.totalsTable, 'Cart totals');
  }

  /** Proceeds to the checkout flow. */
  async proceedToCheckout(): Promise<void> {
    await this.click(this.checkoutButton, 'Checkout button');
  }

  /** Whether the cart is empty. */
  async isEmpty(): Promise<boolean> {
    return this.isVisible(this.emptyText);
  }
}
