/**
 * Regression: Category navigation.
 * Verifies the main menu navigates to the correct category listing.
 */
import { test, expect } from '@fixtures/index';
import { MAIN_CATEGORY } from '@components/navigation.component';

test.describe('Navigation', () => {
  test(
    'opening a top-level category lands on its listing page',
    { tag: '@regression' },
    async ({ homePage, categoryPage }) => {
      // Arrange
      await homePage.open();

      // Act: Tablets is a direct (non-dropdown) category link.
      await homePage.navigation.openCategory(MAIN_CATEGORY.TABLETS);

      // Assert: breadcrumb reflects the chosen category.
      expect(await categoryPage.getActiveBreadcrumb()).toContain('Tablets');
    },
  );

  test(
    'all expected top-level categories are present',
    { tag: '@regression' },
    async ({ homePage }) => {
      // Arrange
      await homePage.open();

      // Assert
      for (const category of Object.values(MAIN_CATEGORY)) {
        expect(await homePage.navigation.hasCategory(category)).toBe(true);
      }
    },
  );
});
