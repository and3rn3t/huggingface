import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Code, Play, Copy, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PlaygroundTask {
  id: string
  name: string
  description: string
  placeholder: string
  exampleInput: string
}

const PLAYGROUND_TASKS: PlaygroundTask[] = [
  {
    id: 'text-generation',
    name: 'Text Generation',
    description: 'Generate text continuations from a prompt',
    placeholder: 'Enter your prompt text...',
    exampleInput: 'Once upon a time in a land far away,'
  },
  {
    id: 'summarization',
    name: 'Summarization',
    description: 'Create concise summaries of longer texts',
    placeholder: 'Paste text to summarize...',
    exampleInput: 'The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side.'
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    description: 'Classify text as positive, negative, or neutral',
    placeholder: 'Enter text to analyze...',
    exampleInput: 'I absolutely loved this product! Best purchase ever.'
  },
  {
    id: 'question-answering',
    name: 'Question Answering',
    description: 'Answer questions based on context',
    placeholder: 'Enter context and question...',
    exampleInput: 'Context: Paris is the capital of France.\nQuestion: What is the capital of France?'
  },
  {
    id: 'translation',
    name: 'Translation',
    description: 'Translate text between languages',
    placeholder: 'Enter text to translate...',
    exampleInput: 'Hello, how are you today?'
  }
]

export function ApiPlayground() {
  const [selectedTask, setSelectedTask] = useState<PlaygroundTask>(PLAYGROUND_TASKS[0])
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTaskChange = (taskId: string) => {
    const task = PLAYGROUND_TASKS.find(t => t.id === taskId)
    if (task) {
      setSelectedTask(task)
      setInput('')
      setOutput('')
    }
  }

  const loadExample = () => {
    setInput(selectedTask.exampleInput)
    setOutput('')
  }

  const executeTask = async () => {
    if (!input.trim()) {
      toast.error('Please enter some input text')
      return
    }

    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mockOutputs: Record<string, string> = {
      'text-generation': input + ' there lived a brave knight who sought adventure and glory. The kingdom was peaceful, but rumors of a dragon stirring in the mountains had reached the castle.',
      'summarization': 'The Eiffel Tower is a 324-meter tall iron structure in Paris, equivalent to an 81-storey building with a 125-meter square base.',
      'sentiment-analysis': '{\n  "label": "POSITIVE",\n  "score": 0.9998\n}',
      'question-answering': '{\n  "answer": "Paris",\n  "score": 0.9876,\n  "start": 0,\n  "end": 5\n}',
      'translation': 'Bonjour, comment allez-vous aujourd\'hui?'
    }
    
    setOutput(mockOutputs[selectedTask.id] || 'Task completed successfully!')
    setIsLoading(false)
    toast.success('API call completed!')
  }

  const copyCode = () => {
    const code = `# HuggingFace Inference API Example
import requests

API_URL = "https://api-inference.huggingface.co/models/..."
headers = {"Authorization": "Bearer YOUR_API_TOKEN"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({
    "inputs": "${input.replace(/\n/g, '\\n')}",
})`
    
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight">API Playground</h2>
        <p className="text-muted-foreground">Test HuggingFace Inference API with different tasks and models</p>
      </div>

      <Card className="p-6 border-primary/30 bg-gradient-to-br from-card to-primary/5">
        <div className="flex items-start gap-3">
          <Sparkle className="text-accent flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-medium mb-1">Learning Mode</h3>
            <p className="text-sm text-muted-foreground">
              This playground uses simulated responses. In production, you'd use the HuggingFace Inference API with your API token to get real results from models.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Task</label>
            <Select value={selectedTask.id} onValueChange={handleTaskChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAYGROUND_TASKS.map(task => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="p-4 bg-muted/50">
            <h4 className="font-medium mb-2 text-sm">{selectedTask.name}</h4>
            <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Input</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={loadExample}
                className="text-xs"
              >
                Load Example
              </Button>
            </div>
            <Textarea
              placeholder={selectedTask.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <Button
            onClick={executeTask}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>Running...</>
            ) : (
              <>
                <Play size={18} weight="fill" />
                Execute API Call
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Output</label>
            <Card className="p-4 bg-muted min-h-[200px] relative">
              {output ? (
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">{output}</pre>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  <div className="text-center">
                    <Code size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Run an API call to see results</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">API Code Example</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyCode}
                disabled={!input}
              >
                <Copy size={16} />
              </Button>
            </div>
            <Card className="p-4 bg-muted">
              <pre className="text-xs text-accent overflow-x-auto">
{`# HuggingFace Inference API Example
import requests

API_URL = "https://api-inference.huggingface.co/models/..."
headers = {"Authorization": "Bearer YOUR_API_TOKEN"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({
    "inputs": "${input.slice(0, 50)}${input.length > 50 ? '...' : ''}",
})`}
              </pre>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-primary/10 border-primary/30">
              <div className="text-xs text-muted-foreground mb-1">Models Available</div>
              <div className="text-2xl font-semibold text-accent">130K+</div>
            </Card>
            <Card className="p-4 bg-accent/10 border-accent/30">
              <div className="text-xs text-muted-foreground mb-1">Tasks Supported</div>
              <div className="text-2xl font-semibold text-accent">150+</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
