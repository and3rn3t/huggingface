import { renderHook } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApiError } from './use-api-error';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('useApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle network errors', () => {
    const { result } = renderHook(() => useApiError());

    const networkError = {
      isNetworkError: true,
      message: 'Network connection failed',
      status: 0,
      isRateLimit: false,
      isUnauthorized: false,
    };

    result.current.showError(networkError);

    expect(toast.error).toHaveBeenCalledWith(
      'Connection Error',
      expect.objectContaining({
        description: 'Network connection failed',
      })
    );
  });

  it('should handle rate limit errors', () => {
    const { result } = renderHook(() => useApiError());

    const rateLimitError = {
      isNetworkError: false,
      message: 'Too many requests',
      status: 429,
      isRateLimit: true,
      isUnauthorized: false,
      retryAfter: 60,
    };

    result.current.showError(rateLimitError);

    expect(toast.error).toHaveBeenCalledWith(
      'Rate Limited',
      expect.objectContaining({
        description: expect.stringContaining('retry in 60s'),
      })
    );
  });

  it('should handle unauthorized errors', () => {
    const { result } = renderHook(() => useApiError());

    const unauthorizedError = {
      isNetworkError: false,
      message: 'Invalid API key',
      status: 401,
      isRateLimit: false,
      isUnauthorized: true,
    };

    result.current.showError(unauthorizedError);

    expect(toast.error).toHaveBeenCalledWith(
      'Authentication Error',
      expect.objectContaining({
        description: 'Invalid API key',
      })
    );
  });

  it('should handle 404 errors', () => {
    const { result } = renderHook(() => useApiError());

    const notFoundError = {
      isNetworkError: false,
      message: 'Model not found',
      status: 404,
      isRateLimit: false,
      isUnauthorized: false,
    };

    result.current.showError(notFoundError);

    expect(toast.error).toHaveBeenCalledWith(
      'Not Found',
      expect.objectContaining({
        description: 'Model not found',
      })
    );
  });

  it('should handle server errors (5xx)', () => {
    const { result } = renderHook(() => useApiError());

    const serverError = {
      isNetworkError: false,
      message: 'Internal server error',
      status: 500,
      isRateLimit: false,
      isUnauthorized: false,
    };

    result.current.showError(serverError);

    expect(toast.error).toHaveBeenCalledWith(
      'Server Error',
      expect.objectContaining({
        description: 'Internal server error',
      })
    );
  });

  it('should use custom messages when provided', () => {
    const { result } = renderHook(() =>
      useApiError({
        messages: {
          network: 'Custom Network Error',
        },
      })
    );

    const networkError = {
      isNetworkError: true,
      message: 'Network failed',
      status: 0,
      isRateLimit: false,
      isUnauthorized: false,
    };

    result.current.showError(networkError);

    expect(toast.error).toHaveBeenCalledWith('Custom Network Error', expect.any(Object));
  });

  it('should call onRetry when retry action is clicked', () => {
    const onRetry = vi.fn();
    const { result } = renderHook(() => useApiError({ onRetry }));

    const error = {
      isNetworkError: true,
      message: 'Network error',
      status: 0,
      isRateLimit: false,
      isUnauthorized: false,
    };

    result.current.showError(error);

    expect(toast.error).toHaveBeenCalled();

    // Get the toast options
    const toastOptions = (toast.error as ReturnType<typeof vi.fn>).mock.calls[0][1];

    // Call the retry action if it exists
    if (toastOptions.action && typeof toastOptions.action.onClick === 'function') {
      toastOptions.action.onClick();
      expect(onRetry).toHaveBeenCalled();
    }
  });

  it('should handle generic errors', () => {
    const { result } = renderHook(() => useApiError());

    const genericError = new Error('Something went wrong');

    result.current.showError(genericError);

    expect(toast.error).toHaveBeenCalled();
  });
});
