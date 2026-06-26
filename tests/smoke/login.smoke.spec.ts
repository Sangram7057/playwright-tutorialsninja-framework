/**
 * Smoke: Authentication.
 * Verifies invalid credentials are rejected and a real user can log in.
 */
import { test, expect } from '@fixtures/index';

test.describe('Login', () => {
  test(
    'invalid credentials are rejected with a warning',
    { tag: '@smoke' },
    async ({ loginPage, testData }) => {
      // Arrange
      const { email, password } = testData.users.invalid;
      await loginPage.open();

      // Act
      await loginPage.login(email, password);

      // Assert
      expect(await loginPage.getWarningMessage()).toContain('Warning');
    },
  );

  test(
    'a registered customer can log in',
    { tag: '@smoke' },
    async ({ registerPage, loginPage, accountPage, freshUser }) => {
      // Arrange: create a user (auto-logged-in), then log out to test login.
      const user = freshUser();
      await registerPage.open();
      await registerPage.register(user);
      await registerPage.header.logout();

      // Act
      await loginPage.open();
      await loginPage.login(user.email, user.password);

      // Assert
      expect(await accountPage.isLoaded()).toBe(true);
    },
  );
});
