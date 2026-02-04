import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook for copying text to clipboard with toast notification
 * @returns Function to copy text to clipboard
 */
export function useCopyToClipboard() {
  return useCallback((text: string, successMessage = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(successMessage);
  }, []);
}
