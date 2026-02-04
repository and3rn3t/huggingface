import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAchievements } from '@/hooks/use-achievements';
import { API_ERROR_MESSAGES, useApiError } from '@/hooks/use-api-error';
import { HFModel, searchModels } from '@/services/huggingface';
import {
  ArrowClockwise,
  ArrowsLeftRight,
  CheckCircle,
  Cpu,
  MagnifyingGlass,
  Plus,
  X,
  XCircle,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Model {
  id: string;
  name: string;
  description: string;
  task: string;
  framework: string;
  downloads: number;
  likes: number;
  pipeline: string;
  params?: string;
  speed?: 'Fast' | 'Medium' | 'Slow';
  accuracy?: 'High' | 'Medium' | 'Low';
}

/**
 * Extract parameter size from model name/id
 * e.g., "7b" -> "7B", "125m" -> "125M", "1.5b" -> "1.5B"
 */
function extractParams(modelId: string): string {
  const name = modelId.toLowerCase();
  // Match patterns like 7b, 125m, 1.5b, 70b, etc.
  const match = name.match(/(\d+(?:\.\d+)?)\s*([bm])\b/i);
  if (match) {
    const num = match[1];
    const unit = match[2].toUpperCase();
    return `${num}${unit}`;
  }
  return 'Unknown';
}

/**
 * Transform HFModel to local Model interface
 */
function transformHFModel(hfModel: HFModel): Model {
  const downloads = hfModel.downloads || 0;

  // Estimate speed and accuracy based on download count
  // More downloads = more trusted = assumed better quality
  let speed: 'Fast' | 'Medium' | 'Slow';
  let accuracy: 'High' | 'Medium' | 'Low';

  if (downloads >= 10000000) {
    speed = 'Fast';
    accuracy = 'High';
  } else if (downloads >= 1000000) {
    speed = 'Medium';
    accuracy = 'High';
  } else if (downloads >= 100000) {
    speed = 'Medium';
    accuracy = 'Medium';
  } else {
    speed = 'Slow';
    accuracy = 'Low';
  }

  return {
    id: hfModel.id,
    name: hfModel.modelId || hfModel.id,
    description: `Model by ${hfModel.author || 'Unknown'}`,
    task: hfModel.pipeline_tag || 'Unknown',
    framework: hfModel.library_name || 'Unknown',
    downloads,
    likes: hfModel.likes || 0,
    pipeline: hfModel.pipeline_tag || '',
    params: extractParams(hfModel.id),
    speed,
    accuracy,
  };
}

export function ModelComparison() {
  const [selectedModels, setSelectedModels] = useState<Model[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Model[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { trackComparison } = useAchievements();
  const { showError } = useApiError({ messages: API_ERROR_MESSAGES.MODELS });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track comparison achievement
  useEffect(() => {
    if (selectedModels.length >= 2) {
      trackComparison();
    }
  }, [selectedModels.length, trackComparison]);

  // Debounced search function
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchModels({ search: query, limit: 10 });
        const transformedResults = results.map(transformHFModel);
        // Filter out already selected models
        const filteredResults = transformedResults.filter(
          (model) => !selectedModels.find((m) => m.id === model.id)
        );
        setSearchResults(filteredResults);
        setShowResults(true);
      } catch (error) {
        showError(error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [selectedModels, showError]
  );

  // Handle search input change with debounce
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    },
    [performSearch]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const addModel = useCallback(
    (model: Model) => {
      if (selectedModels.length >= 3) {
        toast.error('Maximum 3 models can be compared at once');
        return;
      }

      if (!selectedModels.find((m) => m.id === model.id)) {
        setSelectedModels((prev) => [...prev, model]);
        toast.success(`Added ${model.name} to comparison`);
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
      }
    },
    [selectedModels]
  );

  const removeModel = (modelId: string) => {
    setSelectedModels(selectedModels.filter((m) => m.id !== modelId));
  };

  const clearComparison = () => {
    setSelectedModels([]);
    toast.success('Comparison cleared');
  };

  const retrySearch = useCallback(() => {
    performSearch(searchQuery);
  }, [performSearch, searchQuery]);

  const getSpeedColor = (speed?: string) => {
    switch (speed) {
      case 'Fast':
        return 'text-green-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'Slow':
        return 'text-orange-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getAccuracyIcon = (accuracy?: string) => {
    switch (accuracy) {
      case 'High':
        return <CheckCircle className="text-green-500" size={20} weight="fill" />;
      case 'Medium':
        return <CheckCircle className="text-yellow-500" size={20} weight="fill" />;
      case 'Low':
        return <XCircle className="text-orange-500" size={20} weight="fill" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight">Model Comparison</h2>
        <p className="text-muted-foreground">
          Compare models side-by-side to make informed decisions
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <div className="relative w-full flex-1" ref={searchContainerRef}>
            <label className="mb-2 block text-sm font-medium">Search Models to Compare</label>
            <div className="relative">
              <MagnifyingGlass
                className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                size={18}
              />
              <Input
                placeholder="Search HuggingFace models..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                className="pl-10"
              />
              {isSearching && (
                <ArrowClockwise
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 animate-spin"
                  size={18}
                />
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <Card className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto shadow-lg">
                {isSearching ? (
                  <div className="space-y-2 p-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((model) => (
                      <button
                        key={model.id}
                        className="hover:bg-accent flex w-full items-center gap-3 px-4 py-2 text-left transition-colors"
                        onClick={() => addModel(model)}
                      >
                        <Cpu className="text-primary shrink-0" size={20} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{model.name}</div>
                          <div className="text-muted-foreground flex gap-2 text-xs">
                            <span>{model.task}</span>
                            {model.framework !== 'Unknown' && (
                              <>
                                <span>•</span>
                                <span>{model.framework}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{(model.downloads / 1000).toFixed(0)}K downloads</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.trim() && !isSearching ? (
                  <div className="text-muted-foreground p-4 text-center">
                    <p>No models found for "{searchQuery}"</p>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={retrySearch}>
                      <ArrowClockwise className="mr-2" size={14} />
                      Retry
                    </Button>
                  </div>
                ) : null}
              </Card>
            )}
          </div>

          {selectedModels.length > 0 && (
            <Button variant="outline" onClick={clearComparison}>
              Clear All
            </Button>
          )}
        </div>
      </Card>

      {selectedModels.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <ArrowsLeftRight className="text-muted-foreground mx-auto mb-4" size={64} />
          <h3 className="mb-2 text-lg font-medium">No Models Selected</h3>
          <p className="text-muted-foreground mx-auto max-w-md">
            Add models from the dropdown above to start comparing their features, performance, and
            characteristics
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {selectedModels.map((model) => (
            <Card key={model.id} className="border-primary/30 relative p-4">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={() => removeModel(model.id)}
              >
                <X size={16} />
              </Button>

              <div className="mb-3 flex items-center gap-2 pr-8">
                <Cpu className="text-accent" size={24} />
                <h3 className="line-clamp-1 text-lg font-medium">{model.name}</h3>
              </div>

              <p className="text-muted-foreground mb-4 line-clamp-2 min-h-[40px] text-sm">
                {model.description}
              </p>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Task</span>
                  <Badge variant="secondary" className="text-xs">
                    {model.task}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Framework</span>
                  <Badge variant="outline" className="text-xs">
                    {model.framework}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Parameters</span>
                  <span className="text-sm font-medium">{model.params || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Speed</span>
                  <span className={`text-sm font-medium ${getSpeedColor(model.speed)}`}>
                    {model.speed || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Accuracy</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{model.accuracy || 'N/A'}</span>
                    {getAccuracyIcon(model.accuracy)}
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Downloads</span>
                  <span className="text-sm font-medium">
                    {(model.downloads / 1000000).toFixed(1)}M
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Likes</span>
                  <span className="text-sm font-medium">❤️ {model.likes}</span>
                </div>
              </div>
            </Card>
          ))}

          {selectedModels.length < 3 && (
            <Card className="flex min-h-[400px] items-center justify-center border-2 border-dashed p-4">
              <div className="text-center">
                <Plus className="text-muted-foreground mx-auto mb-2" size={48} />
                <p className="text-muted-foreground text-sm">
                  Add another model
                  <br />
                  to compare
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
