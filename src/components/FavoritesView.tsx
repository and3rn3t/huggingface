import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Heart, Database, Cpu, Trash, Note, NotePencil } from '@phosphor-icons/react'
import { useFavorites } from '@/hooks/use-favorites'
import { useAchievements } from '@/hooks/use-achievements'
import { toast } from 'sonner'

export function FavoritesView() {
  const { favorites = [], removeFavorite, updateNote, getNote } = useFavorites()
  const { trackFavorite } = useAchievements()
  const [editingNote, setEditingNote] = useState<{ id: string; type: 'dataset' | 'model'; name: string } | null>(null)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    trackFavorite(favorites.length)
  }, [favorites.length, trackFavorite])

  const datasetFavorites = favorites.filter(fav => fav.type === 'dataset')
  const modelFavorites = favorites.filter(fav => fav.type === 'model')

  const handleRemove = (id: string, type: 'dataset' | 'model', name: string) => {
    removeFavorite(id, type)
    toast.success(`Removed ${name} from favorites`)
  }

  const openNoteDialog = (id: string, type: 'dataset' | 'model', name: string) => {
    setEditingNote({ id, type, name })
    setNoteText(getNote(id, type))
  }

  const saveNote = () => {
    if (editingNote) {
      updateNote(editingNote.id, editingNote.type, noteText)
      toast.success('Note saved')
      setEditingNote(null)
      setNoteText('')
    }
  }

  if (favorites.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2 tracking-tight">All Favorites</h2>
          <p className="text-muted-foreground">Your saved datasets and models in one place</p>
        </div>

        <div className="text-center py-16">
          <Heart className="mx-auto mb-4 text-muted-foreground" size={64} />
          <h3 className="text-xl font-medium mb-2">No favorites yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start exploring datasets and models, then click the heart icon to save your favorites here for quick access
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight">All Favorites</h2>
        <p className="text-muted-foreground">
          {favorites.length} saved item{favorites.length !== 1 ? 's' : ''} • {datasetFavorites.length} dataset{datasetFavorites.length !== 1 ? 's' : ''} • {modelFavorites.length} model{modelFavorites.length !== 1 ? 's' : ''}
        </p>
      </div>

      {datasetFavorites.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Database className="text-accent" size={24} />
            <h3 className="text-lg font-semibold">Favorite Datasets ({datasetFavorites.length})</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasetFavorites.map((fav) => (
              <Card
                key={fav.id}
                className="p-4 border-border hover:border-accent/50 transition-colors relative group"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <Database className="text-accent flex-shrink-0" size={24} />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-base mb-1 truncate">{fav.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {fav.id}
                    </Badge>
                    {fav.note && (
                      <div className="mt-2 p-2 bg-muted/50 rounded border border-accent/20">
                        <div className="flex items-center gap-1 mb-1">
                          <Note size={12} className="text-accent" />
                          <span className="text-xs font-medium text-accent">Note</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{fav.note}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelFavorites.map((fav) => (
              <Card
                key={fav.id}
                className="p-4 border-border hover:border-accent/50 transition-colors relative group"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <Cpu className="text-accent flex-shrink-0" size={24} />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-base mb-1 truncate">{fav.name}</h4>
                    <Badge variant="outline" className="text-xs truncate max-w-full">
                      {fav.id}
                    </Badge>
                    {fav.note && (
                      <div className="mt-2 p-2 bg-muted/50 rounded border border-accent/20">
                        <div className="flex items-center gap-1 mb-1">
                          <Note size={12} className="text-accent" />
                          <span className="text-xs font-medium text-accent">Note</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{fav.note}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
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
              <label className="text-sm font-medium mb-2 block">Your Note</label>
              <Textarea
                placeholder="Add your thoughts, use cases, or reminders about this item..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Keep track of why you saved this or how you plan to use it
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              Cancel
            </Button>
            <Button onClick={saveNote}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
