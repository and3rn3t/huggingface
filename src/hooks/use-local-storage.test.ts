import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from './use-local-storage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should read from localStorage if value exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });

  it('should handle function updater', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(localStorage.getItem('counter')).toBe('1');
  });

  it('should handle complex objects', () => {
    const { result } = renderHook(() =>
      useLocalStorage('user', { name: 'John', age: 30 })
    );

    act(() => {
      result.current[1]({ name: 'Jane', age: 25 });
    });

    expect(result.current[0]).toEqual({ name: 'Jane', age: 25 });
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual({
      name: 'Jane',
      age: 25,
    });
  });

  it('should handle arrays', () => {
    const { result } = renderHook(() => useLocalStorage('items', [1, 2, 3]));

    act(() => {
      result.current[1]((prev) => [...prev, 4]);
    });

    expect(result.current[0]).toEqual([1, 2, 3, 4]);
  });

  it('should handle invalid JSON gracefully', () => {
    localStorage.setItem('test-key', 'invalid-json{');
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should persist across hook re-renders', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('persist', 'value1'));

    act(() => {
      result.current[1]('value2');
    });

    rerender();

    expect(result.current[0]).toBe('value2');
  });
});
