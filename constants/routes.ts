/**
 * Application route paths (relative to the configured baseURL).
 *
 * Responsibility (SRP): keep every URL in one place so navigation is
 * consistent and a route change is a one-line edit — never a hardcoded string
 * scattered across pages/tests.
 */
export const ROUTES = {
  HOME: 'index.php?route=common/home',
  LOGIN: 'index.php?route=account/login',
  REGISTER: 'index.php?route=account/register',
  ACCOUNT: 'index.php?route=account/account',
  LOGOUT: 'index.php?route=account/logout',
  WISHLIST: 'index.php?route=account/wishlist',
  CART: 'index.php?route=checkout/cart',
  CHECKOUT: 'index.php?route=checkout/checkout',
  SEARCH: 'index.php?route=product/search',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
