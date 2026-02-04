/**
 * HuggingFace API Service
 *
 * Typed client for HuggingFace APIs:
 * - Models API: Browse and search models
 * - Datasets API: Browse and search datasets
 * - Inference API: Run inference on models
 *
 * Token can be provided via:
 * 1. localStorage (key: 'hf_token')
 * 2. Environment variable (VITE_HF_TOKEN)
 */

// =============================================================================
// Types
// =============================================================================

export interface HFModel {
  id: string;
  modelId: string;
  author?: string;
  sha?: string;
  lastModified?: string;
  private?: boolean;
  disabled?: boolean;
  gated?: boolean | 'auto' | 'manual';
  pipeline_tag?: string;
  tags?: string[];
  downloads?: number;
  downloadsAllTime?: number;
  likes?: number;
  library_name?: string;
  createdAt?: string;
  cardData?: Record<string, unknown>;
  siblings?: Array<{ rfilename: string }>;
}

export interface HFDataset {
  id: string;
  author?: string;
  sha?: string;
  lastModified?: string;
  private?: boolean;
  disabled?: boolean;
  gated?: boolean | 'auto' | 'manual';
  tags?: string[];
  downloads?: number;
  downloadsAllTime?: number;
  likes?: number;
  createdAt?: string;
  cardData?: Record<string, unknown>;
  description?: string;
}

export interface HFSearchParams {
  search?: string;
  author?: string;
  filter?: string;
  sort?: 'downloads' | 'likes' | 'lastModified' | 'trending';
  direction?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface HFModelSearchParams extends HFSearchParams {
  pipeline_tag?: string;
  library?: string;
}

export interface HFDatasetSearchParams extends HFSearchParams {
  task_categories?: string;
  language?: string;
  size_categories?: string;
}

export type InferenceTask =
  | 'text-generation'
  | 'text-classification'
  | 'summarization'
  | 'translation'
  | 'question-answering'
  | 'fill-mask'
  | 'text2text-generation'
  | 'token-classification'
  | 'image-classification'
  | 'object-detection'
  | 'image-segmentation'
  | 'automatic-speech-recognition'
  | 'audio-classification';

export interface ConversationalInput {
  text: string;
  past_user_inputs?: string[];
  generated_responses?: string[];
}

export interface InferenceInput {
  inputs: string | string[] | Record<string, string> | ConversationalInput;
  parameters?: Record<string, unknown>;
  options?: {
    use_cache?: boolean;
    wait_for_model?: boolean;
  };
}

export interface InferenceResponse<T = unknown> {
  data: T;
  status: number;
}

export interface APIError {
  message: string;
  status: number;
  isRateLimit: boolean;
  isUnauthorized: boolean;
  isNetworkError: boolean;
  retryAfter?: number;
}

// =============================================================================
// Token Management
// =============================================================================

const TOKEN_STORAGE_KEY = 'hf_token';

/**
 * Get the HuggingFace API token from localStorage or environment
 */
export function getToken(): string | null {
  // First check localStorage
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (storedToken) {
    return storedToken;
  }

  // Fall back to environment variable
  const envToken = import.meta.env.VITE_HF_TOKEN;
  if (envToken) {
    return envToken;
  }

  return null;
}

/**
 * Save the HuggingFace API token to localStorage
 */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Remove the HuggingFace API token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Check if a token is currently configured
 */
export function hasToken(): boolean {
  return getToken() !== null;
}

// =============================================================================
// API Client
// =============================================================================

const HF_API_BASE = 'https://huggingface.co/api';
const HF_INFERENCE_BASE = 'https://api-inference.huggingface.co/models';

/**
 * Create headers for API requests
 */
function createHeaders(requiresAuth = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (requiresAuth) {
    throw new Error('API token required but not configured');
  }

  return headers;
}

/**
 * Parse API errors into a consistent format
 */
export function parseAPIError(error: unknown, status?: number): APIError {
  // Network error (fetch failed)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Network error - please check your internet connection',
      status: 0,
      isRateLimit: false,
      isUnauthorized: false,
      isNetworkError: true,
    };
  }

  // HTTP error response
  if (status) {
    if (status === 429) {
      return {
        message: 'Too many requests - please wait a moment and try again',
        status: 429,
        isRateLimit: true,
        isUnauthorized: false,
        isNetworkError: false,
        retryAfter: 60, // Default to 60 seconds
      };
    }

    if (status === 401) {
      return {
        message: 'Invalid or expired API token - please check your settings',
        status: 401,
        isRateLimit: false,
        isUnauthorized: true,
        isNetworkError: false,
      };
    }

    if (status === 403) {
      return {
        message: 'Access denied - you may not have permission to access this resource',
        status: 403,
        isRateLimit: false,
        isUnauthorized: true,
        isNetworkError: false,
      };
    }

    if (status === 404) {
      return {
        message: 'Resource not found',
        status: 404,
        isRateLimit: false,
        isUnauthorized: false,
        isNetworkError: false,
      };
    }

    if (status >= 500) {
      return {
        message: 'HuggingFace server error - please try again later',
        status,
        isRateLimit: false,
        isUnauthorized: false,
        isNetworkError: false,
      };
    }
  }

  // Generic error
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return {
    message,
    status: status || 0,
    isRateLimit: false,
    isUnauthorized: false,
    isNetworkError: false,
  };
}

