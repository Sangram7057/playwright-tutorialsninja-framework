/**
 * Regression: Checkout.
 *
 * IMPORTANT — public demo limitation:
 * The TutorialsNinja demo store has guest checkout disabled AND blocks order
 * placement: `checkout/checkout` redirects back to the cart even when logged
 * in. A full order-placement assertion therefore cannot pass on this target.
 *
 * The CheckoutPage object (guest happy-path) is retained for a real store with
 * checkout enabled, and the end-to-end test below is written but marked
 * `fixme` so its intent is documented without failing CI. The reachable
 * boundary (a populated cart ready for checkout) is covered in
 * cart.regression.spec.ts.
 */
import { test, expect } from '@fixtures/index';

test.describe('Checkout', () => {
  test.fixme(
    'guest can place an order end-to-end (requires guest checkout enabled)',
    { tag: '@regression' },
    async ({
      homePage,
      searchResultsPage,
      productPage,
      cartPage,
      checkoutPage,
      testData,
    }) => {
      const product = testData.search.valid.expectedProduct;
      const billing = testData.checkout.guestBilling;

      // Add a product and go to checkout.
      await homePage.open();
      await homePage.header.searchFor(product);
      await searchResultsPage.openProduct(product);
      await productPage.addToCart();
      await cartPage.open();
      await cartPage.proceedToCheckout();

      // Guest checkout happy path.
      await checkoutPage.chooseGuestCheckout();
      await checkoutPage.fillBillingDetails(billing);
      await checkoutPage.confirmDeliveryMethod();
      await checkoutPage.confirmPaymentMethod();
      await checkoutPage.confirmOrder();

      // On a real store this would assert the order-success heading.
      expect(checkoutPage.getUrl()).toContain('checkout/success');
    },
  );
});
