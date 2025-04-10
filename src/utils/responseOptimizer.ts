
// Utilities to optimize response time and performance

/**
 * Detects network conditions and adjusts response strategy
 */
export const detectNetworkConditions = async (): Promise<{
  connectionType?: string;
  downlinkSpeed?: number;
  latency: number;
  isOfflineMode: boolean;
}> => {
  const result = {
    connectionType: undefined as string | undefined,
    downlinkSpeed: undefined as number | undefined,
    latency: 0,
    isOfflineMode: false
  };
  
  // Check if we're offline first
  result.isOfflineMode = !navigator.onLine;
  if (result.isOfflineMode) {
    return result; // Return early if offline
  }
  
  // Get network information if available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      result.connectionType = connection.effectiveType;
      result.downlinkSpeed = connection.downlink;
    }
  }
  
  // Measure latency with a simple ping test
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const startTime = performance.now();
    const response = await fetch('/ping', { 
      method: 'HEAD',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const endTime = performance.now();
    result.latency = endTime - startTime;
  } catch (error) {
    console.warn('Latency test failed, using estimate:', error);
    // Use a reasonable default based on connection type or a static fallback
    if (result.connectionType === '4g') {
      result.latency = 100;
    } else if (result.connectionType === '3g') {
      result.latency = 300;
    } else if (result.connectionType === '2g') {
      result.latency = 750;
    } else {
      result.latency = 200; // Default assumption
    }
  }
  
  return result;
};

/**
 * Determines the optimal response strategy based on network conditions
 */
export const getOptimalResponseStrategy = (
  networkConditions: {
    connectionType?: string;
    downlinkSpeed?: number;
    latency: number;
    isOfflineMode: boolean;
  },
  responseSize: 'small' | 'medium' | 'large' = 'medium'
): {
  useStreaming: boolean;
  useCaching: boolean;
  useCompression: boolean;
  requestTimeout: number;
  chunkSize?: number;
} => {
  const { connectionType, downlinkSpeed, latency, isOfflineMode } = networkConditions;
  
  // Default conservative settings
  const result = {
    useStreaming: false,
    useCaching: true,
    useCompression: false,
    requestTimeout: 10000, // 10 seconds default
    chunkSize: undefined as number | undefined
  };
  
  // Offline mode - maximum caching, no streaming
  if (isOfflineMode) {
    result.useStreaming = false;
    result.useCaching = true;
    result.useCompression = true;
    result.requestTimeout = 5000; // Lower timeout when offline
    return result;
  }
  
  // Adjust based on connection type
  if (connectionType === '4g' || connectionType === 'wifi') {
    result.useStreaming = true;
    result.useCompression = responseSize === 'large';
    result.requestTimeout = 15000;
  } else if (connectionType === '3g') {
    result.useStreaming = responseSize !== 'large';
    result.useCompression = true;
    result.requestTimeout = 20000;
    result.chunkSize = 4096; // Smaller chunks for slower connections
  } else if (connectionType === '2g') {
    result.useStreaming = false;
    result.useCompression = true;
    result.requestTimeout = 30000;
  }
  
  // High latency adjustments
  if (latency > 500) {
    result.useStreaming = false; // Disable streaming on high latency
    result.requestTimeout += 5000; // Add more time for high latency
  }
  
  // Downlink speed adjustments (if available)
  if (downlinkSpeed !== undefined) {
    if (downlinkSpeed < 1) { // Less than 1 Mbps
      result.useStreaming = false;
      result.useCompression = true;
      result.chunkSize = 2048; // Very small chunks
    } else if (downlinkSpeed > 10) { // More than 10 Mbps
      result.useStreaming = true;
      result.useCompression = false; // No need for compression on fast connections
    }
  }
  
  return result;
};

/**
 * Creates a cached version of an async function with specified TTL
 */
export function createCachedFunction<T, A extends any[]>(
  fn: (...args: A) => Promise<T>,
  ttlMs: number = 60000, // Default 1 minute TTL
  cacheKeyFn: (...args: A) => string = (...args) => JSON.stringify(args)
): (...args: A) => Promise<T> {
  const cache = new Map<string, { value: T; timestamp: number }>();
  
  return async (...args: A): Promise<T> => {
    const cacheKey = cacheKeyFn(...args);
    const cached = cache.get(cacheKey);
    
    // Check if we have a valid cached result
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      console.log('Cache hit for:', cacheKey);
      return cached.value;
    }
    
    // Otherwise call the function and cache the result
    console.log('Cache miss for:', cacheKey);
    const result = await fn(...args);
    cache.set(cacheKey, { value: result, timestamp: Date.now() });
    
    // Clean up expired entries occasionally
    if (Math.random() < 0.1) { // 10% chance to clean up on each call
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > ttlMs) {
          cache.delete(key);
        }
      }
    }
    
    return result;
  };
}

/**
 * Creates an auto-retry wrapper for API calls
 */
export function createRetryableFunction<T, A extends any[]>(
  fn: (...args: A) => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
  shouldRetry: (error: any) => boolean = () => true
): (...args: A) => Promise<T> {
  return async (...args: A): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        
        if (!shouldRetry(error) || attempt >= maxRetries - 1) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = baseDelayMs * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
}
