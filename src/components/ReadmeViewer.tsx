import { useCallback, useEffect, useState } from 'react';
import { marked } from 'marked';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowClockwise, FileText, Warning } from '@phosphor-icons/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getModelReadme, getDatasetReadme } from '@/services/huggingface';

interface ReadmeViewerProps {
  /** The model or dataset ID (e.g., "google/bert-base-uncased") */
  resourceId: string;
  /** Type of resource to fetch README for */
  type: 'model' | 'dataset';
  /** Maximum height for the scroll area */
  maxHeight?: string;
  /** Class name for additional styling */
  className?: string;
}

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function ReadmeViewer({
  resourceId,
  type,
  maxHeight = '400px',
  className = '',
}: ReadmeViewerProps) {
  const [readme, setReadme] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadme = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const content =
        type === 'model'
          ? await getModelReadme(resourceId)
          : await getDatasetReadme(resourceId);

      // Parse markdown to HTML
      const html = await marked.parse(content);
      setReadme(html);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load README';
      
      // Check if it's a 404 (no README available)
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setError('No README available for this resource.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [resourceId, type]);

  useEffect(() => {
    if (resourceId) {
      fetchReadme();
    }
  }, [resourceId, fetchReadme]);

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText size={16} />
          <span className="text-sm">Loading README...</span>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-muted bg-muted/50 p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Warning className="text-muted-foreground mt-0.5 shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{error}</p>
            {!error.includes('No README') && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 gap-2"
                onClick={fetchReadme}
              >
                <ArrowClockwise size={14} />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!readme) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3 text-muted-foreground">
        <FileText size={16} />
        <span className="text-sm font-medium">README</span>
      </div>
      <ScrollArea style={{ maxHeight }} className="rounded-lg border border-muted">
        <div
          className="prose prose-sm dark:prose-invert max-w-none p-4
            prose-headings:text-foreground
            prose-p:text-foreground/90
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-code:text-accent prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-muted prose-pre:border prose-pre:border-muted
            prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground
            prose-img:rounded-lg prose-img:max-w-full
            prose-table:border prose-table:border-muted
            prose-th:bg-muted prose-th:p-2 prose-th:text-left
            prose-td:p-2 prose-td:border-t prose-td:border-muted"
          dangerouslySetInnerHTML={{ __html: readme }}
        />
      </ScrollArea>
    </div>
  );
}
