/**
 * LoginPage — returning-customer login (route=account/login).
 *
 * Exposes login actions and data readers only. Assertions (success/failure)
 * are performed in the tests, not here.
 */
import type { Locator, Page } from '@playwright/test';
import { StorePage } from '@pages/store.page';
import { ROUTES } from '@constants/routes';

export class LoginPage extends StorePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly forgottenPasswordLink: Locator;
  private readonly warningAlert: Locator;

  constructor(page: Page) {
    super(page, 'LoginPage');
    const content = page.locator('#content');
    this.emailInput = page.locator('#input-email');
    this.passwordInput = page.locator('#input-password');
    this.loginButton = content.getByRole('button', { name: 'Login' });
    this.forgottenPasswordLink = content.getByRole('link', {
      name: 'Forgotten Password',
    });
    this.warningAlert = page.locator('.alert-danger');
  }

  /** Opens the login page. */
  async open(): Promise<void> {
    await this.navigateTo(ROUTES.LOGIN);
  }

  /** Submits credentials. */
  async login(email: string, password: string): Promise<void> {
    await this.fill(this.emailInput, email, 'Email');
    await this.fill(this.passwordInput, password, 'Password');
    await this.click(this.loginButton, 'Login button');
  }

  /** Navigates to the password-recovery page. */
  async goToForgottenPassword(): Promise<void> {
    await this.click(this.forgottenPasswordLink, 'Forgotten Password link');
  }

  /** Returns the validation/warning banner text (empty if none shown). */
  async getWarningMessage(): Promise<string> {
    if (!(await this.isVisible(this.warningAlert))) {
      return '';
    }
    return this.getText(this.warningAlert, 'Login warning');
  }
}
