/**
 * Regression: Wishlist (authenticated).
 * Uses the `loggedInPage` fixture (reused storage state) to add then remove a
 * wishlist item — wishlist persistence requires an authenticated session.
 */
import { test, expect } from '@fixtures/index';
import { HomePage } from '@pages/home.page';
import { SearchResultsPage } from '@pages/search-results.page';
import { ProductPage } from '@pages/product.page';
import { WishlistPage } from '@pages/wishlist.page';

test.describe('Wishlist', () => {
  test(
    'a product can be added to and removed from the wishlist',
    { tag: '@regression' },
    async ({ loggedInPage, testData }) => {
      // Arrange: bind page objects to the authenticated page.
      const product = testData.search.valid.expectedProduct;
      const homePage = new HomePage(loggedInPage);
      const searchResultsPage = new SearchResultsPage(loggedInPage);
      const productPage = new ProductPage(loggedInPage);
      const wishlistPage = new WishlistPage(loggedInPage);

      await homePage.open();
      await homePage.header.searchFor(product);
      await searchResultsPage.openProduct(product);

      // Act: add to wishlist.
      await productPage.addToWishlist();
      expect(await productPage.getSuccessMessage()).toMatch(/wish list/i);

      // Assert: it appears in the wishlist.
      await wishlistPage.open();
      expect(await wishlistPage.hasProduct(product)).toBe(true);

      // Act: remove it.
      await wishlistPage.removeProduct(product);

      // Assert: wishlist becomes empty.
      await expect.poll(() => wishlistPage.isEmpty()).toBe(true);
    },
  );
});
