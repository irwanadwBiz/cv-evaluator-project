export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  opts?: { maxRetries?: number; baseDelayMs?: number; factor?: number }
): Promise<T> {
  const max = opts?.maxRetries ?? Number(process.env.MAX_RETRIES ?? 3);
  const base = opts?.baseDelayMs ?? Number(process.env.BASE_BACKOFF_MS ?? 500);
  const factor = opts?.factor ?? 2;

  let attempt = 0;
  let lastErr: unknown;
  while (attempt <= max) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === max) break;
      const delay = base * Math.pow(factor, attempt) + Math.random() * 250;
      await new Promise(res => setTimeout(res, delay));
      attempt += 1;
    }
  }
  throw lastErr;
}
