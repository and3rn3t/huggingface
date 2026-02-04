import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrendingSection } from './TrendingSection';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<unknown>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock the navigation hook
const mockNavigate = vi.fn();
vi.mock('@/hooks/use-navigation-history', () => ({
  useNavigationHistory: () => ({
    navigate: mockNavigate,
    canGoBack: false,
    canGoForward: false,
  }),
}));

// Mock HuggingFace service
vi.mock('@/services/huggingface', () => ({
  searchModels: vi.fn(() =>
    Promise.resolve([
      {
        id: 'gpt2',
        modelId: 'gpt2',
        downloads: 1000000,
        likes: 500,
        pipeline_tag: 'text-generation',
      },
      {
        id: 'bert',
        modelId: 'bert-base-uncased',
        downloads: 800000,
        likes: 400,
        pipeline_tag: 'fill-mask',
      },
    ])
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('TrendingSection', () => {
  it('should render the trending header', async () => {
    render(<TrendingSection />, { wrapper: createWrapper() });

    expect(screen.getByText('Trending Now')).toBeInTheDocument();
    expect(
      screen.getByText(/Most popular models and datasets/i)
    ).toBeInTheDocument();
  });

  it('should render loading state or content', () => {
    const { container } = render(<TrendingSection />, { wrapper: createWrapper() });
    
    // Just verify it renders without crashing
    expect(container).toBeTruthy();
  });
});
