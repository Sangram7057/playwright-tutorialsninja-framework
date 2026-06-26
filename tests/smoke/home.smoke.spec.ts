/**
 * Smoke: Home page.
 * Verifies the storefront landing page renders its critical content.
 */
import { test, expect } from '@fixtures/index';

test.describe('Home', () => {
  test(
    'home page loads with featured products',
    { tag: '@smoke' },
    async ({ homePage }) => {
      // Arrange & Act
      await homePage.open();

      // Assert
      expect(await homePage.getTitle()).toContain('Your Store');
      const featured = await homePage.getFeaturedProductNames();
      expect(featured.length).toBeGreaterThan(0);
    },
  );
});
