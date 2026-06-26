/**
 * API fixtures.
 *
 * Responsibility (SRP): provide a configured `APIRequestContext` and a
 * `StoreApi` helper for fast, browser-free setup/teardown and health checks.
 *
 *   test('...', async ({ storeApi }) => { await storeApi.isStoreReachable(); });
 */
import { test as base, request, type APIRequestContext } from '@playwright/test';
import { env } from '@config/env.config';
import { StoreApi } from '@helpers/store-api';

export interface ApiFixtures {
  /** Raw Playwright API context, pre-configured with the store base URL. */
  apiContext: APIRequestContext;
  /** Higher-level store API helper built on `apiContext`. */
  storeApi: StoreApi;
}

export const test = base.extend<ApiFixtures>({
  // eslint-disable-next-line no-empty-pattern -- Playwright requires the {} destructure
  apiContext: async ({}, use) => {
    const context = await request.newContext({
      baseURL: env.baseUrl,
      ignoreHTTPSErrors: true,
    });
    await use(context);
    await context.dispose();
  },
  storeApi: async ({ apiContext }, use) => {
    await use(new StoreApi(apiContext));
  },
});