/**
 * Make an API request with error handling
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  requiresAuth = false
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...createHeaders(requiresAuth),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = parseAPIError(errorData.error || errorData, response.status);
      throw apiError;
    }

    return await response.json();
  } catch (error) {
    if ((error as APIError).isRateLimit !== undefined) {
      // Already parsed API error
      throw error;
    }
    throw parseAPIError(error);
  }
}

// =============================================================================
// Models API
// =============================================================================

/**
 * Search/list models from HuggingFace Hub
 */
export async function searchModels(params: HFModelSearchParams = {}): Promise<HFModel[]> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.author) searchParams.set('author', params.author);
  if (params.filter) searchParams.set('filter', params.filter);
  if (params.pipeline_tag) searchParams.set('pipeline_tag', params.pipeline_tag);
  if (params.library) searchParams.set('library', params.library);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.direction) searchParams.set('direction', params.direction === 'desc' ? '-1' : '1');
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());

  const url = `${HF_API_BASE}/models?${searchParams.toString()}`;
  return apiRequest<HFModel[]>(url);
}

/**
 * Get a specific model by ID
 */
export async function getModel(modelId: string): Promise<HFModel> {
  const url = `${HF_API_BASE}/models/${modelId}`;
  return apiRequest<HFModel>(url);
}

/**
 * Get the README content for a model
 */
export async function getModelReadme(modelId: string): Promise<string> {
  const url = `https://huggingface.co/${modelId}/raw/main/README.md`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      return ''; // No README available
    }
    throw parseAPIError(null, response.status);
  }
  return response.text();
}

// =============================================================================
// Datasets API
// =============================================================================

/**
 * Search/list datasets from HuggingFace Hub
 */
export async function searchDatasets(params: HFDatasetSearchParams = {}): Promise<HFDataset[]> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.author) searchParams.set('author', params.author);
  if (params.filter) searchParams.set('filter', params.filter);
  if (params.task_categories) searchParams.set('task_categories', params.task_categories);
  if (params.language) searchParams.set('language', params.language);
  if (params.size_categories) searchParams.set('size_categories', params.size_categories);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.direction) searchParams.set('direction', params.direction === 'desc' ? '-1' : '1');
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());

  const url = `${HF_API_BASE}/datasets?${searchParams.toString()}`;
  return apiRequest<HFDataset[]>(url);
}

/**
 * Get a specific dataset by ID
 */
export async function getDataset(datasetId: string): Promise<HFDataset> {
  const url = `${HF_API_BASE}/datasets/${datasetId}`;
  return apiRequest<HFDataset>(url);
}

/**
 * Get the README content for a dataset
 */
export async function getDatasetReadme(datasetId: string): Promise<string> {
  const url = `https://huggingface.co/datasets/${datasetId}/raw/main/README.md`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      return ''; // No README available
    }
    throw parseAPIError(null, response.status);
  }
  return response.text();
}

// =============================================================================
// Inference API
// =============================================================================

/**
 * Run inference on a model
 * Requires an API token for most models
 */
export async function runInference<T = unknown>(
  modelId: string,
  input: InferenceInput
): Promise<T> {
  const url = `${HF_INFERENCE_BASE}/${modelId}`;
  return apiRequest<T>(
    url,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    true // Inference API requires auth
  );
}

/**
 * Text generation inference
 */
export async function generateText(
  modelId: string,
  prompt: string,
  options?: {
    max_new_tokens?: number;
    temperature?: number;
    top_p?: number;
    do_sample?: boolean;
  }
): Promise<Array<{ generated_text: string }>> {
  return runInference(modelId, {
    inputs: prompt,
    parameters: options,
    options: { wait_for_model: true },
  });
}

/**
 * Text classification inference
 */
export async function classifyText(
  modelId: string,
  text: string
): Promise<Array<Array<{ label: string; score: number }>>> {
  return runInference(modelId, {
    inputs: text,
    options: { wait_for_model: true },
  });
}

/**
 * Summarization inference
 */
export async function summarizeText(
  modelId: string,
  text: string,
  options?: {
    max_length?: number;
    min_length?: number;
  }
): Promise<Array<{ summary_text: string }>> {
  return runInference(modelId, {
    inputs: text,
    parameters: options,
    options: { wait_for_model: true },
  });
}

/**
 * Translation inference
 */
export async function translateText(
  modelId: string,
  text: string
): Promise<Array<{ translation_text: string }>> {
  return runInference(modelId, {
    inputs: text,
    options: { wait_for_model: true },
  });
}

/**
 * Question answering inference
 */
export async function answerQuestion(
  modelId: string,
  question: string,
  context: string
): Promise<{ answer: string; score: number; start: number; end: number }> {
  return runInference(modelId, {
    inputs: {
      question,
      context,
    },
    options: { wait_for_model: true },
  });
}

/**
 * Fill mask inference
 */
export async function fillMask(
  modelId: string,
  text: string
): Promise<Array<{ sequence: string; score: number; token: number; token_str: string }>> {
  return runInference(modelId, {
    inputs: text,
    options: { wait_for_model: true },
  });
}

// =============================================================================
// Token Validation
// =============================================================================

/**
 * Validate an API token by making a test request
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get user info for the current token
 */
export async function getCurrentUser(): Promise<{
  name: string;
  fullname?: string;
  email?: string;
  avatarUrl?: string;
} | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      name: data.name,
      fullname: data.fullname,
      email: data.email,
      avatarUrl: data.avatarUrl,
    };
  } catch {
    return null;
  }
}
