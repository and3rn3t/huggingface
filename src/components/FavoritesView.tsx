import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Database, Cpu, Trash } from '@phosphor-icons/react'
import { useFavorites } from '@/hooks/use-favorites'
import { toast } from 'sonner'

export function FavoritesView() {
  const { favorites = [], removeFavorite } = useFavorites()

  const datasetFavorites = favorites.filter(fav => fav.type === 'dataset')
  const modelFavorites = favorites.filter(fav => fav.type === 'model')

  const handleRemove = (id: string, type: 'dataset' | 'model', name: string) => {
    removeFavorite(id, type)
    toast.success(`Removed ${name} from favorites`)
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
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(fav.id, fav.type, fav.name)}
                >
                  <Trash size={16} className="text-destructive" />
                </Button>

                <div className="flex items-start gap-3 pr-8">
                  <Database className="text-accent flex-shrink-0" size={24} />
                  <div className="min-w-0">
                    <h4 className="font-medium text-base mb-1 truncate">{fav.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {fav.id}
                    </Badge>
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
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(fav.id, fav.type, fav.name)}
                >
                  <Trash size={16} className="text-destructive" />
                </Button>

                <div className="flex items-start gap-3 pr-8">
                  <Cpu className="text-accent flex-shrink-0" size={24} />
                  <div className="min-w-0">
                    <h4 className="font-medium text-base mb-1 truncate">{fav.name}</h4>
                    <Badge variant="outline" className="text-xs truncate max-w-full">
                      {fav.id}
                    </Badge>
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
    </div>
  )
}
