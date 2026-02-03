import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MagnifyingGlass, Cpu, Copy, Sparkle, ArrowRight, Heart } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useFavorites } from '@/hooks/use-favorites'

interface Model {
  id: string
  name: string
  description: string
  task: string
  framework: string
  downloads: number
  likes: number
  pipeline: string
  featured?: boolean
}

const SAMPLE_MODELS: Model[] = [
  {
    id: 'bert-base-uncased',
    name: 'BERT Base Uncased',
    description: 'Pretrained BERT model on English language using a masked language modeling objective',
    task: 'Fill-Mask',
    framework: 'PyTorch',
    downloads: 45200000,
    likes: 2341,
    pipeline: 'fill-mask',
    featured: true
  },
  {
    id: 'gpt2',
    name: 'GPT-2',
    description: 'OpenAI\'s GPT-2 model for text generation, trained on WebText dataset',
    task: 'Text Generation',
    framework: 'PyTorch',
    downloads: 38900000,
    likes: 1876,
    pipeline: 'text-generation'
  },
  {
    id: 'distilbert-base-uncased',
    name: 'DistilBERT',
    description: 'Distilled version of BERT: smaller, faster, cheaper and lighter than BERT',
    task: 'Feature Extraction',
    framework: 'PyTorch',
    downloads: 52100000,
    likes: 2567,
    pipeline: 'feature-extraction',
    featured: true
  },
  {
    id: 'facebook/bart-large-cnn',
    name: 'BART Large CNN',
    description: 'BART model fine-tuned on CNN Daily Mail for summarization tasks',
    task: 'Summarization',
    framework: 'PyTorch',
    downloads: 12400000,
    likes: 892,
    pipeline: 'summarization'
  },
  {
    id: 't5-base',
    name: 'T5 Base',
    description: 'Text-to-Text Transfer Transformer for various NLP tasks',
    task: 'Text2Text Generation',
    framework: 'PyTorch',
    downloads: 28700000,
    likes: 1453,
    pipeline: 'text2text-generation',
    featured: true
  },
  {
    id: 'sentence-transformers/all-MiniLM-L6-v2',
    name: 'All MiniLM L6 v2',
    description: 'Sentence transformer model for semantic similarity and sentence embeddings',
    task: 'Sentence Similarity',
    framework: 'PyTorch',
    downloads: 67800000,
    likes: 3124,
    pipeline: 'sentence-similarity'
  }
]

const TASKS = ['All Tasks', 'Fill-Mask', 'Text Generation', 'Summarization', 'Text2Text Generation', 'Feature Extraction', 'Sentence Similarity']
const FRAMEWORKS = ['All Frameworks', 'PyTorch', 'TensorFlow', 'JAX']

export function ModelExplorer() {
  const [search, setSearch] = useState('')
  const [selectedTask, setSelectedTask] = useState('All Tasks')
  const [selectedFramework, setSelectedFramework] = useState('All Frameworks')
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const { isFavorite, toggleFavorite, getFavoritesByType } = useFavorites()

  const filteredModels = SAMPLE_MODELS.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(search.toLowerCase()) ||
      model.description.toLowerCase().includes(search.toLowerCase()) ||
      model.task.toLowerCase().includes(search.toLowerCase())
    const matchesTask = selectedTask === 'All Tasks' || model.task === selectedTask
    const matchesFramework = selectedFramework === 'All Frameworks' || model.framework === selectedFramework
    
    return matchesSearch && matchesTask && matchesFramework
  })

  const favoriteModels = SAMPLE_MODELS.filter(model => 
    isFavorite(model.id, 'model')
  )

  const displayModels = activeTab === 'favorites' ? favoriteModels : filteredModels

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleToggleFavorite = (e: React.MouseEvent, model: Model) => {
    e.stopPropagation()
    toggleFavorite(model.id, 'model', model.name)
    toast.success(
      isFavorite(model.id, 'model') 
        ? 'Removed from favorites' 
        : 'Added to favorites'
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight">Model Explorer</h2>
        <p className="text-muted-foreground">Discover pre-trained models for your machine learning tasks</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Models</TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2">
            <Heart size={16} weight={favoriteModels.length > 0 ? 'fill' : 'regular'} />
            Favorites {favoriteModels.length > 0 && `(${favoriteModels.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {activeTab === 'all' && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Search models by name or task..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASKS.map(task => (
                    <SelectItem key={task} value={task}>{task}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRAMEWORKS.map(framework => (
                    <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayModels.map((model) => (
              <Card
                key={model.id}
                className="p-4 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer group hover:-translate-y-1 border-border hover:border-primary/50 relative"
                onClick={() => setSelectedModel(model)}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
                  onClick={(e) => handleToggleFavorite(e, model)}
                >
                  <Heart 
                    size={18} 
                    weight={isFavorite(model.id, 'model') ? 'fill' : 'regular'}
                    className={isFavorite(model.id, 'model') ? 'text-accent' : 'text-muted-foreground'}
                  />
                </Button>

                <div className="flex items-start justify-between mb-3 pr-8">
                  <div className="flex items-center gap-2">
                    <Cpu className="text-accent" size={24} />
                    <h3 className="font-medium text-lg line-clamp-1">{model.name}</h3>
                  </div>
                  {model.featured && <Sparkle className="text-accent flex-shrink-0" size={20} />}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{model.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {model.task}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {model.framework}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{(model.downloads / 1000000).toFixed(1)}M downloads</span>
                  <span>❤️ {model.likes}</span>
                </div>
              </Card>
            ))}
          </div>

          {displayModels.length === 0 && activeTab === 'all' && (
            <div className="text-center py-12">
              <Cpu className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-lg font-medium mb-2">No models found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          )}

          {displayModels.length === 0 && activeTab === 'favorites' && (
            <div className="text-center py-12">
              <Heart className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
              <p className="text-muted-foreground">Click the heart icon on any model to save it to your favorites</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cpu className="text-accent" size={28} />
              {selectedModel?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedModel && (
            <div className="space-y-4">
              <p className="text-foreground">{selectedModel.description}</p>
              
              <div className="flex gap-4">
                <div>
                  <h4 className="font-medium mb-2">Task</h4>
                  <Badge variant="secondary">{selectedModel.task}</Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Framework</h4>
                  <Badge variant="outline">{selectedModel.framework}</Badge>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Model ID</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(selectedModel.id)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <code className="text-sm text-accent">{selectedModel.id}</code>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Pipeline Usage</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(`from transformers import pipeline\n\npipe = pipeline("${selectedModel.pipeline}", model="${selectedModel.id}")\nresult = pipe("Your input text here")`)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <pre className="text-sm text-accent overflow-x-auto">
{`from transformers import pipeline

pipe = pipeline("${selectedModel.pipeline}", model="${selectedModel.id}")
result = pipe("Your input text here")`}
                </pre>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Direct Model Loading</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(`from transformers import AutoModel, AutoTokenizer\n\nmodel = AutoModel.from_pretrained("${selectedModel.id}")\ntokenizer = AutoTokenizer.from_pretrained("${selectedModel.id}")`)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <pre className="text-sm text-accent overflow-x-auto">
{`from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained("${selectedModel.id}")
tokenizer = AutoTokenizer.from_pretrained("${selectedModel.id}")`}
                </pre>
              </div>
              
              <div className="flex items-center gap-6 pt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Downloads: </span>
                  <span className="font-medium">{(selectedModel.downloads / 1000000).toFixed(1)}M</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Likes: </span>
                  <span className="font-medium">❤️ {selectedModel.likes}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
