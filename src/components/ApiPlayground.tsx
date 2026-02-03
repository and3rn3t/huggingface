import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Code, Play, Copy, Sparkle, Lightning, Clock, ChartBar, 
  Image as ImageIcon, ChatCircleDots, Microphone, FileText,
  ArrowsClockwise, Download, Share, Star, Trash, MagicWand,
  Brain, Cpu, CloudArrowDown, CheckCircle, Warning
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'

interface PlaygroundTask {
  id: string
  name: string
  category: 'text' | 'vision' | 'audio' | 'multimodal'
  description: string
  placeholder: string
  exampleInput: string
  icon: React.ReactNode
  badge?: string
  models: string[]
  parameters?: {
    temperature?: boolean
    maxTokens?: boolean
    topP?: boolean
  }
}

interface ExecutionHistory {
  id: string
  taskId: string
  taskName: string
  input: string
  output: string
  timestamp: number
  executionTime: number
  model: string
}

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

  const [history = [], setHistory] = useKV<ExecutionHistory[]>('playground-history', [])
  const [savedPrompts = [], setSavedPrompts] = useKV<{ id: string; name: string; taskId: string; prompt: string }[]>('saved-prompts', [])

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

    setIsLoading(true)
    setProgress(0)
    const startTime = Date.now()

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 200)

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

    clearInterval(progressInterval)
    setProgress(100)

    const mockOutputs: Record<string, string> = {
      'text-generation': input + ' there lived a brave knight who sought adventure and glory. The kingdom was peaceful, but rumors of a dragon stirring in the mountains had reached the castle. As dawn broke over the realm, the knight prepared for the journey ahead, knowing that destiny awaited.',
      'summarization': 'The Eiffel Tower is a 324-meter tall iron structure in Paris, equivalent to an 81-storey building with a 125-meter square base.',
      'sentiment-analysis': '{\n  "label": "POSITIVE",\n  "score": 0.9998,\n  "confidence": "Very High"\n}',
      'question-answering': '{\n  "answer": "Paris",\n  "score": 0.9876,\n  "start": 0,\n  "end": 5,\n  "confidence": "High"\n}',
      'translation': 'Bonjour, comment allez-vous aujourd\'hui?',
      'image-classification': '{\n  "labels": [\n    {"label": "Golden Retriever", "score": 0.94},\n    {"label": "Labrador", "score": 0.05},\n    {"label": "Dog", "score": 0.01}\n  ]\n}',
      'conversational': 'Of course! I\'d be happy to help you with your coding question. What would you like to know? Whether it\'s debugging, algorithm design, or learning a new language, I\'m here to assist.',
      'code-generation': 'def sort_numbers(numbers):\n    """\n    Sorts an array of numbers in ascending order.\n    \n    Args:\n        numbers: List of numbers to sort\n    \n    Returns:\n        Sorted list in ascending order\n    """\n    return sorted(numbers)\n\n# Example usage:\nmy_numbers = [64, 34, 25, 12, 22, 11, 90]\nsorted_numbers = sort_numbers(my_numbers)\nprint(sorted_numbers)  # [11, 12, 22, 25, 34, 64, 90]'
    }

    const execTime = Date.now() - startTime
    setExecutionTime(execTime)
    
    const result = mockOutputs[selectedTask.id] || 'Task completed successfully!'
    setOutput(result)
    setIsLoading(false)

    setHistory((current = []) => [
      {
        id: Date.now().toString(),
        taskId: selectedTask.id,
        taskName: selectedTask.name,
        input: input.slice(0, 100),
        output: result.slice(0, 100),
        timestamp: Date.now(),
        executionTime: execTime,
        model: selectedModel
      },
      ...current.slice(0, 9)
    ])

    toast.success('API call completed!', {
      description: `Executed in ${execTime}ms`
    })
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

  const copyCode = (lang: 'python' | 'javascript' | 'curl') => {
    const codes = {
      python: `# HuggingFace Inference API - Python
import requests

API_URL = "https://api-inference.huggingface.co/models/${selectedModel}"
headers = {"Authorization": "Bearer YOUR_API_TOKEN"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({
    "inputs": "${input.replace(/\n/g, '\\n').slice(0, 50)}...",
    "parameters": {
        "temperature": ${temperature[0]},
        "max_new_tokens": ${maxTokens[0]},
        "top_p": ${topP[0]}
    }
})

print(output)`,
      javascript: `// HuggingFace Inference API - JavaScript
const API_URL = "https://api-inference.huggingface.co/models/${selectedModel}";
const headers = { "Authorization": "Bearer YOUR_API_TOKEN" };

async function query(data) {
  const response = await fetch(API_URL, {
    headers: headers,
    method: "POST",
    body: JSON.stringify(data)
  });
  return await response.json();
}

const result = await query({
  inputs: "${input.replace(/\n/g, '\\n').slice(0, 50)}...",
  parameters: {
    temperature: ${temperature[0]},
    max_new_tokens: ${maxTokens[0]},
    top_p: ${topP[0]}
  }
});

console.log(result);`,
      curl: `# HuggingFace Inference API - cURL
curl https://api-inference.huggingface.co/models/${selectedModel} \\
  -X POST \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": "${input.replace(/\n/g, '\\n').slice(0, 50)}...",
    "parameters": {
      "temperature": ${temperature[0]},
      "max_new_tokens": ${maxTokens[0]},
      "top_p": ${topP[0]}
    }
  }'`
    }

    navigator.clipboard.writeText(codes[lang])
    toast.success(`${lang.toUpperCase()} code copied!`)
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

      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)} className="space-y-6">
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
              <motion.div
                key={task.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedTask.id === task.id
                      ? 'border-accent bg-accent/10 shadow-accent/20'
                      : 'hover:border-accent/50'
                  }`}
                  onClick={() => handleTaskChange(task.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {task.icon}
                    </div>
                    {task.badge && (
                      <Badge variant="secondary" className="text-xs">{task.badge}</Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{task.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                </Card>
              </motion.div>
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
                      
                      <AnimatePresence>
                        {showAdvanced && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden"
                          >
                            {selectedTask.parameters.temperature && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Temperature</Label>
                                  <span className="text-xs text-muted-foreground">{temperature[0]}</span>
                                </div>
                                <Slider
                                  value={temperature}
                                  onValueChange={setTemperature}
                                  min={0}
                                  max={2}
                                  step={0.1}
                                  className="w-full"
                                />
                              </div>
                            )}
                            
                            {selectedTask.parameters.maxTokens && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Max Tokens</Label>
                                  <span className="text-xs text-muted-foreground">{maxTokens[0]}</span>
                                </div>
                                <Slider
                                  value={maxTokens}
                                  onValueChange={setMaxTokens}
                                  min={10}
                                  max={500}
                                  step={10}
                                  className="w-full"
                                />
                              </div>
                            )}
                            
                            {selectedTask.parameters.topP && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Top P</Label>
                                  <span className="text-xs text-muted-foreground">{topP[0]}</span>
                                </div>
                                <Slider
                                  value={topP}
                                  onValueChange={setTopP}
                                  min={0}
                                  max={1}
                                  step={0.05}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
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
              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Code size={18} />
                  API Code Examples
                </h4>
                <Tabs defaultValue="python" className="space-y-3">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="python" className="space-y-2">
                    <div className="flex justify-end">
                      <Button size="sm" variant="ghost" onClick={() => copyCode('python')}>
                        <Copy size={14} />
                      </Button>
                    </div>
                    <Card className="p-3 bg-muted">
                      <pre className="text-xs text-accent overflow-x-auto max-h-[400px] overflow-y-auto">
{`# Python Example
import requests

