import { FeaturedModal } from '@/components/FeaturedModal';
import {
  CodeExamples,
  ExecutionHistory,
  HistoryItem,
  ParameterControls,
  PlaygroundStats,
  PlaygroundTask,
  SavedPrompts,
  TaskCard,
} from '@/components/playground';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAchievements } from '@/hooks/use-achievements';
import { useApiError } from '@/hooks/use-api-error';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  answerQuestion,
  classifyText,
  generateText,
  hasToken,
  HFModel,
  runInference,
  summarizeText,
  translateText,
} from '@/services/huggingface';
import {
  ArrowsClockwise,
  Brain,
  ChartBar,
  ChatCircleDots,
  CheckCircle,
  Clock,
  CloudArrowDown,
  Code,
  Copy,
  Cpu,
  Download,
  FileText,
  Image as ImageIcon,
  Lightning,
  MagicWand,
  Microphone,
  Play,
  Share,
  Star,
  Trash,
} from '@phosphor-icons/react';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const PLAYGROUND_TASKS: PlaygroundTask[] = [
  {
    id: 'text-generation',
    name: 'Text Generation',
    category: 'text',
    description: 'Generate creative text continuations using advanced language models',
    placeholder: 'Enter your prompt text...',
    exampleInput: 'Once upon a time in a land far away,',
    icon: <FileText size={20} />,
    badge: 'Popular',
    models: ['gpt2', 'gpt2-large', 'EleutherAI/gpt-neo-2.7B', 'bigscience/bloom-560m'],
    parameters: { temperature: true, maxTokens: true, topP: true },
  },
  {
    id: 'summarization',
    name: 'Summarization',
    category: 'text',
    description: 'Create concise, intelligent summaries of longer texts',
    placeholder: 'Paste text to summarize...',
    exampleInput:
      'The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side.',
    icon: <FileText size={20} />,
    models: ['facebook/bart-large-cnn', 't5-base', 'google/pegasus-xsum'],
    parameters: { maxTokens: true },
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    category: 'text',
    description: 'Classify emotional tone as positive, negative, or neutral',
    placeholder: 'Enter text to analyze...',
    exampleInput: 'I absolutely loved this product! Best purchase ever.',
    icon: <ChartBar size={20} />,
    badge: 'Fast',
    models: [
      'distilbert-base-uncased-finetuned-sst-2-english',
      'cardiffnlp/twitter-roberta-base-sentiment',
    ],
  },
  {
    id: 'question-answering',
    name: 'Question Answering',
    category: 'text',
    description: 'Extract precise answers from context using comprehension models',
    placeholder: 'Enter context and question...',
    exampleInput:
      'Context: Paris is the capital of France.\nQuestion: What is the capital of France?',
    icon: <ChatCircleDots size={20} />,
    models: ['deepset/roberta-base-squad2', 'distilbert-base-cased-distilled-squad'],
  },
  {
    id: 'translation',
    name: 'Translation',
    category: 'text',
    description: 'Translate text between multiple languages',
    placeholder: 'Enter text to translate...',
    exampleInput: 'Hello, how are you today?',
    icon: <ArrowsClockwise size={20} />,
    models: ['Helsinki-NLP/opus-mt-en-fr', 't5-base', 'facebook/mbart-large-50-many-to-many-mmt'],
  },
  {
    id: 'image-classification',
    name: 'Image Classification',
    category: 'vision',
    description: 'Classify images into categories using vision models',
    placeholder: 'Image URL or upload...',
    exampleInput: 'https://example.com/image.jpg',
    icon: <ImageIcon size={20} />,
    badge: 'New',
    models: ['google/vit-base-patch16-224', 'microsoft/resnet-50'],
  },
  {
    id: 'conversational',
    name: 'Conversational AI',
    category: 'multimodal',
    description: 'Engage in natural dialogue with context-aware chatbots',
    placeholder: 'Start a conversation...',
    exampleInput: 'Hello! Can you help me with a coding question?',
    icon: <Brain size={20} />,
    badge: 'Advanced',
    models: ['microsoft/DialoGPT-medium', 'facebook/blenderbot-400M-distill'],
    parameters: { temperature: true, topP: true },
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    category: 'text',
    description: 'Generate code from natural language descriptions',
    placeholder: 'Describe the code you want...',
    exampleInput: 'Create a function that sorts an array of numbers in ascending order',
    icon: <Code size={20} />,
    badge: 'Popular',
    models: ['Salesforce/codegen-350M-mono', 'microsoft/CodeGPT-small-py'],
    parameters: { temperature: true, maxTokens: true },
  },
];

