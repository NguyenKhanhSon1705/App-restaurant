const RETRYABLE_ERRORS = [
  'network',
  'timeout',
  'connection',
  'transport',
  'server',
  'temporary',
  '503',
  '502',
  '504',
  'failed to start',
] as const;

export const isRetryableError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;

  const errorMessage = error.message.toLowerCase();
  return RETRYABLE_ERRORS.some((errorType) => errorMessage.includes(errorType));
};

