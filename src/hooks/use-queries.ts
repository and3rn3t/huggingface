import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchModels,
  searchDatasets,
  getModel,
  getDataset,
  getModelReadme,
  getDatasetReadme,
  generateText,
  summarizeText,
  classifyText,
  answerQuestion,
  translateText,
  runInference,
  HFModelSearchParams,
  HFDatasetSearchParams,
} from '@/services/huggingface';

// =============================================================================
// Query Keys
// =============================================================================

export const queryKeys = {
  models: {
    all: ['models'] as const,
    search: (params: HFModelSearchParams) => ['models', 'search', params] as const,
    detail: (id: string) => ['models', 'detail', id] as const,
    readme: (id: string) => ['models', 'readme', id] as const,
  },
  datasets: {
    all: ['datasets'] as const,
    search: (params: HFDatasetSearchParams) => ['datasets', 'search', params] as const,
    detail: (id: string) => ['datasets', 'detail', id] as const,
    readme: (id: string) => ['datasets', 'readme', id] as const,
  },
  trending: {
    all: ['trending'] as const,
  },
};

// =============================================================================
// Model Queries
// =============================================================================

export function useSearchModels(params: HFModelSearchParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.models.search(params),
    queryFn: () => searchModels(params),
    enabled: options?.enabled ?? true,
  });
}

export function useModel(modelId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.models.detail(modelId),
    queryFn: () => getModel(modelId),
    enabled: (options?.enabled ?? true) && !!modelId,
  });
}

export function useModelReadme(modelId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.models.readme(modelId),
    queryFn: () => getModelReadme(modelId),
    enabled: (options?.enabled ?? true) && !!modelId,
    retry: false, // Don't retry for missing READMEs
  });
}

// =============================================================================
// Dataset Queries
// =============================================================================

export function useSearchDatasets(params: HFDatasetSearchParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.datasets.search(params),
    queryFn: () => searchDatasets(params),
    enabled: options?.enabled ?? true,
  });
}

export function useDataset(datasetId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.datasets.detail(datasetId),
    queryFn: () => getDataset(datasetId),
    enabled: (options?.enabled ?? true) && !!datasetId,
  });
}

export function useDatasetReadme(datasetId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.datasets.readme(datasetId),
    queryFn: () => getDatasetReadme(datasetId),
    enabled: (options?.enabled ?? true) && !!datasetId,
    retry: false, // Don't retry for missing READMEs
  });
}

// =============================================================================
// Trending Query
// =============================================================================

export function useTrending() {
  return useQuery({
    queryKey: queryKeys.trending.all,
    queryFn: async () => {
      const [models, datasets] = await Promise.all([
        searchModels({ sort: 'downloads', direction: 'desc', limit: 10 }),
        searchDatasets({ sort: 'downloads', direction: 'desc', limit: 10 }),
      ]);
      return { models, datasets };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for trending
  });
}

// =============================================================================
// Inference Mutations
// =============================================================================

export function useTextGeneration() {
  return useMutation({
    mutationFn: ({
      modelId,
      prompt,
      options,
    }: {
      modelId: string;
      prompt: string;
      options?: { max_new_tokens?: number; temperature?: number; top_p?: number };
    }) => generateText(modelId, prompt, options),
  });
}

export function useSummarization() {
  return useMutation({
    mutationFn: ({
      modelId,
      text,
      options,
    }: {
      modelId: string;
      text: string;
      options?: { max_length?: number; min_length?: number };
    }) => summarizeText(modelId, text, options),
  });
}

export function useTextClassification() {
  return useMutation({
    mutationFn: ({ modelId, text }: { modelId: string; text: string }) =>
      classifyText(modelId, text),
  });
}

export function useQuestionAnswering() {
  return useMutation({
    mutationFn: ({
      modelId,
      question,
      context,
    }: {
      modelId: string;
      question: string;
      context: string;
    }) => answerQuestion(modelId, question, context),
  });
}

export function useTranslation() {
  return useMutation({
    mutationFn: ({ modelId, text }: { modelId: string; text: string }) =>
      translateText(modelId, text),
  });
}

export function useInference<T = unknown>() {
  return useMutation({
    mutationFn: ({
      modelId,
      input,
    }: {
      modelId: string;
      input: Parameters<typeof runInference>[1];
    }) => runInference<T>(modelId, input),
  });
}

// =============================================================================
// Cache Invalidation Helpers
// =============================================================================

export function useInvalidateModels() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.models.all });
}

export function useInvalidateDatasets() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.datasets.all });
}

export function usePrefetchModel() {
  const queryClient = useQueryClient();
  return (modelId: string) =>
    queryClient.prefetchQuery({
      queryKey: queryKeys.models.detail(modelId),
      queryFn: () => getModel(modelId),
    });
}

export function usePrefetchDataset() {
  const queryClient = useQueryClient();
  return (datasetId: string) =>
    queryClient.prefetchQuery({
      queryKey: queryKeys.datasets.detail(datasetId),
      queryFn: () => getDataset(datasetId),
    });
}
