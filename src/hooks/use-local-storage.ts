import { useCallback, useEffect, useState } from 'react';

/**
 * A localStorage-based hook that mimics the @github/spark useKV API.
 * This works for local development where the Spark KV backend isn't available.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (updater: T | ((current: T) => T)) => void] {
  // Initialize state from localStorage or default value
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // Persist to localStorage whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${key}`, error);
    }
  }, [key, value]);

  // Updater function that matches useKV API
  const updateValue = useCallback((updater: T | ((current: T) => T)) => {
    setValue((current) => {
      if (typeof updater === 'function') {
        return (updater as (current: T) => T)(current);
      }
      return updater;
    });
  }, []);

  return [value, updateValue];
}
