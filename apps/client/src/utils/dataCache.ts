/**
 * Simple cache implementation with expiration
 */
export class DataCache<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private readonly ttl: number; // Time to live in milliseconds
  
  /**
   * Create a new cache
   * @param ttlMinutes Time to live in minutes, defaults to 5 minutes
   */
  constructor(ttlMinutes = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  /**
   * Get data from cache
   * @param key The cache key
   * @returns The cached data or null if not found/expired
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Set data in cache
   * @param key The cache key
   * @param data The data to cache
   */
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Remove data from cache
   * @param key The cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }
}
