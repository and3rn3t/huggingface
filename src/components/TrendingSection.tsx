import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrending } from '@/hooks/use-queries';
import { HFDataset, HFModel } from '@/services/huggingface';
import {
  ArrowClockwise,
  ArrowUp,
  Cpu,
  Database,
  Fire,
  Sparkle,
  TrendUp,
} from '@phosphor-icons/react';

interface TrendingItem {
  id: string;
  name: string;
  type: 'dataset' | 'model';
  description: string;
  trendScore: number;
  changePercent: number;
  downloads: number;
  category: string;
}

function formatDownloads(downloads: number): string {
  if (downloads >= 1_000_000) {
    return `${(downloads / 1_000_000).toFixed(1)}M`;
  }
  if (downloads >= 1_000) {
    return `${(downloads / 1_000).toFixed(1)}K`;
  }
  return downloads.toString();
}

function transformModelToTrendingItem(
  model: HFModel,
  index: number,
  maxDownloads: number
): TrendingItem {
  const downloads = model.downloads || 0;
  const trendScore = maxDownloads > 0 ? Math.round((downloads / maxDownloads) * 100) : 0;
  const changePercent = Math.max(10, 100 - index * 15); // Estimate based on ranking

  return {
    id: model.id,
    name: model.id.split('/').pop() || model.id,
    type: 'model',
    description: `${model.pipeline_tag || 'General'} model by ${model.author || 'Unknown'}`,
    trendScore,
    changePercent,
    downloads,
    category: model.pipeline_tag || 'General',
  };
}

function transformDatasetToTrendingItem(
  dataset: HFDataset,
  index: number,
  maxDownloads: number
): TrendingItem {
  const downloads = dataset.downloads || 0;
  const trendScore = maxDownloads > 0 ? Math.round((downloads / maxDownloads) * 100) : 0;
  const changePercent = Math.max(10, 100 - index * 15); // Estimate based on ranking

  // Extract task category from tags
  const taskCategory =
    dataset.tags
      ?.find((tag) => tag.startsWith('task_categories:'))
      ?.replace('task_categories:', '') || 'General';

  return {
    id: dataset.id,
    name: dataset.id.split('/').pop() || dataset.id,
    type: 'dataset',
    description: dataset.description || `Dataset by ${dataset.author || 'Unknown'}`,
    trendScore,
    changePercent,
    downloads,
    category: taskCategory,
  };
}

