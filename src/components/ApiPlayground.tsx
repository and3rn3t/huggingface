import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Code, Play, Copy, Lightning, Clock, ChartBar,
  Image as ImageIcon, ChatCircleDots, Microphone, FileText,
  ArrowsClockwise, Download, Share, Star, Trash, MagicWand,
  Brain, Cpu, CloudArrowDown, CheckCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { useAchievements } from '@/hooks/use-achievements'
import { motion } from 'framer-motion'
import { 
  generateText, 
  summarizeText, 
  classifyText, 
  answerQuestion, 
  translateText, 
  runInference,
  hasToken 
} from '@/services/huggingface'
import { useApiError } from '@/hooks/use-api-error'
import {
  TaskCard,
  PlaygroundTask,
  ParameterControls,
  CodeExamples,
  SavedPrompts,
  ExecutionHistory,
  HistoryItem,
  PlaygroundStats,
} from '@/components/playground'

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
    parameters: { temperature: true, maxTokens: true, topP: true }
  },
  {
    id: 'summarization',
    name: 'Summarization',
    category: 'text',
    description: 'Create concise, intelligent summaries of longer texts',
    placeholder: 'Paste text to summarize...',
    exampleInput: 'The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side.',
    icon: <FileText size={20} />,
    models: ['facebook/bart-large-cnn', 't5-base', 'google/pegasus-xsum'],
    parameters: { maxTokens: true }
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
    models: ['distilbert-base-uncased-finetuned-sst-2-english', 'cardiffnlp/twitter-roberta-base-sentiment']
  },
  {
    id: 'question-answering',
    name: 'Question Answering',
    category: 'text',
    description: 'Extract precise answers from context using comprehension models',
    placeholder: 'Enter context and question...',
    exampleInput: 'Context: Paris is the capital of France.\nQuestion: What is the capital of France?',
    icon: <ChatCircleDots size={20} />,
    models: ['deepset/roberta-base-squad2', 'distilbert-base-cased-distilled-squad']
  },
  {
    id: 'translation',
    name: 'Translation',
    category: 'text',
    description: 'Translate text between multiple languages',
    placeholder: 'Enter text to translate...',
    exampleInput: 'Hello, how are you today?',
    icon: <ArrowsClockwise size={20} />,
    models: ['Helsinki-NLP/opus-mt-en-fr', 't5-base', 'facebook/mbart-large-50-many-to-many-mmt']
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
    models: ['google/vit-base-patch16-224', 'microsoft/resnet-50']
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
    parameters: { temperature: true, topP: true }
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
    parameters: { temperature: true, maxTokens: true }
  }
]

