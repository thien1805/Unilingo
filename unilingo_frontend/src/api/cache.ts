type CacheEntry<T> = {
  expiresAt: number;
  hasValue: boolean;
  value?: T;
  promise?: Promise<T>;
};

const cache = new Map<string, CacheEntry<unknown>>();

const stableSerialize = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;

  return Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== '')
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, entryValue]) => `${key}:${stableSerialize(entryValue)}`)
    .join('|');
};

export const makeCacheKey = (scope: string, params?: unknown) => {
  const serializedParams = stableSerialize(params);
  return serializedParams ? `${scope}?${serializedParams}` : scope;
};

export const getCached = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 30_000,
): Promise<T> => {
  const now = Date.now();
  const cached = cache.get(key) as CacheEntry<T> | undefined;

  if (cached?.hasValue && cached.expiresAt > now) {
    return cached.value as T;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = fetcher()
    .then((value) => {
      cache.set(key, {
        value,
        hasValue: true,
        expiresAt: Date.now() + ttlMs,
      });
      return value;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, {
    promise,
    hasValue: false,
    expiresAt: now + ttlMs,
  });

  return promise;
};

export const clearApiCache = (prefix?: string) => {
  if (!prefix) {
    cache.clear();
    return;
  }

  Array.from(cache.keys())
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => cache.delete(key));
};
