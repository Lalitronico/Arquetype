// Simple in-memory cache with TTL expiration

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class SimpleCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxEntries = 500;

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    // Evict oldest entry when at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance for the application
export const appCache = new SimpleCache();

// TTL constants (in milliseconds)
export const ORG_TTL = 5 * 60 * 1000; // 5 minutes
export const BILLING_TTL = 5 * 60 * 1000; // 5 minutes
export const TEMPLATES_TTL = 30 * 60 * 1000; // 30 minutes
export const ANALYTICS_TTL = 2 * 60 * 1000; // 2 minutes
