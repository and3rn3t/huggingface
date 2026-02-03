import { useKV } from '@github/spark/hooks'
import { useCallback } from 'react'

export interface FavoriteItem {
  id: string
  type: 'dataset' | 'model'
  name: string
  addedAt: number
  note?: string
}

export function useFavorites() {
  const [favorites, setFavorites] = useKV<FavoriteItem[]>('hf-favorites', [])

  const addFavorite = useCallback((id: string, type: 'dataset' | 'model', name: string) => {
    setFavorites((current = []) => {
      const exists = current.some(fav => fav.id === id && fav.type === type)
      if (exists) return current
      
      return [...current, { id, type, name, addedAt: Date.now() }]
    })
  }, [setFavorites])

  const removeFavorite = useCallback((id: string, type: 'dataset' | 'model') => {
    setFavorites((current = []) => current.filter(fav => !(fav.id === id && fav.type === type)))
  }, [setFavorites])

  const isFavorite = useCallback((id: string, type: 'dataset' | 'model') => {
    return (favorites || []).some(fav => fav.id === id && fav.type === type)
  }, [favorites])

  const toggleFavorite = useCallback((id: string, type: 'dataset' | 'model', name: string) => {
    if (isFavorite(id, type)) {
      removeFavorite(id, type)
    } else {
      addFavorite(id, type, name)
    }
  }, [isFavorite, addFavorite, removeFavorite])

  const getFavoritesByType = useCallback((type: 'dataset' | 'model') => {
    return (favorites || []).filter(fav => fav.type === type)
  }, [favorites])

  const updateNote = useCallback((id: string, type: 'dataset' | 'model', note: string) => {
    setFavorites((current = []) => {
      return current.map(fav => 
        fav.id === id && fav.type === type 
          ? { ...fav, note: note.trim() || undefined }
          : fav
      )
    })
  }, [setFavorites])

  const getNote = useCallback((id: string, type: 'dataset' | 'model') => {
    const favorite = (favorites || []).find(fav => fav.id === id && fav.type === type)
    return favorite?.note || ''
  }, [favorites])

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    getFavoritesByType,
    updateNote,
    getNote,
  }
}
