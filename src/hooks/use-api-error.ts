import { APIError, parseAPIError } from '@/services/huggingface';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface UseApiErrorOptions {
  /** Custom retry function to call when user clicks retry */
  onRetry?: () => void;
  /** Custom message overrides */
  messages?: {
    network?: string;
    rateLimit?: string;
    unauthorized?: string;
    notFound?: string;
    serverError?: string;
    generic?: string;
  };
}

/**
 * Hook for handling API errors with user-friendly toast notifications
 */
export function useApiError(options: UseApiErrorOptions = {}) {
  const { onRetry, messages } = options;

  const showError = useCallback(
    (error: unknown) => {
      // Parse the error if it's not already an APIError
      const apiError: APIError =
        (error as APIError).isRateLimit !== undefined ? (error as APIError) : parseAPIError(error);

      // Determine the message to show
      let message: string;
      let description: string | undefined;

      if (apiError.isNetworkError) {
        message = messages?.network || 'Connection Error';
        description = apiError.message;
      } else if (apiError.isRateLimit) {
        message = messages?.rateLimit || 'Rate Limited';
        description = `${apiError.message}${apiError.retryAfter ? ` (retry in ${apiError.retryAfter}s)` : ''}`;
      } else if (apiError.isUnauthorized) {
        message = messages?.unauthorized || 'Authentication Error';
        description = apiError.message;
      } else if (apiError.status === 404) {
        message = messages?.notFound || 'Not Found';
        description = apiError.message;
      } else if (apiError.status >= 500) {
        message = messages?.serverError || 'Server Error';
        description = apiError.message;
      } else {
        message = messages?.generic || 'Error';
        description = apiError.message;
      }

      // Show toast with optional retry action
      if (onRetry && (apiError.isNetworkError || apiError.isRateLimit || apiError.status >= 500)) {
        toast.error(message, {
          description,
          action: {
            label: 'Retry',
            onClick: onRetry,
          },
          duration: apiError.isRateLimit ? (apiError.retryAfter || 60) * 1000 : 5000,
        });
      } else if (apiError.isUnauthorized) {
        toast.error(message, {
          description,
          action: {
            label: 'Settings',
            onClick: () => {
              // Dispatch a custom event to open settings
              window.dispatchEvent(new CustomEvent('open-token-settings'));
            },
          },
        });
      } else {
        toast.error(message, {
          description,
        });
      }

      return apiError;
    },
    [messages, onRetry]
  );

  const handleAsync = useCallback(
    async <T>(promise: Promise<T>): Promise<T | null> => {
      try {
        return await promise;
      } catch (error) {
        showError(error);
        return null;
      }
    },
    [showError]
  );

  return {
    /** Show an error toast for an API error */
    showError,
    /** Wrap an async operation with error handling */
    handleAsync,
  };
}

/**
 * Standalone function to show API error toasts
 * Use when you don't need the hook pattern
 */
export function showApiError(
  error: unknown,
  options?: {
    onRetry?: () => void;
    onOpenSettings?: () => void;
  }
) {
  const apiError: APIError =
    (error as APIError).isRateLimit !== undefined ? (error as APIError) : parseAPIError(error);

  let message: string;
  let description: string | undefined;

  if (apiError.isNetworkError) {
    message = 'Connection Error';
    description = apiError.message;
  } else if (apiError.isRateLimit) {
    message = 'Rate Limited';
    description = `${apiError.message}${apiError.retryAfter ? ` (retry in ${apiError.retryAfter}s)` : ''}`;
  } else if (apiError.isUnauthorized) {
    message = 'Authentication Error';
    description = apiError.message;
  } else if (apiError.status === 404) {
    message = 'Not Found';
    description = apiError.message;
  } else if (apiError.status >= 500) {
    message = 'Server Error';
    description = apiError.message;
  } else {
    message = 'Error';
    description = apiError.message;
  }

  // Show toast with appropriate action
  if (
    options?.onRetry &&
    (apiError.isNetworkError || apiError.isRateLimit || apiError.status >= 500)
  ) {
    toast.error(message, {
      description,
      action: {
        label: 'Retry',
        onClick: options.onRetry,
      },
      duration: apiError.isRateLimit ? (apiError.retryAfter || 60) * 1000 : 5000,
    });
  } else if (apiError.isUnauthorized && options?.onOpenSettings) {
    toast.error(message, {
      description,
      action: {
        label: 'Settings',
        onClick: options.onOpenSettings,
      },
    });
  } else {
    toast.error(message, {
      description,
    });
  }

  return apiError;
}

/**
 * Helper messages for common scenarios
 */
export const API_ERROR_MESSAGES = {
  MODELS: {
    network: 'Could not load models',
    rateLimit: 'Too many requests',
    unauthorized: 'Sign in required',
    notFound: 'Model not found',
    serverError: 'HuggingFace is having issues',
    generic: 'Could not load models',
  },
  DATASETS: {
    network: 'Could not load datasets',
    rateLimit: 'Too many requests',
    unauthorized: 'Sign in required',
    notFound: 'Dataset not found',
    serverError: 'HuggingFace is having issues',
    generic: 'Could not load datasets',
  },
  INFERENCE: {
    network: 'Could not run inference',
    rateLimit: 'Inference API rate limited',
    unauthorized: 'API token required',
    notFound: 'Model not available',
    serverError: 'Inference API is having issues',
    generic: 'Inference failed',
  },
} as const;
