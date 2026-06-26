/**
 * Authentication fixtures.
 *
 * Responsibility (SRP + performance): register ONE fresh account per worker,
 * persist its authenticated storage state, and hand tests a ready
 * `loggedInPage` — so logged-in tests skip the UI login every time.
 *
 * Why register instead of using static creds? The demo store has no stable
 * seeded account, and registration auto-authenticates the session. Each worker
 * gets an isolated, unique user (parallel-safe). If `STANDARD_USER_*` env vars
 * are provided, a future enhancement can prefer those.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { test as base, type Page } from '@playwright/test';
import { RegisterPage } from '@pages/register.page';
import { generateUser, type GeneratedUser } from '@utils/random-data';
import { createLogger } from '@utils/logger';

const log = createLogger('AuthFixture');
const AUTH_DIR = resolve(process.cwd(), 'reports', '.auth');

/** Worker-level authenticated identity (created once per worker). */
export interface WorkerAuth {
  user: GeneratedUser;
  storageStatePath: string;
}

export interface AuthWorkerFixtures {
  workerAuth: WorkerAuth;
}

export interface AuthTestFixtures {
  /** A page already authenticated as the worker's registered user. */
  loggedInPage: Page;
}

export const test = base.extend<AuthTestFixtures, AuthWorkerFixtures>({
  // One registration per worker; the resulting storage state is reused.
  workerAuth: [
    async ({ browser }, use, workerInfo) => {
      if (!existsSync(AUTH_DIR)) {
        mkdirSync(AUTH_DIR, { recursive: true });
      }

      const user = generateUser();
      const storageStatePath = resolve(AUTH_DIR, `worker-${workerInfo.workerIndex}.json`);

      const context = await browser.newContext();
      const page = await context.newPage();
      const registerPage = new RegisterPage(page);

      log.info(`Registering worker user: ${user.email}`);
      await registerPage.open();
      await registerPage.register(user);

      if (!(await registerPage.isRegistrationSuccessful())) {
        const warning = await registerPage.getWarningMessage();
        throw new Error(`Worker registration failed: ${warning || 'unknown error'}`);
      }

      // Registration auto-authenticates — persist the session for reuse.
      await context.storageState({ path: storageStatePath });
      await context.close();

      await use({ user, storageStatePath });
    },
    { scope: 'worker' },
  ],

  // A fresh context per test, seeded with the worker's authenticated state.
  loggedInPage: async ({ browser, workerAuth }, use) => {
    const context = await browser.newContext({
      storageState: workerAuth.storageStatePath,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
