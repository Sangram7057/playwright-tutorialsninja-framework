/**
 * Named timeout constants (milliseconds).
 *
 * Responsibility (SRP): eliminate "magic numbers" for waits across the
 * framework. Reference these names instead of literal numbers so timing is
 * tunable in one place and self-documenting at the call site.
 */
export const TIMEOUTS = {
  /** Quick UI state changes (toggles, inline validation). */
  SHORT: 5_000,
  /** Default element interaction wait. */
  MEDIUM: 15_000,
  /** Page navigation / network-heavy operations. */
  LONG: 30_000,
  /** File download readiness. */
  DOWNLOAD: 30_000,
} as const;

export type TimeoutKey = keyof typeof TIMEOUTS;