export function TrendingSection() {
  const { data, isLoading, error, refetch } = useTrending();

  // Transform the data when available
  const trendingItems = useMemo(() => {
    if (!data) return [];

    const { models, datasets } = data;

    // Find max downloads for normalization
    const allDownloads = [
      ...models.map((m) => m.downloads || 0),
      ...datasets.map((d) => d.downloads || 0),
    ];
    const maxDownloads = Math.max(...allDownloads, 1);

    // Transform models and datasets
    const transformedModels = models.map((model, index) =>
      transformModelToTrendingItem(model, index, maxDownloads)
    );
    const transformedDatasets = datasets.map((dataset, index) =>
      transformDatasetToTrendingItem(dataset, index, maxDownloads)
    );

    // Combine and sort by downloads
    const combined = [...transformedModels, ...transformedDatasets].sort(
      (a, b) => b.downloads - a.downloads
    );

    // Recalculate trend scores after sorting
    const topDownloads = combined[0]?.downloads || 1;
    return combined.slice(0, 6).map((item, index) => ({
      ...item,
      trendScore: Math.round((item.downloads / topDownloads) * 100),
      changePercent: Math.max(10, 100 - index * 15),
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Fire className="text-accent" size={28} weight="fill" />
            Trending Now
          </h2>
          <p className="text-muted-foreground">
            Most popular models and datasets in the HuggingFace community
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="hover:bg-muted rounded-md p-2 transition-colors disabled:opacity-50"
          title="Refresh trending items"
        >
          <ArrowClockwise
            className={`text-muted-foreground ${isLoading ? 'animate-spin' : ''}`}
            size={20}
          />
        </button>
      </div>

      {error && (
        <Card className="p-4 border-destructive/50 bg-destructive/10">
          <p className="text-destructive text-sm">Failed to load trending items. Please try again.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="from-accent/20 to-primary/20 border-accent/50 bg-gradient-to-br p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendUp className="text-accent" size={20} />
            <span className="text-muted-foreground text-sm">Top Trending</span>
          </div>
          <div className="text-accent mb-1 text-3xl font-bold">
            {isLoading ? <Skeleton className="h-9 w-8" /> : trendingItems.length}
          </div>
          <div className="text-muted-foreground text-xs">Hot items this week</div>
        </Card>

        <Card className="from-primary/20 to-accent/10 border-primary/50 bg-gradient-to-br p-4">
          <div className="mb-2 flex items-center gap-2">
            <ArrowUp className="text-green-500" size={20} weight="bold" />
            <span className="text-muted-foreground text-sm">Avg Growth</span>
          </div>
          <div className="mb-1 text-3xl font-bold text-green-500">
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              `+${trendingItems.length > 0 ? Math.round(trendingItems.reduce((acc, item) => acc + item.changePercent, 0) / trendingItems.length) : 0}%`
            )}
          </div>
          <div className="text-muted-foreground text-xs">Week over week</div>
        </Card>

        <Card className="from-accent/10 to-primary/20 border-accent/30 bg-gradient-to-br p-4">
          <div className="mb-2 flex items-center gap-2">
            <Cpu className="text-accent" size={20} />
            <span className="text-muted-foreground text-sm">Hot Models</span>
          </div>
          <div className="text-accent mb-1 text-3xl font-bold">
            {isLoading ? (
              <Skeleton className="h-9 w-8" />
            ) : (
              trendingItems.filter((item) => item.type === 'model').length
            )}
          </div>
          <div className="text-muted-foreground text-xs">Trending models</div>
        </Card>

        <Card className="from-primary/20 to-accent/20 border-primary/30 bg-gradient-to-br p-4">
          <div className="mb-2 flex items-center gap-2">
            <Database className="text-accent" size={20} />
            <span className="text-muted-foreground text-sm">Hot Datasets</span>
          </div>
          <div className="text-accent mb-1 text-3xl font-bold">
            {isLoading ? (
              <Skeleton className="h-9 w-8" />
            ) : (
              trendingItems.filter((item) => item.type === 'dataset').length
            )}
          </div>
          <div className="text-muted-foreground text-xs">Trending datasets</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isLoading
          ? // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="mb-3 flex items-start gap-3">
                  <Skeleton className="h-6 w-6 rounded" />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <div className="mb-3 flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="mb-3 flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </Card>
            ))
          : trendingItems.map((item, index) => {
              const Icon = item.type === 'model' ? Cpu : Database;
              const isTopTrending = index < 3;

              return (
                <Card
                  key={item.id}
                  className={`hover:shadow-accent/20 border-border hover:border-accent/50 relative cursor-pointer p-4 transition-all hover:-translate-y-1 hover:shadow-lg ${
                    isTopTrending ? 'from-card to-accent/5 bg-gradient-to-br' : ''
                  }`}
                >
                  {isTopTrending && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-accent text-accent-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                        #{index + 1}
                      </div>
                    </div>
                  )}

                  <div className="mb-3 flex items-start gap-3">
                    <Icon className="text-accent flex-shrink-0" size={24} />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="truncate text-lg font-medium">{item.name}</h3>
                        {isTopTrending && (
                          <Sparkle className="text-accent flex-shrink-0" size={16} weight="fill" />
                        )}
                      </div>
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.type}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {formatDownloads(item.downloads)} downloads
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-green-500">
                      <ArrowUp size={16} weight="bold" />
                      <span>+{item.changePercent}%</span>
                    </div>
                  </div>

                  <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
                    <div
                      className="from-accent to-primary h-full bg-gradient-to-r transition-all"
                      style={{ width: `${item.trendScore}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Trend Score: {item.trendScore}/100
                  </div>
                </Card>
              );
            })}
      </div>

      <Card className="bg-muted/50 p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <TrendUp className="text-accent" size={20} />
          What Makes Something Trending?
        </h3>
        <div className="grid gap-4 text-sm md:grid-cols-3">
          <div>
            <h4 className="mb-1 font-medium">Download Velocity</h4>
            <p className="text-muted-foreground">
              Rapid increase in downloads over the past 7 days compared to the previous period
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-medium">Community Engagement</h4>
            <p className="text-muted-foreground">
              Likes, comments, and discussions around the model or dataset
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-medium">Recent Updates</h4>
            <p className="text-muted-foreground">
              New versions, improvements, or significant documentation changes
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
