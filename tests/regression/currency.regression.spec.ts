/**
 * Regression: Currency switching.
 * Verifies the store currency switcher updates displayed prices.
 */
import { test, expect } from '@fixtures/index';

test.describe('Currency', () => {
  test(
    'switching currency updates the product price symbol',
    { tag: '@regression' },
    async ({ homePage, searchResultsPage, productPage, testData }) => {
      // Arrange: open a product (defaults to USD).
      const product = testData.search.valid.expectedProduct;
      await homePage.open();
      await homePage.header.searchFor(product);
      await searchResultsPage.openProduct(product);
      expect(await productPage.getPrice()).toContain('$');

      // Act: switch to Euro.
      await productPage.header.selectCurrency('EUR');

      // Assert: prices now render with the Euro symbol.
      expect(await productPage.getPrice()).toContain('€');
    },
  );
});
