/**
 * SearchResultsPage — product search results (route=product/search).
 *
 * Reads the result grid and lets tests open a specific product. The actual
 * search term is entered via HeaderComponent.searchFor().
 */
import type { Locator, Page } from '@playwright/test';
import { StorePage } from '@pages/store.page';

export class SearchResultsPage extends StorePage {
  private readonly products: Locator;
  private readonly productTitles: Locator;
  private readonly noResultsText: Locator;

  constructor(page: Page) {
    super(page, 'SearchResultsPage');
    const content = page.locator('#content');
    this.products = content.locator('.product-thumb');
    this.productTitles = this.products.locator('h4 a');
    this.noResultsText = content.getByText('There are no products to display.');
  }

  /** Returns the number of products in the result grid. */
  async getResultCount(): Promise<number> {
    return this.count(this.products);
  }

  /** Returns the names of all products in the result grid. */
  async getProductNames(): Promise<string[]> {
    return this.productTitles.allInnerTexts();
  }

  /** Whether a product with the given name appears in the results. */
  async isProductListed(name: string): Promise<boolean> {
    return this.isVisible(this.productTitles.filter({ hasText: name }).first());
  }

  /** Opens a product from the results by its visible name (title link). */
  async openProduct(name: string): Promise<void> {
    const link = this.productTitles.filter({ hasText: name }).first();
    await this.click(link, `Product "${name}"`);
  }

  /** Whether the "no products" empty-state message is shown. */
  async hasNoResults(): Promise<boolean> {
    return this.isVisible(this.noResultsText);
  }
}
