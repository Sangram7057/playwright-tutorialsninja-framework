/**
 * Regression: Registration validation (negative paths).
 * Verifies duplicate-email and password-mismatch are rejected.
 */
import { test, expect } from '@fixtures/index';

test.describe('Registration validation', () => {
  test(
    'registering with an already-used email is rejected',
    { tag: '@regression' },
    async ({ registerPage, freshUser }) => {
      // Arrange: register a user once (auto-login), then log out.
      const user = freshUser();
      await registerPage.open();
      await registerPage.register(user);
      await registerPage.header.logout();

      // Act: attempt to register again with the same email.
      await registerPage.open();
      await registerPage.register(user);

      // Assert
      expect(await registerPage.getWarningMessage()).toContain('already registered');
    },
  );

  test(
    'mismatched password confirmation is rejected',
    { tag: '@regression' },
    async ({ registerPage, freshUser }) => {
      // Arrange
      const user = freshUser();
      await registerPage.open();

      // Act: confirm password differs from password.
      await registerPage.fillForm(user, `${user.password}_different`);
      await registerPage.submit(true);

      // Assert
      expect(await registerPage.getConfirmPasswordError()).toContain('does not match');
    },
  );
});
