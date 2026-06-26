/**
 * Unified test entry point.
 *
 * Tests import `{ test, expect }` from here to get every fixture (page objects,
 * test data, authentication) composed into a single, type-safe `test`.
 *
 *   import { test, expect } from '@fixtures/index';
 *
 * Composing with `mergeTests` keeps each fixture file focused (SRP) while
 * presenting one cohesive API to test authors (DRY).
 */
import { mergeTests } from '@playwright/test';
import { test as pagesTest } from '@fixtures/pages.fixture';
import { test as dataTest } from '@fixtures/test-data.fixture';
import { test as authTest } from '@fixtures/auth.fixture';

export const test = mergeTests(pagesTest, dataTest, authTest);
export { expect } from '@playwright/test';
