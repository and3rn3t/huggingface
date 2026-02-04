import { act, renderHook } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCopyToClipboard } from './use-copy-to-clipboard';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Mock navigator.clipboard
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should copy text to clipboard', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    act(() => {
      result.current('Test text to copy');
    });

    expect(mockWriteText).toHaveBeenCalledWith('Test text to copy');
  });

  it('should show success toast with default message', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    act(() => {
      result.current('Test text');
    });

    expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!');
  });

  it('should show success toast with custom message', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    act(() => {
      result.current('Test text', 'Custom success message!');
    });

    expect(toast.success).toHaveBeenCalledWith('Custom success message!');
  });

  it('should copy empty string', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    act(() => {
      result.current('');
    });

    expect(mockWriteText).toHaveBeenCalledWith('');
  });

  it('should copy multiline text', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    const multilineText = 'Line 1\nLine 2\nLine 3';

    act(() => {
      result.current(multilineText);
    });

    expect(mockWriteText).toHaveBeenCalledWith(multilineText);
  });

  it('should copy special characters', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    const specialText = 'Special chars: !@#$%^&*(){}[]<>?/\\';

    act(() => {
      result.current(specialText);
    });

    expect(mockWriteText).toHaveBeenCalledWith(specialText);
  });
});
