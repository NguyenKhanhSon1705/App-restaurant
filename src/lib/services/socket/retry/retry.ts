export type RetryOptions = {
  readonly maxRetries?: number;
  readonly delay?: number;
  readonly backoffMultiplier?: number;
  readonly shouldRetry?: (error: unknown) => boolean;
};

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_DELAY = 1000;
const DEFAULT_BACKOFF_MULTIPLIER = 2;

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    delay = DEFAULT_DELAY,
    backoffMultiplier = DEFAULT_BACKOFF_MULTIPLIER,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;
  let currentDelay = delay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      await sleep(currentDelay);
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError;
};

