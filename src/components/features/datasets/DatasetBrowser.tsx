import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InlineEmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { cn, formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFavorites } from '@/hooks/use-favorites';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useSearchDatasets } from '@/hooks/use-queries';
import { HFDataset, HFDatasetSearchParams } from '@/services/huggingface';
import {
  ArrowClockwise,
  Copy,
  Database,
  Heart,
  MagnifyingGlass,
  Sparkle,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ReadmeViewer } from '@/components/common';

interface Dataset {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  downloads: number;
  likes: number;
  tags: string[];
  featured?: boolean;
}

/**
 * Transform HFDataset from API to local Dataset interface
 */
function transformDataset(hfDataset: HFDataset): Dataset {
  const tags = hfDataset.tags || [];

  // Extract tasks from tags starting with 'task_categories:'
  const tasks = tags
    .filter((tag) => tag.startsWith('task_categories:'))
    .map((tag) => tag.replace('task_categories:', '').replace(/-/g, ' '))
    .map((task) =>
      task
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );

  // Extract displayable tags (language:, size_categories:)
  const displayTags = tags
    .filter((tag) => tag.startsWith('language:') || tag.startsWith('size_categories:'))
    .map((tag) => {
      if (tag.startsWith('language:')) {
        return tag.replace('language:', '');
      }
      if (tag.startsWith('size_categories:')) {
        return tag.replace('size_categories:', '');
      }
      return tag;
    });

  // Extract dataset name from id (e.g., "username/dataset-name" -> "dataset-name")
  const name = hfDataset.id.includes('/')
    ? hfDataset.id.split('/').pop() || hfDataset.id
    : hfDataset.id;

  return {
    id: hfDataset.id,
    name,
    description: hfDataset.description || 'No description available',
    tasks: tasks.length > 0 ? tasks : ['General'],
    downloads: hfDataset.downloads || 0,
    likes: hfDataset.likes || 0,
    tags: displayTags.length > 0 ? displayTags : [],
    featured: (hfDataset.downloads || 0) > 1000000,
  };
}

export function DatasetBrowser() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { isFavorite, toggleFavorite} = useFavorites();
  const copyToClipboard = useCopyToClipboard();

  // Build query params
  const queryParams = useMemo(() => {
    const params: HFDatasetSearchParams = {
      search: debouncedSearch || undefined,
      limit: 30,
      sort: 'downloads',
      direction: 'desc',
    };
    return params;
  }, [debouncedSearch]);

  const { data: hfDatasets = [], isLoading, error, refetch } = useSearchDatasets(queryParams);

  // Transform datasets
  const datasets = useMemo(() => hfDatasets.map(transformDataset), [hfDatasets]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const favoriteDatasets = datasets.filter((dataset) => isFavorite(dataset.id, 'dataset'));

  const displayDatasets = activeTab === 'favorites' ? favoriteDatasets : datasets;

  const handleToggleFavorite = (e: React.MouseEvent, dataset: Dataset) => {
    e.stopPropagation();
    toggleFavorite(dataset.id, 'dataset', dataset.name);
    toast.success(
      isFavorite(dataset.id, 'dataset') ? 'Removed from favorites' : 'Added to favorites'
    );
  };

  const handleRefresh = () => {
    refetch();
  };

  const DatasetSkeleton = () => (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-3 h-4 w-3/4" />
      <div className="mb-3 flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-18 rounded-full" />
      </div>
      <div className="mt-3 flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-semibold tracking-tight">Dataset Browser</h2>
          <p className="text-muted-foreground">
            Explore HuggingFace's vast collection of datasets for machine learning
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <ArrowClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Datasets</TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2">
            <Heart size={16} weight={favoriteDatasets.length > 0 ? 'fill' : 'regular'} />
            Favorites {favoriteDatasets.length > 0 && `(${favoriteDatasets.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {activeTab === 'all' && (
            <div className="relative">
              <MagnifyingGlass
                className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                size={20}
              />
              <Input
                placeholder="Search datasets by name, task, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {error && (
            <Card className="border-destructive/50 bg-destructive/10 p-4">
              <p className="text-destructive text-sm">Failed to load datasets. Try refreshing.</p>
            </Card>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <DatasetSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayDatasets.map((dataset) => (
                <Card
                  key={dataset.id}
                  className="hover:shadow-primary/20 group border-border hover:border-primary/50 relative cursor-pointer p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
                  onClick={() => setSelectedDataset(dataset)}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
                    onClick={(e) => handleToggleFavorite(e, dataset)}
                  >
                    <Heart
                      size={18}
                      weight={isFavorite(dataset.id, 'dataset') ? 'fill' : 'regular'}
                      className={
                        isFavorite(dataset.id, 'dataset') ? 'text-accent' : 'text-muted-foreground'
                      }
                    />
                  </Button>

                  <div className="mb-3 flex items-start justify-between pr-8">
                    <div className="flex items-center gap-2">
                      <Database className="text-accent" size={24} />
                      <h3 className="text-lg font-medium">{dataset.name}</h3>
                    </div>
                    {dataset.featured && <Sparkle className="text-accent" size={20} />}
                  </div>

                  <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                    {dataset.description}
                  </p>

                  <div className="mb-3 flex flex-wrap gap-2">
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

                  <div className="text-muted-foreground mt-3 flex items-center gap-4 text-xs">
                    <span>{formatNumber(dataset.downloads)} downloads</span>
                    <span>❤️ {dataset.likes}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && displayDatasets.length === 0 && activeTab === 'all' && (
            <InlineEmptyState
              icon={Database}
              title="No datasets found"
              description="Try adjusting your search terms"
            />
          )}

          {!isLoading && displayDatasets.length === 0 && activeTab === 'favorites' && (
            <InlineEmptyState
              icon={Heart}
              title="No favorites yet"
              description="Click the heart icon on any dataset to save it to your favorites"
            />
          )}
        </TabsContent>
      </Tabs>

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
                <h4 className="mb-2 font-medium">Tasks</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDataset.tasks.map((task) => (
                    <Badge key={task} variant="secondary">
                      {task}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-medium">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDataset.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium">Dataset ID</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(selectedDataset.id)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <code className="text-accent text-sm">{selectedDataset.id}</code>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium">Usage Example</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(
                        `from datasets import load_dataset\n\ndataset = load_dataset("${selectedDataset.id}")`
                      )
                    }
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <pre className="text-accent overflow-x-auto text-sm">
                  {`from datasets import load_dataset

dataset = load_dataset("${selectedDataset.id}")`}
                </pre>
              </div>

              <div className="flex items-center gap-6 pt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Downloads: </span>
                  <span className="font-medium">{formatNumber(selectedDataset.downloads)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Likes: </span>
                  <span className="font-medium">❤️ {selectedDataset.likes}</span>
                </div>
              </div>

              <ReadmeViewer
                resourceId={selectedDataset.id}
                type="dataset"
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
