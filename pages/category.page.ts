/**
 * CategoryPage — a category product listing (route=product/category).
 *
 * Reached by navigating the main menu. Exposes the active breadcrumb and the
 * product grid so tests can assert navigation landed correctly.
 */
import type { Locator, Page } from '@playwright/test';
import { StorePage } from '@pages/store.page';

export class CategoryPage extends StorePage {
  private readonly activeBreadcrumb: Locator;
  private readonly products: Locator;

  constructor(page: Page) {
    super(page, 'CategoryPage');
    this.activeBreadcrumb = page.locator('ul.breadcrumb li').last();
    this.products = page.locator('#content .product-thumb');
  }

  /** Returns the last (active) breadcrumb segment, e.g. the category name. */
  async getActiveBreadcrumb(): Promise<string> {
    return this.getText(this.activeBreadcrumb, 'Active breadcrumb');
  }

  /** Returns the number of products listed on the category page. */
  async getProductCount(): Promise<number> {
    return this.count(this.products);
  }

  /** Returns the names of products listed on the category page. */
  async getProductNames(): Promise<string[]> {
    return this.products.locator('h4 a').allInnerTexts();
  }
}