export function ApiPlayground() {
  const [selectedTask, setSelectedTask] = useState<PlaygroundTask>(PLAYGROUND_TASKS[0])
  const [selectedModel, setSelectedModel] = useState(PLAYGROUND_TASKS[0].models[0])
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [executionTime, setExecutionTime] = useState(0)
  const [progress, setProgress] = useState(0)
  const [activeCategory, setActiveCategory] = useState<'text' | 'vision' | 'audio' | 'multimodal'>('text')
  
  const [temperature, setTemperature] = useState([0.7])
  const [maxTokens, setMaxTokens] = useState([100])
  const [topP, setTopP] = useState([0.9])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [history = [], setHistory] = useKV<HistoryItem[]>('playground-history', [])
  const [savedPrompts = [], setSavedPrompts] = useKV<{ id: string; name: string; taskId: string; prompt: string }[]>('saved-prompts', [])
  
  const { trackPlaygroundRun } = useAchievements()
  const { showError } = useApiError()

  const handleTaskChange = (taskId: string) => {
    const task = PLAYGROUND_TASKS.find(t => t.id === taskId)
    if (task) {
      setSelectedTask(task)
      setSelectedModel(task.models[0])
      setInput('')
      setOutput('')
      setProgress(0)
    }
  }

  const loadExample = () => {
    setInput(selectedTask.exampleInput)
    setOutput('')
    toast.info('Example loaded')
  }

  const savePrompt = () => {
    if (!input.trim()) {
      toast.error('No prompt to save')
      return
    }
    
    const promptName = prompt('Enter a name for this prompt:')
    if (!promptName) return

    setSavedPrompts((current = []) => [
      ...current,
      {
        id: Date.now().toString(),
        name: promptName,
        taskId: selectedTask.id,
        prompt: input
      }
    ])
    toast.success('Prompt saved!')
  }

  const loadSavedPrompt = (promptId: string) => {
    const saved = savedPrompts.find(p => p.id === promptId)
    if (saved) {
      const task = PLAYGROUND_TASKS.find(t => t.id === saved.taskId)
      if (task) {
        setSelectedTask(task)
        setSelectedModel(task.models[0])
      }
      setInput(saved.prompt)
      toast.success('Prompt loaded')
    }
  }

  const deleteSavedPrompt = (promptId: string) => {
    setSavedPrompts((current = []) => current.filter(p => p.id !== promptId))
    toast.success('Prompt deleted')
  }

  const executeTask = async () => {
    if (!input.trim()) {
      toast.error('Please enter some input text')
      return
    }

    if (!hasToken()) {
      toast.error('API token required', {
        description: 'Please configure your HuggingFace API token in settings.',
        action: {
          label: 'Settings',
          onClick: () => window.dispatchEvent(new CustomEvent('open-token-settings')),
        },
      })
      return
    }

    setIsLoading(true)
    setProgress(0)
    setOutput('')
    const startTime = Date.now()

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      let result: unknown

      switch (selectedTask.id) {
        case 'text-generation':
        case 'code-generation': {
          const response = await generateText(selectedModel, input, {
            max_new_tokens: maxTokens[0],
            temperature: temperature[0],
            top_p: topP[0],
          })
          result = response[0]?.generated_text || JSON.stringify(response, null, 2)
          break
        }
        case 'summarization': {
          const response = await summarizeText(selectedModel, input, {
            max_length: maxTokens[0],
          })
          result = response[0]?.summary_text || JSON.stringify(response, null, 2)
          break
        }
        case 'sentiment-analysis': {
          const response = await classifyText(selectedModel, input)
          result = JSON.stringify(response, null, 2)
          break
        }
        case 'question-answering': {
          // Parse input to extract context and question
          const parts = input.split('\nQuestion:')
          const context = parts[0].replace(/^Context:\s*/i, '').trim()
          const question = parts[1]?.trim() || input
          const response = await answerQuestion(selectedModel, question, context)
          result = JSON.stringify(response, null, 2)
          break
        }
        case 'translation': {
          const response = await translateText(selectedModel, input)
          result = response[0]?.translation_text || JSON.stringify(response, null, 2)
          break
        }
        case 'image-classification': {
          const response = await runInference(selectedModel, {
            inputs: input,
            options: { wait_for_model: true },
          })
          result = JSON.stringify(response, null, 2)
          break
        }
        case 'conversational': {
          const response = await runInference(selectedModel, {
            inputs: {
              text: input,
              past_user_inputs: [],
              generated_responses: [],
            },
            options: { wait_for_model: true },
          })
          result = typeof response === 'object' && response !== null && 'generated_text' in response
            ? (response as { generated_text: string }).generated_text
            : JSON.stringify(response, null, 2)
          break
        }
        default:
          result = 'Task not supported'
      }

      clearInterval(progressInterval)
      setProgress(100)

      const execTime = Date.now() - startTime
      setExecutionTime(execTime)

      const outputString = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      setOutput(outputString)
      setIsLoading(false)

      setHistory((current = []) => [
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
        ...current.slice(0, 9),
      ])

      trackPlaygroundRun()

      toast.success('API call completed!', {
        description: `Executed in ${execTime}ms`,
      })
    } catch (error) {
      clearInterval(progressInterval)
      setProgress(0)
      setIsLoading(false)
      showError(error)
    }
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
    toast.success('Output copied to clipboard!')
  }

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedTask.id}-output-${Date.now()}.txt`
    a.click()
    toast.success('Output downloaded!')
  }

  const filteredTasks = PLAYGROUND_TASKS.filter(t => t.category === activeCategory)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-4xl font-bold mb-2 tracking-tight bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
              AI Playground
            </h2>
            <p className="text-muted-foreground text-lg">Experiment with cutting-edge AI models in real-time</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Star />
              Featured
            </Button>
          </div>
        </div>

        <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      <Card className="p-6 border-accent/50 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 opacity-50" />
        <div className="relative flex items-start gap-3">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Lightning className="text-accent" size={24} weight="fill" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1 text-lg">Interactive Learning Environment</h3>
            <p className="text-sm text-muted-foreground">
              This playground simulates real HuggingFace API responses. Experiment with different models, adjust parameters, and see instant results. Perfect for learning and prototyping before production deployment.
            </p>
          </div>
        </div>
      </Card>

      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as 'text' | 'vision' | 'audio' | 'multimodal')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={selectedTask.id === task.id}
                onClick={() => handleTaskChange(task.id)}
              />
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <Card className="p-6 border-primary/30">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {selectedTask.icon}
                        {selectedTask.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
                    </div>
                    {selectedTask.badge && (
                      <Badge className="bg-accent text-accent-foreground">{selectedTask.badge}</Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Model Selection</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="bg-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedTask.models.map(model => (
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
                          className="text-xs gap-1"
                        >
                          <MagicWand size={14} />
                          Example
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={savePrompt}
                          className="text-xs gap-1"
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
                      className="min-h-[200px] font-mono text-sm bg-muted resize-none"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{input.length} characters</span>
                      <span>{input.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={executeTask}
                      disabled={isLoading || !input.trim()}
                      className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
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
                          setInput('')
                          setOutput('')
                          setProgress(0)
                        }}
                      >
                        <Trash size={20} />
                      </Button>
                    )}
                  </div>

                  {isLoading && (
                    <div className="space-y-2">
                      <Progress value={progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
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
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="text-accent" size={16} weight="fill" />
                          Output
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
                      <Card className="p-4 bg-muted border-accent/30">
                        <pre className="text-sm text-foreground whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto">
                          {output}
                        </pre>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
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
                  const task = PLAYGROUND_TASKS.find(t => t.id === item.taskId)
                  if (task) {
                    setSelectedTask(task)
                    setSelectedModel(item.model)
                    setInput(item.input)
                    setOutput(item.output)
                  }
                }}
              />

              <PlaygroundStats
                totalRuns={history.length}
                savedPrompts={savedPrompts.length}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
