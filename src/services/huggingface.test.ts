import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getToken,
  saveToken,
  searchModels,
  searchDatasets,
  runInference,
  getModel,
  getModelReadme,
  parseAPIError,
  type HFModel,
  type HFDataset,
} from './huggingface';

describe('Token Management', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should get token from localStorage', () => {
    const testToken = 'hf_test123';
    localStorage.setItem('hf_token', testToken);
    expect(getToken()).toBe(testToken);
  });

  it('should save token to localStorage', () => {
    const testToken = 'hf_test456';
    saveToken(testToken);
    expect(localStorage.getItem('hf_token')).toBe(testToken);
  });

  it('should return null when no token is available', () => {
    expect(getToken()).toBeNull();
  });
});

describe('Search Models', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should search models successfully', async () => {
    const mockModels: HFModel[] = [
      {
        id: 'gpt2',
        modelId: 'gpt2',
        downloads: 1000000,
        likes: 500,
        pipeline_tag: 'text-generation',
      },
    ];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockModels,
    });

    const results = await searchModels({ search: 'gpt2', limit: 10 });
    expect(results).toEqual(mockModels);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/models'),
      expect.any(Object)
    );
  });

  it('should search models with filters', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await searchModels({
      search: 'gpt',
      author: 'openai',
      pipeline_tag: 'text-generation',
      library: 'transformers',
      sort: 'downloads',
      direction: 'desc',
      limit: 20,
      offset: 10,
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('search=gpt'),
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('author=openai'),
      expect.any(Object)
    );
  });

  it('should handle API errors', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(searchModels({ search: 'test' })).rejects.toThrow();
  });

  it('should handle rate limiting', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: new Headers({ 'Retry-After': '60' }),
    });

    await expect(searchModels({ search: 'test' })).rejects.toThrow();
  });
});

describe('Search Datasets', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should search datasets successfully', async () => {
    const mockDatasets: HFDataset[] = [
      {
        id: 'imdb',
        downloads: 50000,
        likes: 100,
        tags: ['text-classification'],
      },
    ];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDatasets,
    });

    const results = await searchDatasets({ search: 'imdb', limit: 10 });
    expect(results).toEqual(mockDatasets);
  });

  it('should handle network errors', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(searchDatasets({ search: 'test' })).rejects.toThrow();
  });
});

describe('Run Inference', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.setItem('hf_token', 'hf_test123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should run inference successfully', async () => {
    const mockResponse = [{ generated_text: 'Hello world!' }];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await runInference('gpt2', {
      inputs: 'Hello',
      parameters: { max_length: 50 },
    });

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/gpt2'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer hf_test123',
        }),
      })
    );
  });

  it('should handle unauthorized errors', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    await expect(
      runInference('gpt2', { inputs: 'test' })
    ).rejects.toThrow();
  });

  it('should require token for inference', async () => {
    localStorage.clear();

    await expect(
      runInference('gpt2', { inputs: 'test' })
    ).rejects.toThrow('API token required');
  });

  it('should handle model loading time', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => ({ estimated_time: 20 }),
    });

    await expect(
      runInference('large-model', { inputs: 'test' })
    ).rejects.toThrow();
  });
});

describe('Get Model', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should get model by ID', async () => {
    const mockModel: HFModel = {
      id: 'gpt2',
      modelId: 'gpt2',
      downloads: 1000000,
      pipeline_tag: 'text-generation',
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockModel,
    });

    const result = await getModel('gpt2');
    expect(result).toEqual(mockModel);
  });
});

describe('Get Model README', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should get model README', async () => {
    const readme = '# GPT-2 Model';

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => readme,
    });

    const result = await getModelReadme('gpt2');
    expect(result).toBe(readme);
  });

  it('should return empty string for missing README', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await getModelReadme('model-without-readme');
    expect(result).toBe('');
  });
});

describe('parseAPIError', () => {
  it('should parse network errors', () => {
    const error = new TypeError('fetch failed');
    const result = parseAPIError(error);

    expect(result.isNetworkError).toBe(true);
    expect(result.status).toBe(0);
  });

  it('should parse rate limit errors', () => {
    const result = parseAPIError(null, 429);

    expect(result.isRateLimit).toBe(true);
    expect(result.status).toBe(429);
    expect(result.retryAfter).toBe(60);
  });

  it('should parse unauthorized errors', () => {
    const result = parseAPIError(null, 401);

    expect(result.isUnauthorized).toBe(true);
    expect(result.status).toBe(401);
  });

  it('should parse forbidden errors', () => {
    const result = parseAPIError(null, 403);

    expect(result.isUnauthorized).toBe(true);
    expect(result.status).toBe(403);
  });

  it('should parse not found errors', () => {
    const result = parseAPIError(null, 404);

    expect(result.status).toBe(404);
    expect(result.message).toContain('not found');
  });
});
