/**
 * Smoke: Add to cart.
 * Verifies the core purchase entry point: find a product and add it to the cart.
 */
import { test, expect } from '@fixtures/index';

test.describe('Cart', () => {
  test(
    'a product can be searched and added to the cart',
    { tag: '@smoke' },
    async ({ homePage, searchResultsPage, productPage, cartPage, testData }) => {
      // Arrange
      const { term, expectedProduct } = testData.search.valid;
      await homePage.open();

      // Act
      await homePage.header.searchFor(term);
      await searchResultsPage.openProduct(expectedProduct);
      await productPage.addToCart();

      // Assert
      expect(await productPage.getSuccessMessage()).toContain('Success');
      await cartPage.open();
      expect(await cartPage.hasProduct(expectedProduct)).toBe(true);
    },
  );
});
