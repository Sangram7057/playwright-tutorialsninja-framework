/**
 * AccountPage — the logged-in account dashboard (route=account/account).
 *
 * Used primarily to confirm a successful login and to navigate into account
 * sub-sections. Reads state; tests assert.
 */
import type { Locator, Page } from '@playwright/test';
import { StorePage } from '@pages/store.page';
import { ROUTES } from '@constants/routes';

export class AccountPage extends StorePage {
  private readonly accountHeading: Locator;
  private readonly editAccountLink: Locator;
  private readonly passwordLink: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page, 'AccountPage');
    const content = page.locator('#content');
    this.accountHeading = content.getByRole('heading', { name: 'My Account' }).first();
    this.editAccountLink = content.getByRole('link', {
      name: 'Edit your account information',
    });
    this.passwordLink = content.getByRole('link', { name: 'Change your password' });
    this.logoutLink = content.getByRole('link', { name: 'Logout' });
  }

  /** Opens the account dashboard directly. */
  async open(): Promise<void> {
    await this.navigateTo(ROUTES.ACCOUNT);
  }

  /** Whether the account dashboard is loaded (login succeeded). */
  async isLoaded(): Promise<boolean> {
    return this.isVisible(this.accountHeading);
  }

  /** Opens the "Edit Account" section. */
  async openEditAccount(): Promise<void> {
    await this.click(this.editAccountLink, 'Edit Account');
  }

  /** Opens the "Change Password" section. */
  async openChangePassword(): Promise<void> {
    await this.click(this.passwordLink, 'Change Password');
  }

  /** Logs out via the account-page link. */
  async logout(): Promise<void> {
    await this.click(this.logoutLink, 'Logout');
  }
}
