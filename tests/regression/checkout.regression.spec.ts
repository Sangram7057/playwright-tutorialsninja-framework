/**
 * Regression: Checkout (full guest order placement).
 *
 * This is a REAL test gated by `RUN_CHECKOUT_E2E`. It:
 *   - SKIPS by default (the public demo disables guest checkout and blocks
 *     order placement — `checkout/checkout` redirects to the cart), and
 *   - RUNS against an OpenCart instance with guest checkout enabled
 *     (see docs/local-opencart.md: `docker compose up -d`, then
 *      `BASE_URL=http://localhost:8080/ RUN_CHECKOUT_E2E=true npm run test:regression`).
 *
 * The reachable cart→checkout boundary is also covered in cart.regression.spec.ts.
 */
import { test, expect } from '@fixtures/index';
import { env } from '@config/env.config';

test.describe('Checkout', () => {
  test(
    'guest can place an order end-to-end',
    { tag: '@regression' },
    async ({
      homePage,
      searchResultsPage,
      productPage,
      cartPage,
      checkoutPage,
      orderSuccessPage,
      testData,
    }) => {
      test.skip(
        !env.runCheckoutE2E,
        'Requires guest checkout (set RUN_CHECKOUT_E2E=true; see docs/local-opencart.md).',
      );

      // Arrange: add a product and proceed to checkout.
      const product = testData.search.valid.expectedProduct;
      const billing = testData.checkout.guestBilling;
      await homePage.open();
      await homePage.header.searchFor(product);
      await searchResultsPage.openProduct(product);
      await productPage.addToCart();
      expect(await productPage.getSuccessMessage()).toContain('Success');
      await cartPage.open();
      await cartPage.proceedToCheckout();

      // Act: guest checkout happy path.
      await checkoutPage.chooseGuestCheckout();
      await checkoutPage.fillBillingDetails(billing);
      await checkoutPage.confirmDeliveryMethod();
      await checkoutPage.confirmPaymentMethod();
      await checkoutPage.confirmOrder();

      // Assert: order confirmation is shown.
      expect(await orderSuccessPage.isOrderPlaced()).toBe(true);
    },
  );
});
