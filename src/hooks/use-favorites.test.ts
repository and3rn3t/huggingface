import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useFavorites } from './use-favorites';

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Add/Remove Operations', () => {
    it('should add favorite with correct structure', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('model-123', 'model', 'GPT-2');
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0]).toEqual({
        id: 'model-123',
        type: 'model',
        name: 'GPT-2',
        addedAt: expect.any(Number),
      });
    });

    it('should prevent duplicate favorites (same id + type)', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('model-123', 'model', 'GPT-2');
        result.current.addFavorite('model-123', 'model', 'GPT-2');
      });

      expect(result.current.favorites).toHaveLength(1);
    });

    it('should allow same id with different type', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('same-id', 'model', 'GPT-2');
        result.current.addFavorite('same-id', 'dataset', 'IMDb Dataset');
      });

      expect(result.current.favorites).toHaveLength(2);
    });

    it('should remove favorite by id + type', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('model-123', 'model', 'GPT-2');
        result.current.addFavorite('dataset-456', 'dataset', 'IMDb');
      });

      act(() => {
        result.current.removeFavorite('model-123', 'model');
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].id).toBe('dataset-456');
    });

    it('should gracefully handle removing non-existent item', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('model-123', 'model', 'GPT-2');
      });

      act(() => {
        result.current.removeFavorite('non-existent', 'model');
      });

      expect(result.current.favorites).toHaveLength(1);
    });
  });

  describe('Toggle Operations', () => {
    it('should add if not favorited', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.toggleFavorite('model-123', 'model', 'GPT-2');
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.isFavorite('model-123', 'model')).toBe(true);
    });

    it('should remove if already favorited', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('model-123', 'model', 'GPT-2');
      });

      act(() => {
        result.current.toggleFavorite('model-123', 'model', 'GPT-2');
      });

      expect(result.current.favorites).toHaveLength(0);
      expect(result.current.isFavorite('model-123', 'model')).toBe(false);
    });

    it('should work correctly with multiple toggles', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.toggleFavorite('model-123', 'model', 'GPT-2');
      });
      expect(result.current.favorites).toHaveLength(1);

      act(() => {
        result.current.toggleFavorite('model-123', 'model', 'GPT-2');
      });
      expect(result.current.favorites).toHaveLength(0);

      act(() => {
        result.current.toggleFavorite('model-123', 'model', 'GPT-2');
      });
      expect(result.current.favorites).toHaveLength(1);
    });
  });

  describe('Filtering Operations', () => {
    it('should return correct subset with getFavoritesByType', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('model-1', 'model', 'GPT-2');
        result.current.addFavorite('model-2', 'model', 'BERT');
        result.current.addFavorite('dataset-1', 'dataset', 'IMDb');
      });

      const models = result.current.getFavoritesByType('model');
      const datasets = result.current.getFavoritesByType('dataset');

      expect(models).toHaveLength(2);
      expect(datasets).toHaveLength(1);
    });

    it('should return empty array for type with no favorites', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('model-1', 'model', 'GPT-2');
      });

      const datasets = result.current.getFavoritesByType('dataset');

      expect(datasets).toEqual([]);
    });
  });

  describe('Notes Management', () => {
    it('should update note on existing favorite', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('model-123', 'model', 'GPT-2');
      });

      act(() => {
        result.current.updateNote('model-123', 'model', 'Great model for text generation');
      });

      const note = result.current.getNote('model-123', 'model');
      expect(note).toBe('Great model for text generation');
    });

    it('should trim whitespace from notes', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('model-123', 'model', 'GPT-2');
      });

      act(() => {
        result.current.updateNote('model-123', 'model', '  spaced note  ');
      });

      const favorite = result.current.favorites.find(f => f.id === 'model-123');
      expect(favorite?.note).toBe('spaced note');
    });

    it('should convert empty notes to undefined', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('model-123', 'model', 'GPT-2');
      });

      act(() => {
        result.current.updateNote('model-123', 'model', 'Some note');
      });

      act(() => {
        result.current.updateNote('model-123', 'model', '   ');
      });

      const favorite = result.current.favorites.find(f => f.id === 'model-123');
      expect(favorite?.note).toBeUndefined();
    });

    it('should return empty string if note not found with getNote', () => {
      const { result } = renderHook(() => useFavorites());

      const note = result.current.getNote('non-existent', 'model');
      expect(note).toBe('');
    });

    it('should persist notes across operations', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('model-123', 'model', 'GPT-2');
        result.current.updateNote('model-123', 'model', 'My note');
      });

      act(() => {
        result.current.addFavorite('model-456', 'model', 'BERT');
      });

      const note = result.current.getNote('model-123', 'model');
      expect(note).toBe('My note');
    });
  });

  describe('Edge Cases', () => {
    it('should initialize empty favorites array', () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual([]);
    });

    it('should handle type mismatch in operations', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('id-123', 'model', 'GPT-2');
      });

      // Try to remove with wrong type
      act(() => {
        result.current.removeFavorite('id-123', 'dataset');
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.isFavorite('id-123', 'dataset')).toBe(false);
      expect(result.current.isFavorite('id-123', 'model')).toBe(true);
    });

    it('should handle corrupted localStorage with invalid JSON', () => {
      localStorage.setItem('hf-favorites', 'invalid json');

      const { result } = renderHook(() => useFavorites());

      // Should fallback to empty array
      expect(result.current.favorites).toEqual([]);
    });

    it('should persist favorites across hook instances', () => {
      const { result: result1 } = renderHook(() => useFavorites());

      act(() => {
        result1.current.addFavorite('model-123', 'model', 'GPT-2');
      });

      // Create new hook instance
      const { result: result2 } = renderHook(() => useFavorites());

      expect(result2.current.favorites).toHaveLength(1);
      expect(result2.current.favorites[0].id).toBe('model-123');
    });

    it('should maintain addedAt timestamp when adding favorites', () => {
      const { result } = renderHook(() => useFavorites());

      const before = Date.now();

      act(() => {
        result.current.addFavorite('model-123', 'model', 'GPT-2');
      });

      const after = Date.now();

      expect(result.current.favorites[0].addedAt).toBeGreaterThanOrEqual(before);
      expect(result.current.favorites[0].addedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('isFavorite Check', () => {
    it('should return true for existing favorite', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('model-123', 'model', 'GPT-2');
      });

      expect(result.current.isFavorite('model-123', 'model')).toBe(true);
    });

    it('should return false for non-existent favorite', () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.isFavorite('model-123', 'model')).toBe(false);
    });

    it('should require both id and type to match', () => {
      const { result } = renderHook(() => useFavorites());

      act(() => {
        result.current.addFavorite('id-123', 'model', 'GPT-2');
      });

      expect(result.current.isFavorite('id-123', 'model')).toBe(true);
      expect(result.current.isFavorite('id-123', 'dataset')).toBe(false);
      expect(result.current.isFavorite('different-id', 'model')).toBe(false);
    });
  });
});