export function ApiPlayground() {
  const [selectedTask, setSelectedTask] = useState<PlaygroundTask>(PLAYGROUND_TASKS[0]);
  const [selectedModel, setSelectedModel] = useState(PLAYGROUND_TASKS[0].models[0]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'text' | 'vision' | 'audio' | 'multimodal'>(
    'text'
  );

  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([100]);
  const [topP, setTopP] = useState([0.9]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [history = [], setHistory] = useLocalStorage<HistoryItem[]>('playground-history', []);
  const [savedPrompts = [], setSavedPrompts] = useLocalStorage<
    { id: string; name: string; taskId: string; prompt: string }[]
  >('saved-prompts', []);
  const [featuredModalOpen, setFeaturedModalOpen] = useState(false);

  const { trackPlaygroundRun } = useAchievements();
  const { showError } = useApiError();

  const handleTaskChange = (taskId: string) => {
    const task = PLAYGROUND_TASKS.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setSelectedModel(task.models[0]);
      setInput('');
      setOutput('');
      setProgress(0);
    }
  };

  const loadExample = () => {
    setInput(selectedTask.exampleInput);
    setOutput('');
    toast.info('Example loaded');
  };

  const savePrompt = () => {
    if (!input.trim()) {
      toast.error('No prompt to save');
      return;
    }

    const promptName = prompt('Enter a name for this prompt:');
    if (!promptName) return;

    setSavedPrompts((current) => [
      ...(current || []),
      {
        id: Date.now().toString(),
        name: promptName,
        taskId: selectedTask.id,
        prompt: input,
      },
    ]);
    toast.success('Prompt saved!');
  };

  const loadSavedPrompt = (promptId: string) => {
    const saved = savedPrompts.find((p) => p.id === promptId);
    if (saved) {
      const task = PLAYGROUND_TASKS.find((t) => t.id === saved.taskId);
      if (task) {
        setSelectedTask(task);
        setSelectedModel(task.models[0]);
      }
      setInput(saved.prompt);
      toast.success('Prompt loaded');
    }
  };

  const deleteSavedPrompt = (promptId: string) => {
    setSavedPrompts((current) => (current || []).filter((p) => p.id !== promptId));
    toast.success('Prompt deleted');
  };

  const executeTask = async () => {
    if (!input.trim()) {
      toast.error('Please enter some input text');
      return;
    }

    if (!hasToken()) {
      toast.error('API token required', {
        description: 'Please configure your HuggingFace API token in settings.',
        action: {
          label: 'Settings',
          onClick: () => window.dispatchEvent(new CustomEvent('open-token-settings')),
        },
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setOutput('');
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      let result: unknown;

      switch (selectedTask.id) {
        case 'text-generation':
        case 'code-generation': {
          const response = await generateText(selectedModel, input, {
            max_new_tokens: maxTokens[0],
            temperature: temperature[0],
            top_p: topP[0],
          });
          result = response[0]?.generated_text || JSON.stringify(response, null, 2);
          break;
        }
        case 'summarization': {
          const response = await summarizeText(selectedModel, input, {
            max_length: maxTokens[0],
          });
          result = response[0]?.summary_text || JSON.stringify(response, null, 2);
          break;
        }
        case 'sentiment-analysis': {
          const response = await classifyText(selectedModel, input);
          result = JSON.stringify(response, null, 2);
          break;
        }
        case 'question-answering': {
          // Parse input to extract context and question
          const parts = input.split('\nQuestion:');
          const context = parts[0].replace(/^Context:\s*/i, '').trim();
          const question = parts[1]?.trim() || input;
          const response = await answerQuestion(selectedModel, question, context);
          result = JSON.stringify(response, null, 2);
          break;
        }
        case 'translation': {
          const response = await translateText(selectedModel, input);
          result = response[0]?.translation_text || JSON.stringify(response, null, 2);
          break;
        }
        case 'image-classification': {
          const response = await runInference(selectedModel, {
            inputs: input,
            options: { wait_for_model: true },
          });
          result = JSON.stringify(response, null, 2);
          break;
        }
        case 'conversational': {
          const response = await runInference(selectedModel, {
            inputs: {
              text: input,
              past_user_inputs: [],
              generated_responses: [],
            },
            options: { wait_for_model: true },
          });
          result =
            typeof response === 'object' && response !== null && 'generated_text' in response
              ? (response as { generated_text: string }).generated_text
              : JSON.stringify(response, null, 2);
          break;
        }
        default:
          result = 'Task not supported';
      }

      clearInterval(progressInterval);
      setProgress(100);

      const execTime = Date.now() - startTime;
      setExecutionTime(execTime);

      const outputString = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      setOutput(outputString);
      setIsLoading(false);

      setHistory((current) => [
        {
          id: Date.now().toString(),
          taskId: selectedTask.id,
          taskName: selectedTask.name,
          input: input.slice(0, 100),
          output: outputString.slice(0, 100),
          timestamp: Date.now(),
          executionTime: execTime,
          model: selectedModel,
        },
        ...(current || []).slice(0, 9),
      ]);

      trackPlaygroundRun();

      toast.success('API call completed!', {
        description: `Executed in ${execTime}ms`,
      });
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      setIsLoading(false);
      showError(error);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast.success('Output copied to clipboard!');
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTask.id}-output-${Date.now()}.txt`;
    a.click();
    toast.success('Output downloaded!');
  };

  const sharePlayground = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('task', selectedTask.id);
      url.searchParams.set('model', selectedModel);
      url.searchParams.set('prompt', encodeURIComponent(input));

      if (selectedTask.parameters?.temperature) {
        url.searchParams.set('temp', temperature[0].toString());
      }
      if (selectedTask.parameters?.maxTokens) {
        url.searchParams.set('tokens', maxTokens[0].toString());
      }
      if (selectedTask.parameters?.topP) {
        url.searchParams.set('topP', topP[0].toString());
      }

      if (output) {
        const MAX_RESULT_LENGTH = 2000;
        const truncatedOutput = output.slice(0, MAX_RESULT_LENGTH);
        url.searchParams.set('result', encodeURIComponent(truncatedOutput));
        url.searchParams.set('time', executionTime.toString());

        if (output.length > MAX_RESULT_LENGTH) {
          toast.warning('Result truncated in share URL', {
            description: `Only first ${MAX_RESULT_LENGTH} characters included due to URL length limits`,
          });
        }
      }

      navigator.clipboard.writeText(url.toString());
      toast.success('Share link copied to clipboard!', {
        description: 'Anyone can use this link to load your playground state',
      });
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

  const handleFeaturedModelSelect = (model: HFModel) => {
    const modelId = model.id || model.modelId;
    const pipelineTag = model.pipeline_tag || 'text-generation';

    // Find matching task for this model's pipeline tag
    const matchingTask = PLAYGROUND_TASKS.find((t) => t.id === pipelineTag);

    if (matchingTask) {
      setSelectedTask(matchingTask);
      // Use the model ID from the featured model, or fallback to task's first model
      setSelectedModel(matchingTask.models.includes(modelId) ? modelId : matchingTask.models[0]);
      setInput(matchingTask.exampleInput || '');
      toast.success(`Loaded ${modelId}`, {
        description: `Ready to experiment with ${matchingTask.name}`,
      });
    } else {
      // Fallback to text-generation if no matching task
      setSelectedTask(PLAYGROUND_TASKS[0]);
      setSelectedModel(PLAYGROUND_TASKS[0].models[0]);
      toast.info('Model loaded', {
        description: 'This model may work best with a different task type',
      });
    }
  };

  // Restore state from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const taskParam = params.get('task');
    const modelParam = params.get('model');
    const promptParam = params.get('prompt');
    const resultParam = params.get('result');
    const timeParam = params.get('time');
    const tempParam = params.get('temp');
    const tokensParam = params.get('tokens');
    const topPParam = params.get('topP');

    if (taskParam) {
      // Sanitize and validate task ID
      const sanitizedTaskId = DOMPurify.sanitize(taskParam, { ALLOWED_TAGS: [] });
      const validTaskIds = PLAYGROUND_TASKS.map((t) => t.id);

      if (validTaskIds.includes(sanitizedTaskId)) {
        const task = PLAYGROUND_TASKS.find((t) => t.id === sanitizedTaskId);
        if (task) {
          setSelectedTask(task);

          // Restore model if valid for this task
          if (modelParam) {
            const sanitizedModel = DOMPurify.sanitize(modelParam, { ALLOWED_TAGS: [] });
            if (task.models.includes(sanitizedModel)) {
              setSelectedModel(sanitizedModel);
            } else {
              setSelectedModel(task.models[0]);
            }
          }

          // Restore prompt
          if (promptParam) {
            try {
              const decodedPrompt = decodeURIComponent(promptParam);
              const sanitizedPrompt = DOMPurify.sanitize(decodedPrompt, { ALLOWED_TAGS: [] });
              setInput(sanitizedPrompt);
            } catch (e) {
              console.error('Failed to decode prompt:', e);
            }
          }

          // Restore result and execution time
          if (resultParam) {
            try {
              const decodedResult = decodeURIComponent(resultParam);
              const sanitizedResult = DOMPurify.sanitize(decodedResult, { ALLOWED_TAGS: [] });
              setOutput(sanitizedResult);
              setProgress(100);

              if (timeParam) {
                const time = parseInt(timeParam, 10);
                if (!isNaN(time) && time >= 0) {
                  setExecutionTime(time);
                }
              }
            } catch (e) {
              console.error('Failed to decode result:', e);
            }
          }

          // Restore parameters
          if (tempParam) {
            const temp = parseFloat(tempParam);
            if (!isNaN(temp) && temp >= 0 && temp <= 2) {
              setTemperature([temp]);
            }
          }
          if (tokensParam) {
            const tokens = parseInt(tokensParam, 10);
            if (!isNaN(tokens) && tokens > 0 && tokens <= 2000) {
              setMaxTokens([tokens]);
            }
          }
          if (topPParam) {
            const topP = parseFloat(topPParam);
            if (!isNaN(topP) && topP >= 0 && topP <= 1) {
              setTopP([topP]);
            }
          }

          // Clear URL params after loading
          window.history.replaceState({}, '', window.location.pathname);

          toast.info('Playground state loaded from share link');
        }
      }
    }
  }, []); // Only run on mount

  const filteredTasks = PLAYGROUND_TASKS.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="from-accent via-primary to-accent mb-2 bg-linear-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              AI Playground
            </h2>
            <p className="text-muted-foreground text-lg">
              Experiment with cutting-edge AI models in real-time
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={sharePlayground}>
              <Share />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setFeaturedModalOpen(true)}
            >
              <Star />
              Featured
            </Button>
          </div>
        </div>

        <div className="bg-accent/20 pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-primary/20 pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl" />
      </motion.div>

      <Card className="border-accent/50 from-accent/5 to-primary/5 relative overflow-hidden bg-linear-to-br via-transparent p-6">
        <div className="from-accent/10 to-primary/10 absolute inset-0 bg-linear-to-r opacity-50" />
        <div className="relative flex items-start gap-3">
          <div className="bg-accent/20 rounded-lg p-2">
            <Lightning className="text-accent" size={24} weight="fill" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-semibold">Interactive Learning Environment</h3>
            <p className="text-muted-foreground text-sm">
              This playground simulates real HuggingFace API responses. Experiment with different
              models, adjust parameters, and see instant results. Perfect for learning and
              prototyping before production deployment.
            </p>
          </div>
        </div>
      </Card>

      <Tabs
        value={activeCategory}
        onValueChange={(v) => setActiveCategory(v as 'text' | 'vision' | 'audio' | 'multimodal')}
        className="space-y-6"
      >
        <TabsList className="bg-muted/50 grid w-full grid-cols-4 p-1">
          <TabsTrigger value="text" className="gap-2">
            <FileText size={16} />
            Text
          </TabsTrigger>
          <TabsTrigger value="vision" className="gap-2">
            <ImageIcon size={16} />
            Vision
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-2">
            <Microphone size={16} />
            Audio
          </TabsTrigger>
          <TabsTrigger value="multimodal" className="gap-2">
            <Brain size={16} />
            Multimodal
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={selectedTask.id === task.id}
                onClick={() => handleTaskChange(task.id)}
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-3">
              <Card className="border-primary/30 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold">
                        {selectedTask.icon}
                        {selectedTask.name}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {selectedTask.description}
                      </p>
                    </div>
                    {selectedTask.badge && (
                      <Badge className="bg-accent text-accent-foreground">
                        {selectedTask.badge}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Model Selection</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="bg-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedTask.models.map((model) => (
                          <SelectItem key={model} value={model}>
                            <div className="flex items-center gap-2">
                              <Cpu size={14} />
                              {model}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTask.parameters && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Advanced Parameters</Label>
                        <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                      </div>
                      <ParameterControls
                        showAdvanced={showAdvanced}
                        parameters={selectedTask.parameters}
                        temperature={temperature}
                        maxTokens={maxTokens}
                        topP={topP}
                        onTemperatureChange={setTemperature}
                        onMaxTokensChange={setMaxTokens}
                        onTopPChange={setTopP}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Input</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={loadExample}
                          className="gap-1 text-xs"
                        >
                          <MagicWand size={14} />
                          Example
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={savePrompt}
                          className="gap-1 text-xs"
                          disabled={!input.trim()}
                        >
                          <Star size={14} />
                          Save
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      id="playground-input"
                      placeholder={selectedTask.placeholder}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="bg-muted min-h-[200px] resize-none font-mono text-sm"
                    />
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>{input.length} characters</span>
                      <span>{input.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={executeTask}
                      disabled={isLoading || !input.trim()}
                      className="from-primary to-accent flex-1 bg-linear-to-r transition-opacity hover:opacity-90"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <CloudArrowDown className="animate-bounce" size={20} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play size={20} weight="fill" />
                          Execute
                        </>
                      )}
                    </Button>
                    {output && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setInput('');
                          setOutput('');
                          setProgress(0);
                        }}
                      >
                        <Trash size={20} />
                      </Button>
                    )}
                  </div>

                  {isLoading && (
                    <div className="space-y-2">
                      <Progress value={progress} className="h-2" />
                      <div className="text-muted-foreground flex items-center justify-between text-xs">
                        <span>Processing request...</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                    </div>
                  )}

                  {output && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <CheckCircle className="text-accent" size={16} weight="fill" />
                          Output
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Clock size={14} />
                            {executionTime}ms
                          </div>
                          <Button size="sm" variant="ghost" onClick={copyOutput}>
                            <Copy size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={downloadOutput}>
                            <Download size={14} />
                          </Button>
                        </div>
                      </div>
                      <Card className="bg-muted border-accent/30 p-4">
                        <pre className="text-foreground max-h-[300px] overflow-y-auto font-mono text-sm whitespace-pre-wrap">
                          {output}
                        </pre>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <CodeExamples
                selectedModel={selectedModel}
                input={input}
                temperature={temperature[0]}
                maxTokens={maxTokens[0]}
              />

              <SavedPrompts
                prompts={savedPrompts}
                onLoad={loadSavedPrompt}
                onDelete={deleteSavedPrompt}
              />

              <ExecutionHistory
                history={history}
                onSelect={(item) => {
                  const task = PLAYGROUND_TASKS.find((t) => t.id === item.taskId);
                  if (task) {
                    setSelectedTask(task);
                    setSelectedModel(item.model);
                    setInput(item.input);
                    setOutput(item.output);
                  }
                }}
              />

              <PlaygroundStats totalRuns={history.length} savedPrompts={savedPrompts.length} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <FeaturedModal
        open={featuredModalOpen}
        onOpenChange={setFeaturedModalOpen}
        onSelectModel={handleFeaturedModelSelect}
      />
    </div>
  );
}
