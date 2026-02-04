import { useKV } from '@github/spark/hooks'
import { useEffect, useCallback } from 'react'

interface NavigationHistoryEntry {
  tab: string
  timestamp: number
}

export function useNavigationHistory() {
  const [history, setHistory] = useKV<NavigationHistoryEntry[]>('navigation-history', [])

  const pushToHistory = useCallback((tab: string) => {
    setHistory((current = []) => {
      const lastEntry = current[current.length - 1]
      
      if (lastEntry?.tab === tab) {
        return current
      }

      const newEntry: NavigationHistoryEntry = {
        tab,
        timestamp: Date.now()
      }

      const newHistory = [...current, newEntry]
      return newHistory.slice(-20)
    })
  }, [setHistory])

  const goBack = useCallback((): string | null => {
    let previousTab: string | null = null

    setHistory((current = []) => {
      if (current.length <= 1) {
        return current
      }

      const newHistory = current.slice(0, -1)
      previousTab = newHistory[newHistory.length - 1]?.tab || null
      return newHistory
    })

    return previousTab
  }, [setHistory])

  const canGoBack = (history?.length || 0) > 1

  const getPreviousTab = useCallback((): string | null => {
    if (!history || history.length <= 1) {
      return null
    }
    return history[history.length - 2]?.tab || null
  }, [history])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [setHistory])

  return {
    history: history || [],
    pushToHistory,
    goBack,
    canGoBack,
    getPreviousTab,
    clearHistory
  }
}
