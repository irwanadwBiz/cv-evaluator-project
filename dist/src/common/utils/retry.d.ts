export declare function retryWithBackoff<T>(fn: () => Promise<T>, opts?: {
    maxRetries?: number;
    baseDelayMs?: number;
    factor?: number;
}): Promise<T>;
