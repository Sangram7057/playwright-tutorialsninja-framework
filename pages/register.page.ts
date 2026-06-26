/**
 * RegisterPage — new-customer registration (route=account/register).
 *
 * Consumes a GeneratedUser (from @utils/random-data) so tests never hardcode
 * registration data. Returns data/state; tests own the assertions.
 */
import type { Locator, Page } from '@playwright/test';
import { StorePage } from '@pages/store.page';
import { ROUTES } from '@constants/routes';
import type { GeneratedUser } from '@utils/random-data';

export class RegisterPage extends StorePage {
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly telephoneInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly continueButton: Locator;
  private readonly warningAlert: Locator;
  private readonly successHeading: Locator;
  private readonly confirmPasswordError: Locator;

  constructor(page: Page) {
    super(page, 'RegisterPage');
    this.firstNameInput = page.locator('#input-firstname');
    this.lastNameInput = page.locator('#input-lastname');
    this.emailInput = page.locator('#input-email');
    this.telephoneInput = page.locator('#input-telephone');
    this.passwordInput = page.locator('#input-password');
    this.confirmPasswordInput = page.locator('#input-confirm');
    this.privacyPolicyCheckbox = page.locator('input[name="agree"]');
    this.continueButton = page
      .locator('#content')
      .getByRole('button', { name: 'Continue' });
    this.warningAlert = page.locator('.alert-danger');
    this.successHeading = page.getByRole('heading', {
      name: 'Your Account Has Been Created!',
    });
    this.confirmPasswordError = page.locator(
      '.form-group:has(#input-confirm) .text-danger',
    );
  }

  /** Opens the registration page. */
  async open(): Promise<void> {
    await this.navigateTo(ROUTES.REGISTER);
  }

  /**
   * Fills the form with a generated user (without submitting).
   * `confirmPassword` defaults to the user's password; pass a different value
   * to exercise the password-mismatch validation.
   */
  async fillForm(
    user: GeneratedUser,
    confirmPassword: string = user.password,
  ): Promise<void> {
    await this.fill(this.firstNameInput, user.firstName, 'First name');
    await this.fill(this.lastNameInput, user.lastName, 'Last name');
    await this.fill(this.emailInput, user.email, 'Email');
    await this.fill(this.telephoneInput, user.telephone, 'Telephone');
    await this.fill(this.passwordInput, user.password, 'Password');
    await this.fill(this.confirmPasswordInput, confirmPassword, 'Confirm password');
  }

  /** Accepts the privacy policy and submits the form. */
  async submit(agreeToPolicy = true): Promise<void> {
    if (agreeToPolicy) {
      await this.check(this.privacyPolicyCheckbox, 'Privacy Policy');
    }
    await this.click(this.continueButton, 'Continue button');
  }

  /** Convenience: fill + submit in one call. */
  async register(user: GeneratedUser, agreeToPolicy = true): Promise<void> {
    await this.fillForm(user);
    await this.submit(agreeToPolicy);
  }

  /** Whether the account-created success heading is shown. */
  async isRegistrationSuccessful(): Promise<boolean> {
    return this.isVisible(this.successHeading);
  }

  /** Returns the warning banner text (e.g. duplicate email), empty if none. */
  async getWarningMessage(): Promise<string> {
    if (!(await this.isVisible(this.warningAlert))) {
      return '';
    }
    return this.getText(this.warningAlert, 'Register warning');
  }

  /** Returns the confirm-password field validation error, empty if none. */
  async getConfirmPasswordError(): Promise<string> {
    if (!(await this.isVisible(this.confirmPasswordError))) {
      return '';
    }
    return this.getText(this.confirmPasswordError, 'Confirm password error');
  }
}
