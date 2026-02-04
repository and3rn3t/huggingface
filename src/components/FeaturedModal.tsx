import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import { useSearchModels } from '@/hooks/use-queries';
import { HFModel } from '@/services/huggingface';
import { ArrowClockwise, Sparkle, TrendUp } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

const CACHE_KEY = 'featured-models-cache';
const CACHE_EXPIRY_KEY = 'featured-models-cache-expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Static fallback models
const FALLBACK_MODELS: HFModel[] = [
  {
    id: 'bert-base-uncased',
    modelId: 'bert-base-uncased',
    downloads: 12500000,
    likes: 850,
    author: 'google',
    pipeline_tag: 'fill-mask',
    library_name: 'transformers',
  },
  {
    id: 'gpt2',
    modelId: 'gpt2',
    downloads: 8200000,
    likes: 620,
    author: 'openai',
    pipeline_tag: 'text-generation',
    library_name: 'transformers',
  },
  {
    id: 'distilbert-base-uncased',
    modelId: 'distilbert-base-uncased',
    downloads: 6800000,
    likes: 410,
    author: 'distilbert',
    pipeline_tag: 'fill-mask',
    library_name: 'transformers',
  },
  {
    id: 'roberta-base',
    modelId: 'roberta-base',
    downloads: 5400000,
    likes: 380,
    author: 'roberta',
    pipeline_tag: 'fill-mask',
    library_name: 'transformers',
  },
  {
    id: 't5-small',
    modelId: 't5-small',
    downloads: 4100000,
    likes: 290,
    author: 't5',
    pipeline_tag: 'text2text-generation',
    library_name: 'transformers',
  },
  {
    id: 'facebook/bart-large-cnn',
    modelId: 'facebook/bart-large-cnn',
    downloads: 3200000,
    likes: 250,
    author: 'facebook',
    pipeline_tag: 'summarization',
    library_name: 'transformers',
  },
  {
    id: 'distilgpt2',
    modelId: 'distilgpt2',
    downloads: 2800000,
    likes: 210,
    author: 'distilbert',
    pipeline_tag: 'text-generation',
    library_name: 'transformers',
  },
  {
    id: 'Helsinki-NLP/opus-mt-en-es',
    modelId: 'Helsinki-NLP/opus-mt-en-es',
    downloads: 1900000,
    likes: 160,
    author: 'Helsinki-NLP',
    pipeline_tag: 'translation',
    library_name: 'transformers',
  },
];

interface FeaturedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectModel: (model: HFModel) => void;
}

export function FeaturedModal({ open, onOpenChange, onSelectModel }: FeaturedModalProps) {
  const [cachedModels, setCachedModels] = useState<HFModel[] | null>(null);
  const [useCache, setUseCache] = useState(true);

  // Check cache on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

    if (cached && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() < expiryTime) {
        try {
          const parsedModels = JSON.parse(cached);
          setCachedModels(parsedModels);
        } catch {
          // Invalid cache, will fetch fresh
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(CACHE_EXPIRY_KEY);
        }
      } else {
        // Expired cache
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
      }
    }
  }, []);

  const shouldFetch = !useCache || !cachedModels;

  const {
    data: fetchedModels,
    isLoading,
    error,
    refetch,
  } = useSearchModels(
    {
      sort: 'downloads',
      direction: 'desc',
      limit: 8,
    },
    { enabled: shouldFetch && open }
  );

  // Update cache when fresh data arrives
  useEffect(() => {
    if (fetchedModels && fetchedModels.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(fetchedModels));
      localStorage.setItem(
        CACHE_EXPIRY_KEY,
        (Date.now() + CACHE_DURATION).toString()
      );
      setCachedModels(fetchedModels);
    }
  }, [fetchedModels]);

  // Determine which models to display
  const displayModels = cachedModels || fetchedModels || (error ? FALLBACK_MODELS : []);

  const handleRefresh = () => {
    // Clear cache and force refetch
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
    setCachedModels(null);
    setUseCache(false);
    refetch();
  };

  const handleSelectModel = (model: HFModel) => {
    onSelectModel(model);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkle className="h-6 w-6 text-primary" weight="fill" />
              <DialogTitle>Featured Models</DialogTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <ArrowClockwise className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Top trending models by downloads • {cachedModels ? 'Cached data' : 'Live data'}
          </p>
        </DialogHeader>

        {error && !cachedModels && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">
              Unable to load latest models. Showing fallback models.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {isLoading && !cachedModels
            ? // Loading skeletons
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <div className="flex gap-2 mt-3">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </Card>
              ))
            : // Model cards
              displayModels.map((model) => {
                const modelId = model.id || model.modelId;
                const nameParts = modelId.split('/');
                const displayName = nameParts.length > 1 ? nameParts[1] : modelId;

                return (
                  <Card
                    key={modelId}
                    className="p-4 cursor-pointer hover:border-primary transition-colors"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectModel(model)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectModel(model);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-sm">{displayName}</h3>
                        <p className="text-xs text-muted-foreground">
                          by {model.author || nameParts[0] || 'Unknown'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <TrendUp className="h-3 w-3" />
                        #{displayModels.indexOf(model) + 1}
                      </Badge>
                    </div>

                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>↓ {formatNumber(model.downloads || 0)}</span>
                      <span>♥ {formatNumber(model.likes || 0)}</span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        {model.pipeline_tag || 'Unknown'}
                      </Badge>
                      {model.library_name && (
                        <Badge variant="outline" className="text-xs">
                          {model.library_name}
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
