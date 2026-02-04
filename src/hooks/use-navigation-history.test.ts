import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useNavigationHistory } from './use-navigation-history';

describe('useNavigationHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useNavigationHistory());

    expect(result.current.history).toEqual([]);
    expect(result.current.canGoBack).toBe(false);
  });

  it('should push new tab to history', () => {
    const { result } = renderHook(() => useNavigationHistory());

    act(() => {
      result.current.pushToHistory('datasets');
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].tab).toBe('datasets');
  });

  it('should not add duplicate consecutive tabs', () => {
    const { result } = renderHook(() => useNavigationHistory());

    act(() => {
      result.current.pushToHistory('datasets');
      result.current.pushToHistory('datasets'); // Duplicate
    });

    expect(result.current.history).toHaveLength(1);
  });

  it('should add different tabs to history', () => {
    const { result } = renderHook(() => useNavigationHistory());

    act(() => {
      result.current.pushToHistory('datasets');
      result.current.pushToHistory('models');
      result.current.pushToHistory('playground');
    });

    expect(result.current.history).toHaveLength(3);
    expect(result.current.history.map((h) => h.tab)).toEqual(['datasets', 'models', 'playground']);
  });

  it('should limit history to 20 entries', () => {
    const { result } = renderHook(() => useNavigationHistory());

    act(() => {
      for (let i = 0; i < 25; i++) {
        result.current.pushToHistory(`tab-${i}`);
      }
    });

    expect(result.current.history).toHaveLength(20);
    // Should keep the last 20
    expect(result.current.history[0].tab).toBe('tab-5');
    expect(result.current.history[19].tab).toBe('tab-24');
  });

  it('should go back and return previous tab', () => {
    const { result } = renderHook(() => useNavigationHistory());

    act(() => {
      result.current.pushToHistory('datasets');
      result.current.pushToHistory('models');
      result.current.pushToHistory('playground');
    });

    act(() => {
      result.current.goBack();
    });

    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[1].tab).toBe('models');
  });

  it('should not go back when history has only one entry', () => {
    const { result } = renderHook(() => useNavigationHistory());

    act(() => {
      result.current.pushToHistory('datasets');
    });

    let previousTab: string | null = null;

    act(() => {
      previousTab = result.current.goBack();
    });

    expect(previousTab).toBeNull();
    expect(result.current.history).toHaveLength(1);
  });

  it('should update canGoBack correctly', () => {
    const { result } = renderHook(() => useNavigationHistory());

    expect(result.current.canGoBack).toBe(false);

    act(() => {
      result.current.pushToHistory('datasets');
    });

    expect(result.current.canGoBack).toBe(false);

    act(() => {
      result.current.pushToHistory('models');
    });

    expect(result.current.canGoBack).toBe(true);
  });

  it('should get previous tab without modifying history', () => {
    const { result } = renderHook(() => useNavigationHistory());

    act(() => {
      result.current.pushToHistory('datasets');
      result.current.pushToHistory('models');
      result.current.pushToHistory('playground');
    });

    const previousTab = result.current.getPreviousTab();

    expect(previousTab).toBe('models');
    expect(result.current.history).toHaveLength(3);
  });

  it('should return null when getting previous tab with insufficient history', () => {
    const { result } = renderHook(() => useNavigationHistory());

    expect(result.current.getPreviousTab()).toBeNull();

    act(() => {
      result.current.pushToHistory('datasets');
    });

    expect(result.current.getPreviousTab()).toBeNull();
  });

  it('should clear history', () => {
    const { result } = renderHook(() => useNavigationHistory());

    act(() => {
      result.current.pushToHistory('datasets');
      result.current.pushToHistory('models');
      result.current.pushToHistory('playground');
    });

    expect(result.current.history).toHaveLength(3);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
    expect(result.current.canGoBack).toBe(false);
  });

  it('should persist history across hook instances', () => {
    const { result: result1 } = renderHook(() => useNavigationHistory());

    act(() => {
      result1.current.pushToHistory('datasets');
      result1.current.pushToHistory('models');
    });

    // Create new hook instance
    const { result: result2 } = renderHook(() => useNavigationHistory());

    expect(result2.current.history).toHaveLength(2);
    expect(result2.current.history[0].tab).toBe('datasets');
    expect(result2.current.history[1].tab).toBe('models');
  });

  it('should add timestamps to history entries', () => {
    const { result } = renderHook(() => useNavigationHistory());

    const before = Date.now();

    act(() => {
      result.current.pushToHistory('datasets');
    });

    const after = Date.now();

    expect(result.current.history[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(result.current.history[0].timestamp).toBeLessThanOrEqual(after);
  });
});
