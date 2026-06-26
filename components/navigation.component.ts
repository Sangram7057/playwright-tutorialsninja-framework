/**
 * NavigationComponent — the main category menu bar (#menu).
 *
 * Responsibility (SRP): own navigation across the top-level category menu and
 * its hover-revealed sub-categories. Category names are passed as arguments so
 * the same small methods cover every category (DRY) — no per-category copies.
 */
import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

/** Top-level categories in the demo store's main menu. */
export const MAIN_CATEGORY = {
  DESKTOPS: 'Desktops',
  LAPTOPS_NOTEBOOKS: 'Laptops & Notebooks',
  COMPONENTS: 'Components',
  TABLETS: 'Tablets',
  SOFTWARE: 'Software',
  PHONES_PDAS: 'Phones & PDAs',
  CAMERAS: 'Cameras',
  MP3_PLAYERS: 'MP3 Players',
} as const;

export type MainCategory = (typeof MAIN_CATEGORY)[keyof typeof MAIN_CATEGORY];

export class NavigationComponent extends BasePage {
  private readonly menu: Locator;

  constructor(page: Page) {
    super(page, 'Navigation');
    this.menu = page.locator('#menu');
  }

  /** Returns the top-level link locator for a category. */
  private categoryLink(category: string): Locator {
    return this.menu.getByRole('link', { name: category, exact: true });
  }

  /** Clicks a top-level category to open its listing page. */
  async openCategory(category: MainCategory): Promise<void> {
    await this.click(this.categoryLink(category), `Category "${category}"`);
  }

  /** Hovers a category to reveal its sub-menu (without navigating). */
  async hoverCategory(category: MainCategory): Promise<void> {
    await this.hover(this.categoryLink(category), `Category "${category}"`);
  }

  /**
   * Hovers a parent category and clicks one of its sub-category links.
   * Works for any category that exposes a dropdown (e.g. Desktops > PC).
   */
  async openSubCategory(parent: MainCategory, subCategory: string): Promise<void> {
    await this.hoverCategory(parent);
    const subLink = this.menu.getByRole('link', { name: subCategory, exact: true });
    await this.click(subLink, `Sub-category "${subCategory}"`);
  }

  /** Returns true if a top-level category is visible in the menu. */
  async hasCategory(category: MainCategory): Promise<boolean> {
    return this.isVisible(this.categoryLink(category));
  }
}
