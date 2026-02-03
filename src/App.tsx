import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Database, Cpu, Code, Book, Heart, ArrowsLeftRight, Fire, Trophy } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import { DatasetBrowser } from '@/components/DatasetBrowser'
import { ModelExplorer } from '@/components/ModelExplorer'
import { ApiPlayground } from '@/components/ApiPlayground'
import { LearningResources } from '@/components/LearningResources'
import { FavoritesView } from '@/components/FavoritesView'
import { ModelComparison } from '@/components/ModelComparison'
import { TrendingSection } from '@/components/TrendingSection'
import { AchievementsPanel } from '@/components/AchievementsPanel'
import { StatsWidget } from '@/components/StatsWidget'
import { useFavorites } from '@/hooks/use-favorites'

function App() {
  const [activeTab, setActiveTab] = useState('trending')
  const { favorites = [] } = useFavorites()

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, oklch(0.75 0.15 195) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, oklch(0.35 0.15 285) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, oklch(0.75 0.15 195) 0%, transparent 30%)
          `
        }}></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            oklch(0.35 0.15 285) 2px,
            oklch(0.35 0.15 285) 3px
          ), repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            oklch(0.35 0.15 285) 2px,
            oklch(0.35 0.15 285) 3px
          )`,
          backgroundSize: '80px 80px'
        }}></div>
      </div>

      <div className="relative">
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Code className="text-white" size={24} weight="bold" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">HuggingFace Playground</h1>
                  <p className="text-sm text-muted-foreground">Explore datasets, models, and APIs</p>
                </div>
              </div>
              
              <StatsWidget />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-6xl mx-auto grid-cols-8 bg-muted/50">
              <TabsTrigger value="trending" className="gap-2">
                <Fire size={18} />
                <span className="hidden sm:inline">Trending</span>
              </TabsTrigger>
              <TabsTrigger value="datasets" className="gap-2">
                <Database size={18} />
                <span className="hidden sm:inline">Datasets</span>
              </TabsTrigger>
              <TabsTrigger value="models" className="gap-2">
                <Cpu size={18} />
                <span className="hidden sm:inline">Models</span>
              </TabsTrigger>
              <TabsTrigger value="compare" className="gap-2">
                <ArrowsLeftRight size={18} />
                <span className="hidden sm:inline">Compare</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2 relative">
                <Heart size={18} weight={favorites.length > 0 ? 'fill' : 'regular'} />
                <span className="hidden sm:inline">Favorites</span>
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {favorites.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="playground" className="gap-2">
                <Code size={18} />
                <span className="hidden sm:inline">Playground</span>
              </TabsTrigger>
              <TabsTrigger value="learn" className="gap-2">
                <Book size={18} />
                <span className="hidden sm:inline">Learn</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2">
                <Trophy size={18} />
                <span className="hidden sm:inline">Achievements</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-6">
              <TrendingSection />
            </TabsContent>

            <TabsContent value="datasets" className="space-y-6">
              <DatasetBrowser />
            </TabsContent>

            <TabsContent value="models" className="space-y-6">
              <ModelExplorer />
            </TabsContent>

            <TabsContent value="compare" className="space-y-6">
              <ModelComparison />
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              <FavoritesView />
            </TabsContent>

            <TabsContent value="playground" className="space-y-6">
              <ApiPlayground />
            </TabsContent>

            <TabsContent value="learn" className="space-y-6">
              <LearningResources />
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <AchievementsPanel />
            </TabsContent>
          </Tabs>
        </main>

        <footer className="border-t border-border mt-16 py-8">
          <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
            <p>Educational playground for exploring HuggingFace platform features</p>
            <p className="mt-2">Built to help you learn about datasets, models, and the Inference API</p>
          </div>
        </footer>
      </div>

      <Toaster />
    </div>
  )
}

export default App