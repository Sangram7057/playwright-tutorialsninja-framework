/**
 * Smoke: Account registration.
 * Verifies a brand-new customer can create an account.
 */
import { test, expect } from '@fixtures/index';

test.describe('Register', () => {
  test(
    'a new customer can register successfully',
    { tag: '@smoke' },
    async ({ registerPage, freshUser }) => {
      // Arrange
      const user = freshUser();
      await registerPage.open();

      // Act
      await registerPage.register(user);

      // Assert
      expect(await registerPage.isRegistrationSuccessful()).toBe(true);
    },
  );
});
