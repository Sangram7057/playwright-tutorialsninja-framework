/**
 * Small, dependency-free date utilities.
 *
 * Responsibility (SRP): produce consistent, filesystem-safe timestamps and
 * formatted dates used across logging, screenshots and reporting — so date
 * formatting is never duplicated or done ad-hoc in multiple modules.
 */

/** ISO-8601 timestamp, e.g. `2026-06-26T10:15:30.123Z`. */
export function isoNow(): string {
  return new Date().toISOString();
}

/**
 * Filesystem-safe timestamp suitable for file names,
 * e.g. `2026-06-26_10-15-30-123`.
 */
export function fileSafeTimestamp(date: Date = new Date()): string {
  return date
    .toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .replace(/\./g, '-')
    .replace(/Z$/, '');
}

/** Human-readable timestamp, e.g. `2026-06-26 10:15:30`. */
export function humanReadable(date: Date = new Date()): string {
  return date.toISOString().replace('T', ' ').replace(/\..+/, '');
}
