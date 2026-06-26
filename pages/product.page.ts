/**
 * ProductPage — product details (route=product/product).
 *
 * Owns add-to-cart / add-to-wishlist / quantity actions and exposes the
 * success banner + product metadata for tests to assert on.
 */
import type { Locator, Page } from '@playwright/test';
import { StorePage } from '@pages/store.page';
import { TIMEOUTS } from '@constants/timeouts';

export class ProductPage extends StorePage {
  private readonly productTitle: Locator;
  private readonly priceLabel: Locator;
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;
  private readonly addToWishlistButton: Locator;
  private readonly addToCompareButton: Locator;
  private readonly successAlert: Locator;

  constructor(page: Page) {
    super(page, 'ProductPage');
    const content = page.locator('#content');
    this.productTitle = content.locator('h1');
    this.priceLabel = content.locator('.price, ul.list-unstyled .price-new').first();
    this.quantityInput = page.locator('#input-quantity');
    this.addToCartButton = page.locator('#button-cart');
    this.addToWishlistButton = content.locator(
      'button[data-original-title="Add to Wish List"]',
    );
    this.addToCompareButton = content.locator(
      'button[data-original-title="Compare this Product"]',
    );
    this.successAlert = page.locator('.alert-success').first();
  }

  /** Returns the product name (page H1). */
  async getProductName(): Promise<string> {
    return this.getText(this.productTitle, 'Product title');
  }

  /** Returns the displayed price text. */
  async getPrice(): Promise<string> {
    return this.getText(this.priceLabel, 'Product price');
  }

  /** Sets the desired quantity before adding to cart. */
  async setQuantity(quantity: number): Promise<void> {
    await this.fill(this.quantityInput, String(quantity), 'Quantity');
  }

  /** Adds the product to the cart. */
  async addToCart(): Promise<void> {
    await this.click(this.addToCartButton, 'Add to Cart');
  }

  /** Adds the product to the wishlist (requires login for persistence). */
  async addToWishlist(): Promise<void> {
    await this.click(this.addToWishlistButton, 'Add to Wish List');
  }

  /** Adds the product to the comparison list. */
  async addToCompare(): Promise<void> {
    await this.click(this.addToCompareButton, 'Add to Compare');
  }

  /**
   * Waits for and returns the add-to-cart success banner text. The banner is
   * rendered asynchronously after the AJAX add, so we wait for it explicitly.
   * Returns an empty string if it never appears within the timeout.
   */
  async getSuccessMessage(): Promise<string> {
    try {
      await this.successAlert.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    } catch {
      return '';
    }
    return this.getText(this.successAlert, 'Success banner');
  }
}
