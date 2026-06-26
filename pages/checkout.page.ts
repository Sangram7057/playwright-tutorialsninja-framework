/**
 * CheckoutPage — the multi-step checkout accordion (route=checkout/checkout).
 *
 * Models the guest-checkout happy path (the most reusable flow): choose guest,
 * fill billing, confirm delivery + payment method, accept terms, confirm order.
 * Each step is its own small method so tests compose only what they need.
 */
import type { Locator, Page } from '@playwright/test';
import { StorePage } from '@pages/store.page';
import { ROUTES } from '@constants/routes';

/** Billing/delivery details required for a guest checkout. */
export interface BillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  address1: string;
  city: string;
  postcode: string;
  country: string;
  region: string;
}

export class CheckoutPage extends StorePage {
  private readonly guestRadio: Locator;
  private readonly continueAccountButton: Locator;
  private readonly continueGuestButton: Locator;
  private readonly continueShippingButton: Locator;
  private readonly continuePaymentButton: Locator;
  private readonly agreeTermsCheckbox: Locator;
  private readonly confirmOrderButton: Locator;

  constructor(page: Page) {
    super(page, 'CheckoutPage');
    this.guestRadio = page.locator('input[value="guest"]');
    this.continueAccountButton = page.locator('#button-account');
    this.continueGuestButton = page.locator('#button-guest');
    this.continueShippingButton = page.locator('#button-shipping-method');
    this.continuePaymentButton = page.locator('#button-payment-method');
    this.agreeTermsCheckbox = page.locator('input[name="agree"]');
    this.confirmOrderButton = page.locator('#button-confirm');
  }

  /** Opens the checkout page directly. */
  async open(): Promise<void> {
    await this.navigateTo(ROUTES.CHECKOUT);
  }

  /** Step 1: choose the guest-checkout option and continue. */
  async chooseGuestCheckout(): Promise<void> {
    await this.check(this.guestRadio, 'Guest Checkout option');
    await this.click(this.continueAccountButton, 'Continue (account step)');
  }

  /** Step 2: fill guest billing details and continue. */
  async fillBillingDetails(details: BillingDetails): Promise<void> {
    const page = this.page;
    await this.fill(
      page.locator('#input-payment-firstname'),
      details.firstName,
      'First name',
    );
    await this.fill(
      page.locator('#input-payment-lastname'),
      details.lastName,
      'Last name',
    );
    await this.fill(page.locator('#input-payment-email'), details.email, 'Email');
    await this.fill(
      page.locator('#input-payment-telephone'),
      details.telephone,
      'Telephone',
    );
    await this.fill(
      page.locator('#input-payment-address-1'),
      details.address1,
      'Address 1',
    );
    await this.fill(page.locator('#input-payment-city'), details.city, 'City');
    await this.fill(
      page.locator('#input-payment-postcode'),
      details.postcode,
      'Postcode',
    );
    await this.selectByLabel(
      page.locator('#input-payment-country'),
      details.country,
      'Country',
    );
    await this.selectByLabel(
      page.locator('#input-payment-zone'),
      details.region,
      'Region',
    );
    await this.click(this.continueGuestButton, 'Continue (billing step)');
  }

  /** Step 4: confirm the (default) delivery method. */
  async confirmDeliveryMethod(): Promise<void> {
    await this.click(this.continueShippingButton, 'Continue (delivery method)');
  }

  /** Step 5: accept terms and confirm the payment method. */
  async confirmPaymentMethod(): Promise<void> {
    await this.check(this.agreeTermsCheckbox, 'Terms & Conditions');
    await this.click(this.continuePaymentButton, 'Continue (payment method)');
  }

  /** Step 6: place the order. */
  async confirmOrder(): Promise<void> {
    await this.click(this.confirmOrderButton, 'Confirm Order');
  }
}
