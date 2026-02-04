import * as huggingfaceService from '@/services/huggingface';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { queryKeys, useSearchDatasets, useSearchModels } from './use-queries';

// Mock HuggingFace service
vi.mock('@/services/huggingface');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('queryKeys', () => {
    it('should generate correct model search key', () => {
      const params = { search: 'bert', limit: 10 };
      const key = queryKeys.models.search(params);

      expect(key).toEqual(['models', 'search', params]);
    });

    it('should generate correct dataset search key', () => {
      const params = { search: 'imdb', limit: 5 };
      const key = queryKeys.datasets.search(params);

      expect(key).toEqual(['datasets', 'search', params]);
    });

    it('should generate correct model detail key', () => {
      const key = queryKeys.models.detail('bert-base-uncased');

      expect(key).toEqual(['models', 'detail', 'bert-base-uncased']);
    });

    it('should generate correct dataset readme key', () => {
      const key = queryKeys.datasets.readme('imdb');

      expect(key).toEqual(['datasets', 'readme', 'imdb']);
    });
  });

  describe('useSearchModels', () => {
    it('should fetch models successfully', async () => {
      const mockModels = [
        { id: 'model1', modelId: 'model1', downloads: 100 },
        { id: 'model2', modelId: 'model2', downloads: 50 },
      ];

      vi.mocked(huggingfaceService.searchModels).mockResolvedValue(mockModels);

      const { result } = renderHook(() => useSearchModels({ search: 'bert' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockModels);
      expect(huggingfaceService.searchModels).toHaveBeenCalledWith({ search: 'bert' });
    });

    it('should handle search errors', async () => {
      vi.mocked(huggingfaceService.searchModels).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useSearchModels({ search: 'invalid' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should be disabled when enabled is false', () => {
      const { result } = renderHook(() => useSearchModels({ search: 'bert' }, { enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(huggingfaceService.searchModels).not.toHaveBeenCalled();
    });

    it('should refetch when params change', async () => {
      const mockModels1 = [{ id: 'model1', modelId: 'model1', downloads: 100 }];
      const mockModels2 = [{ id: 'model2', modelId: 'model2', downloads: 50 }];

      vi.mocked(huggingfaceService.searchModels)
        .mockResolvedValueOnce(mockModels1)
        .mockResolvedValueOnce(mockModels2);

      const { result, rerender } = renderHook(({ params }) => useSearchModels(params), {
        wrapper: createWrapper(),
        initialProps: { params: { search: 'bert' } },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockModels1);

      rerender({ params: { search: 'gpt' } });

      await waitFor(() => expect(result.current.data).toEqual(mockModels2));
      expect(huggingfaceService.searchModels).toHaveBeenCalledTimes(2);
    });
  });

  describe('useSearchDatasets', () => {
    it('should fetch datasets successfully', async () => {
      const mockDatasets = [
        { id: 'dataset1', downloads: 200 },
        { id: 'dataset2', downloads: 150 },
      ];

      vi.mocked(huggingfaceService.searchDatasets).mockResolvedValue(mockDatasets);

      const { result } = renderHook(() => useSearchDatasets({ search: 'imdb' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockDatasets);
      expect(huggingfaceService.searchDatasets).toHaveBeenCalledWith({ search: 'imdb' });
    });

    it('should handle dataset search errors', async () => {
      vi.mocked(huggingfaceService.searchDatasets).mockRejectedValue(new Error('Not Found'));

      const { result } = renderHook(() => useSearchDatasets({ search: 'nonexistent' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should handle multiple dataset search requests', async () => {
      const mockDatasets = [{ id: 'dataset1', downloads: 200 }];

      vi.mocked(huggingfaceService.searchDatasets).mockResolvedValue(mockDatasets);

      const wrapper = createWrapper();

      // First call
      const { result: result1 } = renderHook(() => useSearchDatasets({ search: 'imdb' }), {
        wrapper,
      });

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));
      expect(result1.current.data).toEqual(mockDatasets);

      // Second hook with same params
      const { result: result2 } = renderHook(() => useSearchDatasets({ search: 'imdb' }), {
        wrapper,
      });

      // Should successfully fetch data
      await waitFor(() => expect(result2.current.isSuccess).toBe(true));
      expect(result2.current.data).toEqual(mockDatasets);
    });

    it('should pass limit and sort params correctly', async () => {
      const mockDatasets = [{ id: 'dataset1', downloads: 500 }];

      vi.mocked(huggingfaceService.searchDatasets).mockResolvedValue(mockDatasets);

      const params = { search: 'nlp', limit: 20, sort: 'downloads' as const };

      renderHook(() => useSearchDatasets(params), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(huggingfaceService.searchDatasets).toHaveBeenCalledWith(params);
      });
    });
  });
});
