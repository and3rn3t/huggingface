import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAchievements } from '@/hooks/use-achievements';
import { useFavorites } from '@/hooks/use-favorites';
import { getDataset, getModel } from '@/services/huggingface';
import { Cpu, Database, Heart, Note, NotePencil, Trash } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function FavoritesView() {
  const { favorites = [], removeFavorite, updateNote, getNote } = useFavorites();
  const { trackFavorite } = useAchievements();
  const [editingNote, setEditingNote] = useState<{
    id: string;
    type: 'dataset' | 'model';
    name: string;
  } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [enrichedData, setEnrichedData] = useState<
    Record<
      string,
      { downloads?: number; likes?: number; task?: string; loading: boolean; error?: string }
    >
  >({});

  useEffect(() => {
    trackFavorite(favorites.length);
  }, [favorites.length, trackFavorite]);

  useEffect(() => {
    const fetchEnrichedData = async () => {
      const newData: Record<
        string,
        { downloads?: number; likes?: number; task?: string; loading: boolean; error?: string }
      > = {};

      // Initialize loading state for all items
      favorites.forEach((fav) => {
        newData[`${fav.type}:${fav.id}`] = { loading: true };
      });
      setEnrichedData(newData);

      // Fetch data for each favorite
      await Promise.all(
        favorites.map(async (fav) => {
          const key = `${fav.type}:${fav.id}`;
          try {
            if (fav.type === 'model') {
              const model = await getModel(fav.id);
              setEnrichedData((prev) => ({
                ...prev,
                [key]: {
                  downloads: model.downloads,
                  likes: model.likes,
                  task: model.pipeline_tag,
                  loading: false,
                },
              }));
            } else {
              const dataset = await getDataset(fav.id);
              setEnrichedData((prev) => ({
                ...prev,
                [key]: {
                  downloads: dataset.downloads,
                  likes: dataset.likes,
                  loading: false,
                },
              }));
            }
          } catch {
            setEnrichedData((prev) => ({
              ...prev,
              [key]: { loading: false, error: 'Failed to load' },
            }));
          }
        })
      );
    };

    if (favorites.length > 0) {
      fetchEnrichedData();
    }
  }, [favorites]);

  const datasetFavorites = favorites.filter((fav) => fav.type === 'dataset');
  const modelFavorites = favorites.filter((fav) => fav.type === 'model');

  const handleRemove = (id: string, type: 'dataset' | 'model', name: string) => {
    removeFavorite(id, type);
    toast.success(`Removed ${name} from favorites`);
  };

  const openNoteDialog = (id: string, type: 'dataset' | 'model', name: string) => {
    setEditingNote({ id, type, name });
    setNoteText(getNote(id, type));
  };

  const saveNote = () => {
    if (editingNote) {
      updateNote(editingNote.id, editingNote.type, noteText);
      toast.success('Note saved');
      setEditingNote(null);
      setNoteText('');
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-semibold tracking-tight">All Favorites</h2>
          <p className="text-muted-foreground">Your saved datasets and models in one place</p>
        </div>

        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Start exploring datasets and models, then click the heart icon to save your favorites here for quick access"
          iconColor="text-red-400"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight">All Favorites</h2>
        <p className="text-muted-foreground">
          {favorites.length} saved item{favorites.length !== 1 ? 's' : ''} •{' '}
          {datasetFavorites.length} dataset{datasetFavorites.length !== 1 ? 's' : ''} •{' '}
          {modelFavorites.length} model{modelFavorites.length !== 1 ? 's' : ''}
        </p>
      </div>

      {datasetFavorites.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Database className="text-accent" size={24} />
            <h3 className="text-lg font-semibold">Favorite Datasets ({datasetFavorites.length})</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {datasetFavorites.map((fav) => (
              <Card
                key={fav.id}
                className="border-border hover:border-accent/50 group relative p-4 transition-colors"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => openNoteDialog(fav.id, fav.type, fav.name)}
                  >
                    <NotePencil size={16} className="text-accent" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleRemove(fav.id, fav.type, fav.name)}
                  >
                    <Trash size={16} className="text-destructive" />
                  </Button>
                </div>

                <div className="flex items-start gap-3 pr-16">
                  <Database className="text-accent shrink-0" size={24} />
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-1 truncate text-base font-medium">{fav.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {fav.id}
                    </Badge>
                    {fav.note && (
                      <div className="bg-muted/50 border-accent/20 mt-2 rounded border p-2">
                        <div className="mb-1 flex items-center gap-1">
                          <Note size={12} className="text-accent" />
                          <span className="text-accent text-xs font-medium">Note</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-xs">{fav.note}</p>
                      </div>
                    )}
                    {/* Enriched data */}
                    {(() => {
                      const data = enrichedData[`${fav.type}:${fav.id}`];
                      if (!data) return null;
                      if (data.loading) {
                        return (
                          <div className="mt-2 space-y-1">
                            <Skeleton className="h-3 w-20" />
                          </div>
                        );
                      }
                      if (data.error) return null;
                      return (
                        <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                          {data.downloads !== undefined && (
                            <span>⬇️ {formatNumber(data.downloads)}</span>
                          )}
                          {data.likes !== undefined && <span>❤️ {data.likes}</span>}
                          {data.task && (
                            <Badge variant="secondary" className="text-xs">
                              {data.task}
                            </Badge>
                          )}
                        </div>
                      );
                    })()}
                    <p className="text-muted-foreground mt-2 text-xs">
                      Added {new Date(fav.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {modelFavorites.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-accent" size={24} />
            <h3 className="text-lg font-semibold">Favorite Models ({modelFavorites.length})</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modelFavorites.map((fav) => (
              <Card
                key={fav.id}
                className="border-border hover:border-accent/50 group relative p-4 transition-colors"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => openNoteDialog(fav.id, fav.type, fav.name)}
                  >
                    <NotePencil size={16} className="text-accent" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleRemove(fav.id, fav.type, fav.name)}
                  >
                    <Trash size={16} className="text-destructive" />
                  </Button>
                </div>

                <div className="flex items-start gap-3 pr-16">
                  <Cpu className="text-accent shrink-0" size={24} />
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-1 truncate text-base font-medium">{fav.name}</h4>
                    <Badge variant="outline" className="max-w-full truncate text-xs">
                      {fav.id}
                    </Badge>
                    {fav.note && (
                      <div className="bg-muted/50 border-accent/20 mt-2 rounded border p-2">
                        <div className="mb-1 flex items-center gap-1">
                          <Note size={12} className="text-accent" />
                          <span className="text-accent text-xs font-medium">Note</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-xs">{fav.note}</p>
                      </div>
                    )}
                    {/* Enriched data */}
                    {(() => {
                      const data = enrichedData[`${fav.type}:${fav.id}`];
                      if (!data) return null;
                      if (data.loading) {
                        return (
                          <div className="mt-2 space-y-1">
                            <Skeleton className="h-3 w-20" />
                          </div>
                        );
                      }
                      if (data.error) return null;
                      return (
                        <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                          {data.downloads !== undefined && (
                            <span>⬇️ {formatNumber(data.downloads)}</span>
                          )}
                          {data.likes !== undefined && <span>❤️ {data.likes}</span>}
                          {data.task && (
                            <Badge variant="secondary" className="text-xs">
                              {data.task}
                            </Badge>
                          )}
                        </div>
                      );
                    })()}
                    <p className="text-muted-foreground mt-2 text-xs">
                      Added {new Date(fav.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <NotePencil className="text-accent" size={24} />
              Add Note to {editingNote?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Your Note</label>
              <Textarea
                placeholder="Add your thoughts, use cases, or reminders about this item..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Keep track of why you saved this or how you plan to use it
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              Cancel
            </Button>
            <Button onClick={saveNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
