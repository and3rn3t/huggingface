import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InlineEmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { cn, formatNumber } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFavorites } from '@/hooks/use-favorites';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useSearchModels } from '@/hooks/use-queries';
import { HFModel, HFModelSearchParams } from '@/services/huggingface';
import { ArrowClockwise, Copy, Cpu, Heart, MagnifyingGlass, Sparkle } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ReadmeViewer } from '@/components/common';

interface Model {
  id: string;
  name: string;
  description: string;
  task: string;
  framework: string;
  downloads: number;
  likes: number;
  pipeline: string;
  featured?: boolean;
}

const TASKS = [
  'All Tasks',
  'fill-mask',
  'text-generation',
  'summarization',
  'text2text-generation',
  'feature-extraction',
  'sentence-similarity',
  'text-classification',
  'question-answering',
  'translation',
  'image-classification',
];
const FRAMEWORKS = [
  'All Frameworks',
  'transformers',
  'pytorch',
  'tensorflow',
  'jax',
  'diffusers',
  'safetensors',
];

function transformModel(hfModel: HFModel): Model {
  const id = hfModel.id || hfModel.modelId;
  const nameParts = id.split('/');
  const name = nameParts.length > 1 ? nameParts[1] : id;

  return {
    id,
    name,
    description: `Model by ${hfModel.author || nameParts[0] || 'Unknown'}`,
    task: hfModel.pipeline_tag || 'Unknown',
    framework: hfModel.library_name || 'Unknown',
    downloads: hfModel.downloads || 0,
    likes: hfModel.likes || 0,
    pipeline: hfModel.pipeline_tag || 'text-generation',
    featured: (hfModel.downloads || 0) > 1000000,
  };
}

export function ModelExplorer() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState('All Tasks');
  const [selectedFramework, setSelectedFramework] = useState('All Frameworks');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { isFavorite, toggleFavorite } = useFavorites();
  const copyToClipboard = useCopyToClipboard();

  // Build query params
  const queryParams = useMemo(() => {
    const params: HFModelSearchParams = {
      search: debouncedSearch || undefined,
      limit: 30,
      sort: 'downloads',
      direction: 'desc',
    };
    if (selectedTask !== 'All Tasks') {
      params.pipeline_tag = selectedTask;
    }
    if (selectedFramework !== 'All Frameworks') {
      params.library = selectedFramework;
    }
    return params;
  }, [debouncedSearch, selectedTask, selectedFramework]);

  const { data: hfModels = [], isLoading, error, refetch } = useSearchModels(queryParams);

  // Transform models
  const models = useMemo(() => hfModels.map(transformModel), [hfModels]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const favoriteModels = models.filter((model) => isFavorite(model.id, 'model'));

  const displayModels = activeTab === 'favorites' ? favoriteModels : models;

  const handleToggleFavorite = (e: React.MouseEvent, model: Model) => {
    e.stopPropagation();
    toggleFavorite(model.id, 'model', model.name);
    toast.success(isFavorite(model.id, 'model') ? 'Removed from favorites' : 'Added to favorites');
  };

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive text-sm">Failed to load models. Try refreshing.</p>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-semibold tracking-tight">Model Explorer</h2>
          <p className="text-muted-foreground">
            Discover pre-trained models for your machine learning tasks
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="gap-2"
        >
          <ArrowClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Models</TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2">
            <Heart size={16} weight={favoriteModels.length > 0 ? 'fill' : 'regular'} />
            Favorites {favoriteModels.length > 0 && `(${favoriteModels.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {activeTab === 'all' && (
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <MagnifyingGlass
                  className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                  size={20}
                />
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
                  {TASKS.map((task) => (
                    <SelectItem key={task} value={task}>
                      {task}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRAMEWORKS.map((framework) => (
                    <SelectItem key={framework} value={framework}>
                      {framework}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-3 h-4 w-3/4" />
                  <div className="mb-3 flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayModels.map((model) => (
                <Card
                  key={model.id}
                  className="hover:shadow-primary/20 group border-border hover:border-primary/50 relative cursor-pointer p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
                  onClick={() => setSelectedModel(model)}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
                    onClick={(e) => handleToggleFavorite(e, model)}
                  >
                    <Heart
                      size={18}
                      weight={isFavorite(model.id, 'model') ? 'fill' : 'regular'}
                      className={
                        isFavorite(model.id, 'model') ? 'text-accent' : 'text-muted-foreground'
                      }
                    />
                  </Button>

                  <div className="mb-3 flex items-start justify-between pr-8">
                    <div className="flex items-center gap-2">
                      <Cpu className="text-accent" size={24} />
                      <h3 className="line-clamp-1 text-lg font-medium">{model.name}</h3>
                    </div>
                    {model.featured && <Sparkle className="text-accent shrink-0" size={20} />}
                  </div>

                  <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                    {model.description}
                  </p>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {model.task}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {model.framework}
                    </Badge>
                  </div>

                  <div className="text-muted-foreground flex items-center gap-4 text-xs">
                    <span>{formatNumber(model.downloads)} downloads</span>
                    <span>❤️ {model.likes}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && displayModels.length === 0 && activeTab === 'all' && (
            <InlineEmptyState
              icon={Cpu}
              title="No models found"
              description="Try adjusting your filters or search terms"
            />
          )}

          {!isLoading && displayModels.length === 0 && activeTab === 'favorites' && (
            <InlineEmptyState
              icon={Heart}
              title="No favorites yet"
              description="Click the heart icon on any model to save it to your favorites"
            />
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
                  <h4 className="mb-2 font-medium">Task</h4>
                  <Badge variant="secondary">{selectedModel.task}</Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Framework</h4>
                  <Badge variant="outline">{selectedModel.framework}</Badge>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium">Model ID</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(selectedModel.id)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <code className="text-accent text-sm">{selectedModel.id}</code>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium">Pipeline Usage</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(
                        `from transformers import pipeline\n\npipe = pipeline("${selectedModel.pipeline}", model="${selectedModel.id}")\nresult = pipe("Your input text here")`
                      )
                    }
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <pre className="text-accent overflow-x-auto text-sm">
                  {`from transformers import pipeline

pipe = pipeline("${selectedModel.pipeline}", model="${selectedModel.id}")
result = pipe("Your input text here")`}
                </pre>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium">Direct Model Loading</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(
                        `from transformers import AutoModel, AutoTokenizer\n\nmodel = AutoModel.from_pretrained("${selectedModel.id}")\ntokenizer = AutoTokenizer.from_pretrained("${selectedModel.id}")`
                      )
                    }
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <pre className="text-accent overflow-x-auto text-sm">
                  {`from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained("${selectedModel.id}")
tokenizer = AutoTokenizer.from_pretrained("${selectedModel.id}")`}
                </pre>
              </div>

              <div className="flex items-center gap-6 pt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Downloads: </span>
                  <span className="font-medium">{formatNumber(selectedModel.downloads)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Likes: </span>
                  <span className="font-medium">❤️ {selectedModel.likes}</span>
                </div>
              </div>

              <ReadmeViewer
                resourceId={selectedModel.id}
                type="model"
                maxHeight="300px"
                className="mt-4"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
