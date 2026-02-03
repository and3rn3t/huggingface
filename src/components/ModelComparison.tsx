import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Cpu, X, Plus, ArrowsLeftRight, CheckCircle, XCircle } from '@phosphor-icons/react'
import { useAchievements } from '@/hooks/use-achievements'
import { toast } from 'sonner'

interface Model {
  id: string
  name: string
  description: string
  task: string
  framework: string
  downloads: number
  likes: number
  pipeline: string
  params?: string
  speed?: 'Fast' | 'Medium' | 'Slow'
  accuracy?: 'High' | 'Medium' | 'Low'
}

const AVAILABLE_MODELS: Model[] = [
  {
    id: 'bert-base-uncased',
    name: 'BERT Base Uncased',
    description: 'Pretrained BERT model on English language',
    task: 'Fill-Mask',
    framework: 'PyTorch',
    downloads: 45200000,
    likes: 2341,
    pipeline: 'fill-mask',
    params: '110M',
    speed: 'Medium',
    accuracy: 'High'
  },
  {
    id: 'gpt2',
    name: 'GPT-2',
    description: 'OpenAI\'s GPT-2 model for text generation',
    task: 'Text Generation',
    framework: 'PyTorch',
    downloads: 38900000,
    likes: 1876,
    pipeline: 'text-generation',
    params: '124M',
    speed: 'Medium',
    accuracy: 'High'
  },
  {
    id: 'distilbert-base-uncased',
    name: 'DistilBERT',
    description: 'Distilled version of BERT: smaller, faster',
    task: 'Feature Extraction',
    framework: 'PyTorch',
    downloads: 52100000,
    likes: 2567,
    pipeline: 'feature-extraction',
    params: '66M',
    speed: 'Fast',
    accuracy: 'Medium'
  },
  {
    id: 'facebook/bart-large-cnn',
    name: 'BART Large CNN',
    description: 'BART model fine-tuned on CNN Daily Mail',
    task: 'Summarization',
    framework: 'PyTorch',
    downloads: 12400000,
    likes: 892,
    pipeline: 'summarization',
    params: '406M',
    speed: 'Slow',
    accuracy: 'High'
  },
  {
    id: 't5-base',
    name: 'T5 Base',
    description: 'Text-to-Text Transfer Transformer',
    task: 'Text2Text Generation',
    framework: 'PyTorch',
    downloads: 28700000,
    likes: 1453,
    pipeline: 'text2text-generation',
    params: '220M',
    speed: 'Medium',
    accuracy: 'High'
  },
  {
    id: 'sentence-transformers/all-MiniLM-L6-v2',
    name: 'All MiniLM L6 v2',
    description: 'Sentence transformer for semantic similarity',
    task: 'Sentence Similarity',
    framework: 'PyTorch',
    downloads: 67800000,
    likes: 3124,
    pipeline: 'sentence-similarity',
    params: '22M',
    speed: 'Fast',
    accuracy: 'Medium'
  }
]

export function ModelComparison() {
  const [selectedModels, setSelectedModels] = useState<Model[]>([])
  const [availableModels] = useState<Model[]>(AVAILABLE_MODELS)
  const { trackComparison } = useAchievements()

  useEffect(() => {
    if (selectedModels.length >= 2) {
      trackComparison()
    }
  }, [selectedModels.length, trackComparison])

  const addModel = (modelId: string) => {
    if (selectedModels.length >= 3) {
      toast.error('Maximum 3 models can be compared at once')
      return
    }

    const model = availableModels.find(m => m.id === modelId)
    if (model && !selectedModels.find(m => m.id === modelId)) {
      setSelectedModels([...selectedModels, model])
      toast.success(`Added ${model.name} to comparison`)
    }
  }

  const removeModel = (modelId: string) => {
    setSelectedModels(selectedModels.filter(m => m.id !== modelId))
  }

  const clearComparison = () => {
    setSelectedModels([])
    toast.success('Comparison cleared')
  }

  const getSpeedColor = (speed?: string) => {
    switch (speed) {
      case 'Fast': return 'text-green-500'
      case 'Medium': return 'text-yellow-500'
      case 'Slow': return 'text-orange-500'
      default: return 'text-muted-foreground'
    }
  }

  const getAccuracyIcon = (accuracy?: string) => {
    switch (accuracy) {
      case 'High': return <CheckCircle className="text-green-500" size={20} weight="fill" />
      case 'Medium': return <CheckCircle className="text-yellow-500" size={20} weight="fill" />
      case 'Low': return <XCircle className="text-orange-500" size={20} weight="fill" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight">Model Comparison</h2>
        <p className="text-muted-foreground">Compare models side-by-side to make informed decisions</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium mb-2 block">Add Model to Compare</label>
            <Select onValueChange={addModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model..." />
              </SelectTrigger>
              <SelectContent>
                {availableModels
                  .filter(model => !selectedModels.find(m => m.id === model.id))
                  .map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedModels.length > 0 && (
            <Button variant="outline" onClick={clearComparison}>
              Clear All
            </Button>
          )}
        </div>
      </Card>

      {selectedModels.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <ArrowsLeftRight className="mx-auto mb-4 text-muted-foreground" size={64} />
          <h3 className="text-lg font-medium mb-2">No Models Selected</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Add models from the dropdown above to start comparing their features, performance, and characteristics
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedModels.map((model) => (
            <Card key={model.id} className="p-4 relative border-primary/30">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={() => removeModel(model.id)}
              >
                <X size={16} />
              </Button>

              <div className="flex items-center gap-2 mb-3 pr-8">
                <Cpu className="text-accent" size={24} />
                <h3 className="font-medium text-lg line-clamp-1">{model.name}</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                {model.description}
              </p>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Task</span>
                  <Badge variant="secondary" className="text-xs">
                    {model.task}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Framework</span>
                  <Badge variant="outline" className="text-xs">
                    {model.framework}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Parameters</span>
                  <span className="text-sm font-medium">{model.params || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Speed</span>
                  <span className={`text-sm font-medium ${getSpeedColor(model.speed)}`}>
                    {model.speed || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{model.accuracy || 'N/A'}</span>
                    {getAccuracyIcon(model.accuracy)}
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Downloads</span>
                  <span className="text-sm font-medium">
                    {(model.downloads / 1000000).toFixed(1)}M
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Likes</span>
                  <span className="text-sm font-medium">❤️ {model.likes}</span>
                </div>
              </div>
            </Card>
          ))}

          {selectedModels.length < 3 && (
            <Card className="p-4 border-dashed border-2 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Plus className="mx-auto mb-2 text-muted-foreground" size={48} />
                <p className="text-sm text-muted-foreground">
                  Add another model<br />to compare
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
