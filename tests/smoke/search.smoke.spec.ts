/**
 * Smoke: Product search.
 * Verifies positive and empty-state search behaviour.
 */
import { test, expect } from '@fixtures/index';

test.describe('Search', () => {
  test(
    'valid search returns matching products',
    { tag: '@smoke' },
    async ({ homePage, searchResultsPage, testData }) => {
      // Arrange
      const { term, expectedProduct } = testData.search.valid;
      await homePage.open();

      // Act
      await homePage.header.searchFor(term);

      // Assert
      expect(await searchResultsPage.getResultCount()).toBeGreaterThan(0);
      expect(await searchResultsPage.isProductListed(expectedProduct)).toBe(true);
    },
  );

  test(
    'nonsense search shows the no-results state',
    { tag: '@smoke' },
    async ({ homePage, searchResultsPage, testData }) => {
      // Arrange
      await homePage.open();

      // Act
      await homePage.header.searchFor(testData.search.noResults.term);

      // Assert
      expect(await searchResultsPage.hasNoResults()).toBe(true);
    },
  );
});
