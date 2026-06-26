/**
 * FooterComponent — the global store footer link columns.
 *
 * Responsibility (SRP): own footer locators/actions. Footer links are addressed
 * by their accessible role + name (stable across the default theme), so a
 * single generic method serves every link (DRY).
 */
import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

/** Footer link labels grouped by their column (as rendered by the theme). */
export const FOOTER_LINK = {
  // Information
  ABOUT_US: 'About Us',
  DELIVERY_INFORMATION: 'Delivery Information',
  PRIVACY_POLICY: 'Privacy Policy',
  TERMS_CONDITIONS: 'Terms & Conditions',
  // Customer Service
  CONTACT_US: 'Contact Us',
  RETURNS: 'Returns',
  SITE_MAP: 'Site Map',
  // Extras
  BRANDS: 'Brands',
  GIFT_CERTIFICATES: 'Gift Certificates',
  AFFILIATE: 'Affiliate',
  SPECIALS: 'Specials',
  // My Account
  MY_ACCOUNT: 'My Account',
  ORDER_HISTORY: 'Order History',
  WISH_LIST: 'Wish List',
  NEWSLETTER: 'Newsletter',
} as const;

export type FooterLink = (typeof FOOTER_LINK)[keyof typeof FOOTER_LINK];

export class FooterComponent extends BasePage {
  private readonly footer: Locator;

  constructor(page: Page) {
    super(page, 'Footer');
    this.footer = page.locator('footer');
  }

  /** Returns the locator for a footer link by its visible label. */
  private footerLink(label: string): Locator {
    return this.footer.getByRole('link', { name: label, exact: true });
  }

  /** Clicks a footer link by its label. */
  async openLink(label: FooterLink): Promise<void> {
    await this.scrollIntoView(this.footerLink(label), `Footer link "${label}"`);
    await this.click(this.footerLink(label), `Footer link "${label}"`);
  }

  /** Returns true if a footer link is present. */
  async hasLink(label: FooterLink): Promise<boolean> {
    return this.isVisible(this.footerLink(label));
  }

  /** Returns the powered-by / copyright text at the very bottom. */
  async getCopyrightText(): Promise<string> {
    return this.getText(this.footer, 'Footer');
  }
}
