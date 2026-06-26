/**
 * Test-data fixture.
 *
 * Responsibility (SRP): expose the typed, JSON-backed test data to tests via a
 * single `testData` fixture, plus a `freshUser` factory for unique users.
 */
import { test as base } from '@playwright/test';
import { loadTestData, type TestData } from '@utils/data-loader';
import { generateUser, type GeneratedUser } from '@utils/random-data';

export interface DataFixtures {
  /** Static, typed test data loaded from `test-data/*.json`. */
  testData: TestData;
  /** Factory producing a fresh, unique user on each call. */
  freshUser: () => GeneratedUser;
}

export const test = base.extend<DataFixtures>({
  // eslint-disable-next-line no-empty-pattern -- Playwright requires the {} destructure
  testData: async ({}, use) => {
    await use(loadTestData());
  },
  // eslint-disable-next-line no-empty-pattern -- Playwright requires the {} destructure
  freshUser: async ({}, use) => {
    await use(() => generateUser());
  },
});
