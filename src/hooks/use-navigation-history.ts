import { useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';

interface NavigationHistoryEntry {
  tab: string;
  timestamp: number;
}

export function useNavigationHistory() {
  const [history, setHistory] = useLocalStorage<NavigationHistoryEntry[]>('navigation-history', []);

  const pushToHistory = useCallback(
    (tab: string) => {
      setHistory((current) => {
        const arr = current || [];
        const lastEntry = arr[arr.length - 1];

        if (lastEntry?.tab === tab) {
          return arr;
        }

        const newEntry: NavigationHistoryEntry = {
          tab,
          timestamp: Date.now(),
        };

        const newHistory = [...arr, newEntry];
        return newHistory.slice(-20);
      });
    },
    [setHistory]
  );

  const goBack = useCallback((): string | null => {
    let previousTab: string | null = null;

    setHistory((current) => {
      const arr = current || [];
      if (arr.length <= 1) {
        return arr;
      }

      const newHistory = arr.slice(0, -1);
      previousTab = newHistory[newHistory.length - 1]?.tab || null;
      return newHistory;
    });

    return previousTab;
  }, [setHistory]);

  const canGoBack = (history?.length || 0) > 1;

  const getPreviousTab = useCallback((): string | null => {
    if (!history || history.length <= 1) {
      return null;
    }
    return history[history.length - 2]?.tab || null;
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return {
    history: history || [],
    pushToHistory,
    goBack,
    canGoBack,
    getPreviousTab,
    clearHistory,
  };
}
