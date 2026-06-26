/**
 * Typed JSON test-data loader.
 *
 * Responsibility (SRP): read JSON fixtures from `test-data/` in one place,
 * returning strongly-typed objects so tests never parse files or hardcode data.
 *
 * Files are read with fs (not `import`) to stay agnostic of ESM JSON import
 * assertions and to keep data hot-reloadable without recompilation.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DATA_DIR = resolve(process.cwd(), 'test-data');

/** Reads and parses a JSON file from the test-data directory. */
export function loadJson<T>(fileName: string): T {
  const fullPath = resolve(DATA_DIR, fileName);
  const raw = readFileSync(fullPath, 'utf-8');
  return JSON.parse(raw) as T;
}

// ---------------------------------------------------------------------------
// Test-data shapes (kept beside the loader so consumers get full typing).
// ---------------------------------------------------------------------------

export interface Credentials {
  email: string;
  password: string;
}

export interface UsersData {
  invalid: Credentials;
}

export interface SearchScenario {
  term: string;
  expectedProduct?: string;
}

export interface SearchData {
  valid: Required<SearchScenario>;
  multipleResults: SearchScenario;
  noResults: SearchScenario;
}

export interface GuestBilling {
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

export interface CheckoutData {
  guestBilling: GuestBilling;
}

export interface ProductsData {
  simpleProduct: { name: string; searchTerm: string };
  featured: string[];
}

/** Aggregated, fully-typed view of all framework test data. */
export interface TestData {
  users: UsersData;
  search: SearchData;
  checkout: CheckoutData;
  products: ProductsData;
}

/** Loads and returns the complete, typed test-data set. */
export function loadTestData(): TestData {
  return {
    users: loadJson<UsersData>('users.json'),
    search: loadJson<SearchData>('search.json'),
    checkout: loadJson<CheckoutData>('checkout.json'),
    products: loadJson<ProductsData>('products.json'),
  };
}
