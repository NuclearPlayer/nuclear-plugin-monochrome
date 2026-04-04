export const METADATA_PROVIDER_ID = 'monochrome';
export const STREAMING_PROVIDER_ID = 'monochrome-stream';
export const REQUEST_TIMEOUT_MS = 12_000;
export const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
export const BACKOFF_BASE_MS = 500;
export const BACKOFF_MAX_MS = 5_000;
