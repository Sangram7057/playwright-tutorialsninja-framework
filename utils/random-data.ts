/**
 * Deterministic-ish random test-data generation built on Faker.
 *
 * Responsibility (SRP): be the single source of fresh, unique test data so
 * tests never hardcode users/emails and never collide when run in parallel.
 *
 * Why: registration/checkout flows require unique data on every run. Centralising
 * generation keeps the shape of a "user" consistent everywhere it is needed.
 */
import { faker } from '@faker-js/faker';

/** Shape of a newly generated store user (matches the OpenCart register form). */
export interface GeneratedUser {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
}

/**
 * Generates a guaranteed-unique email by combining a faker handle with a
 * timestamp + random suffix — safe for parallel workers.
 */
export function randomEmail(domain = 'example.com'): string {
  const handle = faker.internet
    .username()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const unique = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return `${handle}.${unique}@${domain}`;
}

/** Generates a strong password that satisfies common complexity rules. */
export function randomPassword(length = 12): string {
  return faker.internet.password({
    length,
    memorable: false,
    pattern: /[A-Za-z0-9!@#$%]/,
  });
}

/** Generates a numeric telephone string. */
export function randomTelephone(): string {
  return faker.string.numeric({ length: 10 });
}

/**
 * Builds a complete, unique user object for registration tests.
 * Overrides allow tests to pin specific fields when needed.
 */
export function generateUser(overrides: Partial<GeneratedUser> = {}): GeneratedUser {
  const firstName = overrides.firstName ?? faker.person.firstName();
  const lastName = overrides.lastName ?? faker.person.lastName();

  return {
    firstName,
    lastName,
    email: overrides.email ?? randomEmail(),
    telephone: overrides.telephone ?? randomTelephone(),
    password: overrides.password ?? randomPassword(),
  };
}
