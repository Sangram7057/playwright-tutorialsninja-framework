/**
 * Page-object fixtures.
 *
 * Responsibility (DRY): instantiate each page object once per test and inject
 * it ready-to-use, so test files never `new` a page or manage its lifecycle.
 * Tests simply destructure the pages they need.
 */
import { test as base } from '@playwright/test';
import { HomePage } from '@pages/home.page';
import { LoginPage } from '@pages/login.page';
import { RegisterPage } from '@pages/register.page';
import { SearchResultsPage } from '@pages/search-results.page';
import { ProductPage } from '@pages/product.page';
import { WishlistPage } from '@pages/wishlist.page';
import { CartPage } from '@pages/cart.page';
import { CheckoutPage } from '@pages/checkout.page';
import { AccountPage } from '@pages/account.page';
import { CategoryPage } from '@pages/category.page';

/** The set of page objects exposed to every test. */
export interface PageFixtures {
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  searchResultsPage: SearchResultsPage;
  productPage: ProductPage;
  wishlistPage: WishlistPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  accountPage: AccountPage;
  categoryPage: CategoryPage;
}

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  wishlistPage: async ({ page }, use) => {
    await use(new WishlistPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  categoryPage: async ({ page }, use) => {
    await use(new CategoryPage(page));
  },
});
