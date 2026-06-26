/**
 * StorePage — base for every customer-facing store page.
 *
 * Responsibility (DRY): wire up the shared Header / Navigation / Footer
 * components once, so individual page objects expose them (`page.header...`)
 * without re-instantiating components everywhere.
 */
import type { Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { HeaderComponent } from '@components/header.component';
import { NavigationComponent } from '@components/navigation.component';
import { FooterComponent } from '@components/footer.component';

export abstract class StorePage extends BasePage {
  /** Global header (search, account menu, cart widget, currency). */
  readonly header: HeaderComponent;
  /** Main category navigation bar. */
  readonly navigation: NavigationComponent;
  /** Footer link columns. */
  readonly footer: FooterComponent;

  protected constructor(page: Page, scope: string) {
    super(page, scope);
    this.header = new HeaderComponent(page);
    this.navigation = new NavigationComponent(page);
    this.footer = new FooterComponent(page);
  }
}
