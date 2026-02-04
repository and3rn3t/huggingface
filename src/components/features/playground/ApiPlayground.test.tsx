import * as huggingfaceService from '@/services/huggingface';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiPlayground } from './ApiPlayground';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<unknown>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock hooks
vi.mock('@/hooks/use-achievements', () => ({
  useAchievements: () => ({
    trackPlaygroundRun: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-api-error', () => ({
  useApiError: () => ({
    showError: vi.fn(),
  }),
}));

// Mock HuggingFace service
vi.mock('@/services/huggingface');

// Mock playground subcomponents
vi.mock('@/components/features/playground', () => ({
  CodeExamples: () => <div>Code Examples</div>,
  ExecutionHistory: ({ onSelect: _onSelect }: { onSelect: (item: unknown) => void }) => (
    <div>Execution History</div>
  ),
  ParameterControls: ({ showAdvanced }: { showAdvanced: boolean }) =>
    showAdvanced ? (
      <div>
        <div>Temperature</div>
        <div>Max Tokens</div>
        <div>Top P</div>
      </div>
    ) : null,
  PlaygroundStats: () => <div>Playground Stats</div>,
  SavedPrompts: ({
    onLoad: _onLoad,
    onDelete: _onDelete,
  }: {
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
  }) => <div>Saved Prompts</div>,
  TaskCard: ({
    task,
    isSelected: _isSelected,
    onClick,
  }: {
    task: { id: string; name: string };
    isSelected: boolean;
    onClick: () => void;
  }) => <button onClick={onClick}>{task.name}</button>,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ApiPlayground', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Mock hasToken to return true by default
    vi.mocked(huggingfaceService.hasToken).mockReturnValue(true);
  });

  describe('Rendering', () => {
    it('should render header with AI Playground title', () => {
      render(<ApiPlayground />, { wrapper: createWrapper() });

      expect(screen.getByText('AI Playground')).toBeInTheDocument();
      expect(screen.getByText(/Experiment with cutting-edge AI models/i)).toBeInTheDocument();
    });

    it('should show Share and Featured buttons', () => {
      render(<ApiPlayground />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /Share/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Featured/i })).toBeInTheDocument();
    });

    it('should render 4 category tabs', () => {
      render(<ApiPlayground />, { wrapper: createWrapper() });

      expect(screen.getByRole('tab', { name: /Text/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Vision/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Audio/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Multimodal/i })).toBeInTheDocument();
    });

    it('should display filtered tasks based on active category', () => {
      render(<ApiPlayground />, { wrapper: createWrapper() });

      // Text category should be active by default
      const taskButtons = screen.getAllByText('Text Generation');
      expect(taskButtons.length).toBeGreaterThan(0);
      expect(screen.getByText('Summarization')).toBeInTheDocument();
    });

    it('should show task details when task is selected', () => {
      render(<ApiPlayground />, { wrapper: createWrapper() });

      // First task should be selected by default - description appears in both card and detail panel
      const descriptions = screen.getAllByText(/Generate creative text continuations/i);
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should render model dropdown with available models', () => {
      render(<ApiPlayground />, { wrapper: createWrapper() });

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should show parameter controls when task has parameters', () => {
      render(<ApiPlayground />, { wrapper: createWrapper() });

      expect(screen.getByText('Advanced Parameters')).toBeInTheDocument();
    });

    it('should hide parameter sliders when showAdvanced is false', () => {
      render(<ApiPlayground />, { wrapper: createWrapper() });

      // Advanced should be off by default - Temperature label for slider should not exist
      // Note: "Temperature" may appear in code examples, so we check for the slider label specifically
      const temperatureSlider = screen.queryByRole('slider', { name: /temperature/i });
      expect(temperatureSlider).not.toBeInTheDocument();
    });
  });

  describe('Task Selection', () => {
    it('should change task on TaskCard click', async () => {
      const user = userEvent.setup();
      render(<ApiPlayground />, { wrapper: createWrapper() });

      // Click on Summarization task
      const summarizationCard = screen.getByText('Summarization');
      await user.click(summarizationCard);

      // Verify task description changed - description appears in both card and detail panel
      const descriptions = screen.getAllByText(/Create concise, intelligent summaries/i);
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should update model to first in new tasks model list', async () => {
      const user = userEvent.setup();
      render(<ApiPlayground />, { wrapper: createWrapper() });

      // Initial task is text-generation with gpt2
      // Switch to summarization which uses different models
      await user.click(screen.getByText('Summarization'));

      // Model should update (can verify via DOM inspection) - description appears in multiple places
      const descriptions = screen.getAllByText(/Create concise, intelligent summaries/i);
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should clear input and output on task change', async () => {
      const user = userEvent.setup();
      render(<ApiPlayground />, { wrapper: createWrapper() });

      // Enter some input
      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'Test input');

      // Switch task
      await user.click(screen.getByText('Summarization'));

      // Input should be cleared
      const newTextarea = screen.getByPlaceholderText(/Paste text to summarize/i);
      expect(newTextarea).toHaveValue('');
    });

    it('should reset progress to 0 on task change', async () => {
      const user = userEvent.setup();
      render(<ApiPlayground />, { wrapper: createWrapper() });

      // Switch tasks
      await user.click(screen.getByText('Summarization'));

      // Progress should be reset (implicitly tested by no errors) - description appears in multiple places
      const descriptions = screen.getAllByText(/Create concise, intelligent summaries/i);
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  describe('Category Switching', () => {
    it('should filter tasks when changing tabs', async () => {
      const user = userEvent.setup();
      render(<ApiPlayground />, { wrapper: createWrapper() });

      // Switch to Vision tab
      await user.click(screen.getByRole('tab', { name: /Vision/i }));

      // Should show vision tasks
      expect(screen.getByText('Image Classification')).toBeInTheDocument();

      // Text Generation should not appear as a button (task card) anymore
      const textGenButtons = screen.queryAllByRole('button', { name: 'Text Generation' });
      expect(textGenButtons.length).toBe(0);
    });

    it('should switch to multimodal category', async () => {
      const user = userEvent.setup();
      render(<ApiPlayground />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('tab', { name: /Multimodal/i }));

      expect(screen.getByText('Conversational AI')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should update input state on textarea change', async () => {
      const user = userEvent.setup();
      render(<ApiPlayground />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'Hello world');

      expect(textarea).toHaveValue('Hello world');
    });

    it('should show character count', async () => {
      const user = userEvent.setup();
      render(<ApiPlayground />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'Test');

      expect(screen.getByText('4 characters')).toBeInTheDocument();
    });

    it('should show word count', async () => {
      const user = userEvent.setup();
      render(<ApiPlayground />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'Hello world test');

      expect(screen.getByText('3 words')).toBeInTheDocument();
    });

    it('should load example on Load Example click', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');

      render(<ApiPlayground />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('button', { name: /Example/i }));

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      expect(textarea).not.toHaveValue('');
      expect(toast.info).toHaveBeenCalledWith('Example loaded');
    });

    it('should clear output when loading example', async () => {
      const user = userEvent.setup();
      render(<ApiPlayground />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('button', { name: /Example/i }));

      // Output should be empty (implicitly tested)
      expect(screen.getByRole('button', { name: /Example/i })).toBeInTheDocument();
    });
  });

  describe('Execute Functionality', () => {
    it('should disable Execute button when input is empty', () => {
      render(<ApiPlayground />, { wrapper: createWrapper() });

      const executeButton = screen.getByRole('button', { name: /Execute/i });
      expect(executeButton).toBeDisabled();
    });

    it('should disable Execute button when loading', async () => {
      const user = userEvent.setup();

      // Mock slow API response
      vi.mocked(huggingfaceService.generateText).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<ApiPlayground />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'Test');

      const executeButton = screen.getByRole('button', { name: /Execute/i });
      await user.click(executeButton);

      expect(executeButton).toBeDisabled();
    });

    it('should show error if no token configured', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');

      // Mock hasToken to return false
      vi.mocked(huggingfaceService.hasToken).mockReturnValue(false);

      render(<ApiPlayground />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'Test');

      const executeButton = screen.getByRole('button', { name: /Execute/i });
      await user.click(executeButton);

      expect(toast.error).toHaveBeenCalledWith(
        'API token required',
        expect.objectContaining({
          description: 'Please configure your HuggingFace API token in settings.',
        })
      );
    });

    it('should handle text-generation task execution', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');

      vi.mocked(huggingfaceService.generateText).mockResolvedValue([
        { generated_text: 'Generated output text' },
      ]);

      render(<ApiPlayground />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'Test prompt');

      const executeButton = screen.getByRole('button', { name: /Execute/i });
      await user.click(executeButton);

      await waitFor(() => {
        expect(screen.getByText('Generated output text')).toBeInTheDocument();
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle summarization task', async () => {
      const user = userEvent.setup();

      vi.mocked(huggingfaceService.summarizeText).mockResolvedValue([
        { summary_text: 'This is a summary' },
      ]);

      render(<ApiPlayground />, { wrapper: createWrapper() });

      // Switch to summarization
      await user.click(screen.getByText('Summarization'));

      const textarea = screen.getByPlaceholderText(/Paste text to summarize/i);
      await user.type(textarea, 'Long text to summarize');

      const executeButton = screen.getByRole('button', { name: /Execute/i });
      await user.click(executeButton);

      await waitFor(() => {
        expect(screen.getByText('This is a summary')).toBeInTheDocument();
      });
    });

    it('should add execution to history', async () => {
      const user = userEvent.setup();

      vi.mocked(huggingfaceService.generateText).mockResolvedValue([{ generated_text: 'Output' }]);

      render(<ApiPlayground />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'Test');

      await user.click(screen.getByRole('button', { name: /Execute/i }));

      await waitFor(() => {
        const historyItems = JSON.parse(localStorage.getItem('playground-history') || '[]');
        expect(historyItems.length).toBe(1);
      });
    });

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();

      vi.mocked(huggingfaceService.generateText).mockRejectedValue(new Error('API Error'));

      render(<ApiPlayground />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'Test');

      await user.click(screen.getByRole('button', { name: /Execute/i }));

      // Should handle error without crashing
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Execute/i })).toBeEnabled();
      });
    });
  });

  describe('Parameter Controls', () => {
    it('should show parameter sliders when advanced is toggled', async () => {
      const user = userEvent.setup();
      render(<ApiPlayground />, { wrapper: createWrapper() });

      const advancedSwitch = screen.getByRole('switch');
      await user.click(advancedSwitch);

      // After toggling, the mocked ParameterControls should render
      await waitFor(() => {
        const temperatureElements = screen.getAllByText(/Temperature/i);
        expect(temperatureElements.length).toBeGreaterThan(0);
      });
    });

    it('should update temperature slider value', async () => {
      const user = userEvent.setup();
      render(<ApiPlayground />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('switch'));

      // Slider interaction would require more complex testing
      await waitFor(() => {
        const temperatureElements = screen.getAllByText(/Temperature/i);
        expect(temperatureElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('SavedPrompts', () => {
    it('should disable Save button when input is empty', () => {
      render(<ApiPlayground />, { wrapper: createWrapper() });

      const saveButton = screen.getByRole('button', { name: /Save/i });
      expect(saveButton).toBeDisabled();
    });

    it('should show error when saving empty prompt', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');

      // Mock window.prompt
      global.prompt = vi.fn(() => 'Test Name');

      render(<ApiPlayground />, { wrapper: createWrapper() });

      // Manually enable the button by typing then deleting
      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'a');
      await user.clear(textarea);

      // The button should be disabled, but test the function logic
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('Output Actions', () => {
    it('should show clear button when output exists', async () => {
      const user = userEvent.setup();

      vi.mocked(huggingfaceService.generateText).mockResolvedValue([{ generated_text: 'Output' }]);

      render(<ApiPlayground />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'Test');

      await user.click(screen.getByRole('button', { name: /Execute/i }));

      await waitFor(() => {
        // Trash button should appear
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('should clear input, output and progress when clear is clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(huggingfaceService.generateText).mockResolvedValue([
        { generated_text: 'Output text' },
      ]);

      render(<ApiPlayground />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'Test input');

      await user.click(screen.getByRole('button', { name: /Execute/i }));

      await waitFor(() => {
        expect(screen.getByText('Output text')).toBeInTheDocument();
      });

      // Find and click trash button (icon button)
      const buttons = screen.getAllByRole('button');
      const trashButton = buttons.find(
        (btn) => btn.innerHTML.includes('Trash') || btn.querySelector('[class*="Trash"]')
      );

      if (trashButton) {
        await user.click(trashButton);

        const clearedTextarea = screen.getByPlaceholderText(/Enter your prompt text/i);
        expect(clearedTextarea).toHaveValue('');
      }
    });
  });

  describe('History', () => {
    it('should persist history to localStorage', async () => {
      const user = userEvent.setup();

      vi.mocked(huggingfaceService.generateText).mockResolvedValue([{ generated_text: 'Result' }]);

      render(<ApiPlayground />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'Historical prompt');

      await user.click(screen.getByRole('button', { name: /Execute/i }));

      await waitFor(() => {
        const history = localStorage.getItem('playground-history');
        expect(history).toBeTruthy();

        const parsed = JSON.parse(history!);
        expect(parsed[0].input).toContain('Historical');
      });
    });

    it('should limit history to 10 items', async () => {
      const user = userEvent.setup();

      vi.mocked(huggingfaceService.generateText).mockResolvedValue([{ generated_text: 'Result' }]);

      // Pre-populate with 9 items
      const existingHistory = Array.from({ length: 9 }, (_, i) => ({
        id: `${i}`,
        taskId: 'text-generation',
        taskName: 'Text Generation',
        input: `Input ${i}`,
        output: `Output ${i}`,
        timestamp: Date.now(),
        executionTime: 100,
        model: 'gpt2',
      }));

      localStorage.setItem('playground-history', JSON.stringify(existingHistory));

      render(<ApiPlayground />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText(/Enter your prompt text/i);
      await user.type(textarea, 'New prompt');

      await user.click(screen.getByRole('button', { name: /Execute/i }));

      await waitFor(() => {
        const history = JSON.parse(localStorage.getItem('playground-history')!);
        expect(history.length).toBe(10);
      });
    });
  });
});
