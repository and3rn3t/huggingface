import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MagnifyingGlass, Database, Copy, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Dataset {
  id: string
  name: string
  description: string
  tasks: string[]
  downloads: number
  likes: number
  tags: string[]
  featured?: boolean
}

const SAMPLE_DATASETS: Dataset[] = [
  {
    id: 'squad',
    name: 'SQuAD',
    description: 'Stanford Question Answering Dataset - 100k+ question-answer pairs on Wikipedia articles for reading comprehension',
    tasks: ['Question Answering'],
    downloads: 15420000,
    likes: 892,
    tags: ['english', 'qa', 'wikipedia'],
    featured: true
  },
  {
    id: 'imdb',
    name: 'IMDB Reviews',
    description: 'Large movie review dataset for binary sentiment classification containing 50k highly polar reviews',
    tasks: ['Sentiment Analysis'],
    downloads: 8920000,
    likes: 645,
    tags: ['english', 'sentiment', 'movies']
  },
  {
    id: 'common_voice',
    name: 'Common Voice',
    description: 'Mozilla\'s open source, multi-language dataset of voices for speech recognition training',
    tasks: ['Speech Recognition'],
    downloads: 5340000,
    likes: 523,
    tags: ['multilingual', 'audio', 'speech'],
    featured: true
  },
  {
    id: 'coco',
    name: 'COCO',
    description: 'Common Objects in Context - Large-scale object detection, segmentation, and captioning dataset',
    tasks: ['Object Detection', 'Image Captioning'],
    downloads: 12100000,
    likes: 1024,
    tags: ['images', 'detection', 'captions']
  },
  {
    id: 'wikitext',
    name: 'WikiText',
    description: 'Collection of over 100 million tokens from Wikipedia articles for language modeling',
    tasks: ['Language Modeling'],
    downloads: 3450000,
    likes: 412,
    tags: ['english', 'wikipedia', 'text']
  },
  {
    id: 'mnist',
    name: 'MNIST',
    description: 'Classic handwritten digit database with 70k images for image classification tasks',
    tasks: ['Image Classification'],
    downloads: 18900000,
    likes: 734,
    tags: ['images', 'digits', 'classification'],
    featured: true
  }
]

export function DatasetBrowser() {
  const [search, setSearch] = useState('')
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)

  const filteredDatasets = SAMPLE_DATASETS.filter(dataset =>
    dataset.name.toLowerCase().includes(search.toLowerCase()) ||
    dataset.description.toLowerCase().includes(search.toLowerCase()) ||
    dataset.tasks.some(task => task.toLowerCase().includes(search.toLowerCase()))
  )

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight">Dataset Browser</h2>
        <p className="text-muted-foreground">Explore HuggingFace's vast collection of datasets for machine learning</p>
      </div>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder="Search datasets by name, task, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDatasets.map((dataset) => (
          <Card
            key={dataset.id}
            className="p-4 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer group hover:-translate-y-1 border-border hover:border-primary/50"
            onClick={() => setSelectedDataset(dataset)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="text-accent" size={24} />
                <h3 className="font-medium text-lg">{dataset.name}</h3>
              </div>
              {dataset.featured && <Sparkle className="text-accent" size={20} />}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{dataset.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {dataset.tasks.map((task) => (
                <Badge key={task} variant="secondary" className="text-xs">
                  {task}
                </Badge>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {dataset.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>{(dataset.downloads / 1000000).toFixed(1)}M downloads</span>
              <span>❤️ {dataset.likes}</span>
            </div>
          </Card>
        ))}
      </div>

      {filteredDatasets.length === 0 && (
        <div className="text-center py-12">
          <Database className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-medium mb-2">No datasets found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms</p>
        </div>
      )}

      <Dialog open={!!selectedDataset} onOpenChange={() => setSelectedDataset(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="text-accent" size={28} />
              {selectedDataset?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDataset && (
            <div className="space-y-4">
              <p className="text-foreground">{selectedDataset.description}</p>
              
              <div>
                <h4 className="font-medium mb-2">Tasks</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDataset.tasks.map((task) => (
                    <Badge key={task} variant="secondary">{task}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDataset.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Dataset ID</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(selectedDataset.id)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <code className="text-sm text-accent">{selectedDataset.id}</code>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Usage Example</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(`from datasets import load_dataset\n\ndataset = load_dataset("${selectedDataset.id}")`)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <pre className="text-sm text-accent overflow-x-auto">
{`from datasets import load_dataset

dataset = load_dataset("${selectedDataset.id}")`}
                </pre>
              </div>
              
              <div className="flex items-center gap-6 pt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Downloads: </span>
                  <span className="font-medium">{(selectedDataset.downloads / 1000000).toFixed(1)}M</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Likes: </span>
                  <span className="font-medium">❤️ {selectedDataset.likes}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
