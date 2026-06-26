/**
 * HomePage — the store landing page (route=common/home).
 *
 * Owns the home-specific surfaces (featured products carousel/grid) and reuses
 * Header/Navigation/Footer via StorePage.
 */
import type { Locator, Page } from '@playwright/test';
import { StorePage } from '@pages/store.page';
import { ROUTES } from '@constants/routes';

export class HomePage extends StorePage {
  private readonly featuredProducts: Locator;
  private readonly bannerSlideshow: Locator;

  constructor(page: Page) {
    super(page, 'HomePage');
    this.featuredProducts = page.locator('#content .product-thumb');
    this.bannerSlideshow = page.locator('#content .swiper-viewport, #content .slideshow');
  }

  /** Opens the home page. */
  async open(): Promise<void> {
    await this.navigateTo(ROUTES.HOME);
  }

  /** Returns the names of all featured products on the home page. */
  async getFeaturedProductNames(): Promise<string[]> {
    return this.featuredProducts.locator('h4 a').allInnerTexts();
  }

  /** Opens a featured product by its visible name (title link). */
  async openFeaturedProduct(name: string): Promise<void> {
    const link = this.featuredProducts.locator('h4 a').filter({ hasText: name }).first();
    await this.click(link, `Featured product "${name}"`);
  }

  /** Whether the home banner/slideshow is rendered. */
  async hasBanner(): Promise<boolean> {
    return this.isVisible(this.bannerSlideshow.first());
  }
}
