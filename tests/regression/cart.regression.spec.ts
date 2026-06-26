/**
 * Regression: Shopping cart management.
 * Deeper coverage of cart line-item operations and totals.
 */
import { test, expect } from '@fixtures/index';
import type { HomePage } from '@pages/home.page';
import type { SearchResultsPage } from '@pages/search-results.page';
import type { ProductPage } from '@pages/product.page';

/** Finds a product by name and adds it to the cart (asserting the success banner). */
async function addProductToCart(
  homePage: HomePage,
  searchResultsPage: SearchResultsPage,
  productPage: ProductPage,
  name: string,
): Promise<void> {
  await homePage.open();
  await homePage.header.searchFor(name);
  await searchResultsPage.openProduct(name);
  await productPage.addToCart();
  expect(await productPage.getSuccessMessage()).toContain('Success');
}

test.describe('Cart management', () => {
  test(
    'updating quantity keeps the product and re-renders totals',
    { tag: '@regression' },
    async ({ homePage, searchResultsPage, productPage, cartPage, testData }) => {
      // Arrange
      const product = testData.search.valid.expectedProduct;
      await addProductToCart(homePage, searchResultsPage, productPage, product);
      await cartPage.open();

      // Act
      await cartPage.updateQuantity(product, 3);

      // Assert
      expect(await cartPage.hasProduct(product)).toBe(true);
      expect(await cartPage.getTotalsText()).toMatch(/Total/i);
    },
  );

  test(
    'removing the only product empties the cart',
    { tag: '@regression' },
    async ({ homePage, searchResultsPage, productPage, cartPage, testData }) => {
      // Arrange
      const product = testData.search.valid.expectedProduct;
      await addProductToCart(homePage, searchResultsPage, productPage, product);
      await cartPage.open();
      expect(await cartPage.hasProduct(product)).toBe(true);

      // Act
      await cartPage.removeProduct(product);

      // Assert
      await expect.poll(() => cartPage.isEmpty()).toBe(true);
    },
  );

  test(
    'cart shows totals ready for checkout',
    { tag: '@regression' },
    async ({ homePage, searchResultsPage, productPage, cartPage, testData }) => {
      // Arrange
      const product = testData.search.valid.expectedProduct;
      await addProductToCart(homePage, searchResultsPage, productPage, product);

      // Act
      await cartPage.open();

      // Assert
      expect(await cartPage.hasProduct(product)).toBe(true);
      expect(await cartPage.getTotalsText()).toMatch(/Total/i);
    },
  );
});
