/**
 * StoreApi — a thin, reusable API layer over the OpenCart storefront.
 *
 * Responsibility (SRP): provide fast, browser-free operations for test setup,
 * health checks and teardown. Driving state via HTTP (instead of the UI) makes
 * arrange/cleanup steps an order of magnitude faster and less flaky.
 *
 * Note: deep seeding (creating products/customers) requires OpenCart's admin
 * REST API token; expose that here when targeting an instance that has it.
 * The storefront operations below work against any standard OpenCart store.
 */
import type { APIRequestContext } from '@playwright/test';
import { createLogger } from '@utils/logger';
import { ROUTES } from '@constants/routes';

const log = createLogger('StoreApi');

/** Shape of OpenCart's cart-add JSON response. */
export interface CartAddResult {
  success?: string;
  total?: string;
  error?: unknown;
}

export class StoreApi {
  constructor(private readonly request: APIRequestContext) {}

  /** Returns true if the storefront home page responds with 2xx. */
  async isStoreReachable(): Promise<boolean> {
    const response = await this.request.get(ROUTES.HOME);
    log.info(`Store health check: ${response.status()}`);
    return response.ok();
  }

  /** Returns the HTTP status code for an arbitrary store route. */
  async getStatus(route: string): Promise<number> {
    const response = await this.request.get(route);
    return response.status();
  }

  /**
   * Adds a product to the cart via the storefront AJAX endpoint — a fast way to
   * seed cart state without clicking through the UI. Cookies persist within the
   * API context, so subsequent calls share the same cart session.
   */
  async addToCart(productId: number, quantity = 1): Promise<CartAddResult> {
    log.info(`API add to cart: product=${productId} qty=${quantity}`);
    const response = await this.request.post('index.php?route=checkout/cart/add', {
      form: { product_id: String(productId), quantity: String(quantity) },
    });
    return (await response.json()) as CartAddResult;
  }
}