API_URL = "https://api-inference..."
headers = {
  "Authorization": "Bearer TOKEN"
}

def query(payload):
  response = requests.post(
    API_URL, 
    headers=headers,
    json=payload
  )
  return response.json()

output = query({
  "inputs": "${input.slice(0, 30)}...",
  "parameters": {
    "temperature": ${temperature[0]},
    "max_tokens": ${maxTokens[0]}
  }
})`}
                      </pre>
                    </Card>
                  </TabsContent>
                  <TabsContent value="javascript" className="space-y-2">
                    <div className="flex justify-end">
                      <Button size="sm" variant="ghost" onClick={() => copyCode('javascript')}>
                        <Copy size={14} />
                      </Button>
                    </div>
                    <Card className="p-3 bg-muted">
                      <pre className="text-xs text-accent overflow-x-auto max-h-[400px] overflow-y-auto">
{`// JavaScript Example
const API_URL = "https://api-inference...";

async function query(data) {
  const response = await fetch(
    API_URL, {
      headers: {
        Authorization: "Bearer TOKEN"
      },
      method: "POST",
      body: JSON.stringify(data)
    }
  );
  return await response.json();
}

const result = await query({
  inputs: "${input.slice(0, 30)}...",
  parameters: {
    temperature: ${temperature[0]},
    max_tokens: ${maxTokens[0]}
  }
});`}
                      </pre>
                    </Card>
                  </TabsContent>
                  <TabsContent value="curl" className="space-y-2">
                    <div className="flex justify-end">
                      <Button size="sm" variant="ghost" onClick={() => copyCode('curl')}>
                        <Copy size={14} />
                      </Button>
                    </div>
                    <Card className="p-3 bg-muted">
                      <pre className="text-xs text-accent overflow-x-auto max-h-[400px] overflow-y-auto">
{`# cURL Example
curl https://api-inference... \\
  -X POST \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": "${input.slice(0, 30)}...",
    "parameters": {
      "temperature": ${temperature[0]},
      "max_tokens": ${maxTokens[0]}
    }
  }'`}
                      </pre>
                    </Card>
                  </TabsContent>
                </Tabs>
              </Card>

              {savedPrompts.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Star size={18} weight="fill" className="text-accent" />
                    Saved Prompts
                  </h4>
                  <div className="space-y-2">
                    {savedPrompts.slice(0, 5).map((saved) => (
                      <div
                        key={saved.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
                      >
                        <button
                          onClick={() => loadSavedPrompt(saved.id)}
                          className="flex-1 text-left text-sm truncate"
                        >
                          {saved.name}
                        </button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSavedPrompt(saved.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {history.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock size={18} />
                    Recent Executions
                  </h4>
                  <div className="space-y-2">
                    {history.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-muted rounded-lg space-y-1 hover:bg-muted/70 transition-colors cursor-pointer"
                        onClick={() => {
                          const task = PLAYGROUND_TASKS.find(t => t.id === item.taskId)
                          if (task) {
                            setSelectedTask(task)
                            setSelectedModel(item.model)
                            setInput(item.input)
                            setOutput(item.output)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{item.taskName}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.executionTime}ms
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{item.input}</p>
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
                <h4 className="font-semibold mb-3">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-2xl font-bold text-accent">{history.length}</div>
                    <div className="text-xs text-muted-foreground">Total Runs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">{savedPrompts.length}</div>
                    <div className="text-xs text-muted-foreground">Saved Prompts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">130K+</div>
                    <div className="text-xs text-muted-foreground">Models</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">150+</div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
