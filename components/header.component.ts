/**
 * HeaderComponent — the global store header (top bar + search + cart widget).
 *
 * Responsibility (SRP): own every locator and action for the header so pages
 * and tests reuse it instead of redefining header selectors. Extends BasePage
 * to inherit logged, auto-waiting interactions (DRY).
 *
 * Locators follow the project priority (id > attribute/role > text). The
 * OpenCart default theme exposes stable ids (#top, #search, #cart, #logo) and
 * descriptive `title` attributes, so no XPath is required.
 */
import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

/** ISO currency codes supported by the demo store's currency switcher. */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export class HeaderComponent extends BasePage {
  private readonly topBar: Locator;
  private readonly currencyToggle: Locator;
  private readonly myAccountToggle: Locator;
  private readonly registerLink: Locator;
  private readonly loginLink: Locator;
  private readonly logoutLink: Locator;
  private readonly myAccountLink: Locator;
  private readonly wishlistLink: Locator;
  private readonly cartPageLink: Locator;
  private readonly checkoutLink: Locator;
  private readonly logo: Locator;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly cartButton: Locator;

  constructor(page: Page) {
    super(page, 'Header');

    this.topBar = page.locator('#top');
    this.currencyToggle = this.topBar.locator('#form-currency .dropdown-toggle');
    this.myAccountToggle = this.topBar.locator('a[title="My Account"]');
    this.registerLink = this.topBar.getByRole('link', { name: 'Register' });
    this.loginLink = this.topBar.getByRole('link', { name: 'Login' });
    this.logoutLink = this.topBar.getByRole('link', { name: 'Logout' });
    this.myAccountLink = this.topBar.getByRole('link', { name: 'My Account' });
    this.wishlistLink = page.locator('#wishlist-total');
    this.cartPageLink = this.topBar.locator('a[title="Shopping Cart"]');
    this.checkoutLink = this.topBar.locator('a[title="Checkout"]');
    this.logo = page.locator('#logo');
    this.searchInput = page.getByPlaceholder('Search');
    this.searchButton = page.locator('#search button');
    this.cartButton = page.locator('#cart').getByRole('button').first();
  }

  /** Searches the store for the given term and submits. */
  async searchFor(term: string): Promise<void> {
    await this.fill(this.searchInput, term, 'Search box');
    await this.click(this.searchButton, 'Search button');
  }

  /** Opens the "My Account" dropdown in the top bar. */
  async openAccountMenu(): Promise<void> {
    await this.click(this.myAccountToggle, 'My Account menu');
  }

  /** Opens the registration page via the account menu. */
  async goToRegister(): Promise<void> {
    await this.openAccountMenu();
    await this.click(this.registerLink, 'Register link');
  }

  /** Opens the login page via the account menu. */
  async goToLogin(): Promise<void> {
    await this.openAccountMenu();
    await this.click(this.loginLink, 'Login link');
  }

  /** Opens the account dashboard via the account menu (when logged in). */
  async goToMyAccount(): Promise<void> {
    await this.openAccountMenu();
    await this.click(this.myAccountLink, 'My Account link');
  }

  /** Logs the current user out via the account menu. */
  async logout(): Promise<void> {
    await this.openAccountMenu();
    await this.click(this.logoutLink, 'Logout link');
  }

  /** Opens the wishlist page. */
  async openWishlist(): Promise<void> {
    await this.click(this.wishlistLink, 'Wishlist link');
  }

  /** Navigates to the full shopping cart page (top-bar link). */
  async goToCartPage(): Promise<void> {
    await this.click(this.cartPageLink, 'Shopping Cart link');
  }

  /** Navigates directly to checkout (top-bar link). */
  async goToCheckout(): Promise<void> {
    await this.click(this.checkoutLink, 'Checkout link');
  }

  /** Opens the mini-cart dropdown in the header. */
  async openCartDropdown(): Promise<void> {
    await this.click(this.cartButton, 'Cart widget');
  }

  /** Switches the active store currency. */
  async selectCurrency(code: CurrencyCode): Promise<void> {
    await this.click(this.currencyToggle, 'Currency switcher');
    const option = this.topBar.locator(`#form-currency button[name="${code}"]`);
    await this.click(option, `Currency option ${code}`);
  }

  /** Clicks the store logo (returns home). */
  async clickLogo(): Promise<void> {
    await this.click(this.logo.getByRole('link').first(), 'Store logo');
  }

  /** Returns the cart widget summary text (e.g. "2 item(s) - $40.00"). */
  async getCartSummary(): Promise<string> {
    return this.getText(this.cartButton, 'Cart widget');
  }

  /** Returns the wishlist link text (e.g. "Wish List (1)"). */
  async getWishlistSummary(): Promise<string> {
    return this.getText(this.wishlistLink, 'Wishlist link');
  }

  /** Whether the user appears logged in (Logout visible after opening menu). */
  async isLoggedIn(): Promise<boolean> {
    await this.openAccountMenu();
    return this.isVisible(this.logoutLink);
  }
}
