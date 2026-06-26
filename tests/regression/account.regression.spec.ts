/**
 * Regression: Account session lifecycle.
 * Verifies a registered user can reach the dashboard and log out cleanly.
 */
import { test, expect } from '@fixtures/index';

test.describe('Account session', () => {
  test(
    'a registered user reaches the dashboard and can log out',
    { tag: '@regression' },
    async ({ registerPage, accountPage, freshUser }) => {
      // Arrange: register (auto-authenticates).
      const user = freshUser();
      await registerPage.open();
      await registerPage.register(user);

      // Act + Assert: dashboard is reachable while authenticated.
      await accountPage.open();
      expect(await accountPage.isLoaded()).toBe(true);

      // Act: log out.
      await accountPage.header.logout();

      // Assert: session is ended (account menu no longer shows Logout).
      expect(await accountPage.header.isLoggedIn()).toBe(false);
    },
  );

  test(
    'edit-account page is reachable when authenticated',
    { tag: '@regression' },
    async ({ registerPage, accountPage, freshUser }) => {
      // Arrange
      const user = freshUser();
      await registerPage.open();
      await registerPage.register(user);
      await accountPage.open();

      // Act
      await accountPage.openEditAccount();

      // Assert: the first-name field retains the registered value.
      const firstName = await accountPage.getEditAccountFirstName();
      expect(firstName).toBe(user.firstName);
    },
  );
});
