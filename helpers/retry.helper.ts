/**
 * Generic asynchronous retry utility with exponential backoff.
 *
 * Responsibility (SRP): retry any flaky async operation in ONE well-tested
 * place, with consistent logging — instead of copy-pasting try/catch loops.
 *
 * Note: this complements (does not replace) Playwright's web-first auto-waiting.
 * Use it only for genuinely non-deterministic operations (e.g. an API call,
 * an eventually-consistent UI state) — never to paper over a missing assertion.
 */
import { createLogger } from '@utils/logger';

const log = createLogger('Retry');

/** Options controlling retry behaviour. */
export interface RetryOptions {
  /** Maximum attempts before giving up (must be >= 1). */
  retries?: number;
  /** Initial delay between attempts, in milliseconds. */
  delayMs?: number;
  /** Multiplier applied to the delay after each failed attempt. */
  backoffFactor?: number;
  /** Human-friendly description used in logs. */
  description?: string;
}

const DEFAULTS: Required<Omit<RetryOptions, 'description'>> = {
  retries: 3,
  delayMs: 500,
  backoffFactor: 2,
};

/** Promise-based sleep (used internally for backoff). */
function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

/**
 * Executes `action` and retries on failure using exponential backoff.
 * Returns the action's resolved value, or throws the last error after all
 * attempts are exhausted.
 */
export async function retryAsync<T>(
  action: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { retries, delayMs, backoffFactor } = { ...DEFAULTS, ...options };
  const label = options.description ?? 'operation';

  let lastError: unknown;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);

      if (attempt < retries) {
        log.warn(
          `Attempt ${attempt}/${retries} for "${label}" failed: ${message}. ` +
            `Retrying in ${currentDelay}ms.`,
        );
        await sleep(currentDelay);
        currentDelay *= backoffFactor;
      } else {
        log.error(`All ${retries} attempts for "${label}" failed: ${message}.`);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Retry failed for "${label}": ${String(lastError)}`);
}
