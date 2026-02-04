import { useState, useEffect, lazy, Suspense } from 'react'
import { Code } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import { PageTransition } from '@/components/ui/page-transition'
import { Navigation } from '@/components/Navigation'
import { QuickNav } from '@/components/QuickNav'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import { StatsWidget } from '@/components/StatsWidget'
import { useFavorites } from '@/hooks/use-favorites'
import { useNavigationHistory } from '@/hooks/use-navigation-history'

// Lazy load heavy components for better initial load performance
const DatasetBrowser = lazy(() => import('@/components/DatasetBrowser').then(m => ({ default: m.DatasetBrowser })))
const ModelExplorer = lazy(() => import('@/components/ModelExplorer').then(m => ({ default: m.ModelExplorer })))
const ApiPlayground = lazy(() => import('@/components/ApiPlayground').then(m => ({ default: m.ApiPlayground })))
const LearningResources = lazy(() => import('@/components/LearningResources').then(m => ({ default: m.LearningResources })))
const FavoritesView = lazy(() => import('@/components/FavoritesView').then(m => ({ default: m.FavoritesView })))
const ModelComparison = lazy(() => import('@/components/ModelComparison').then(m => ({ default: m.ModelComparison })))
const TrendingSection = lazy(() => import('@/components/TrendingSection').then(m => ({ default: m.TrendingSection })))
const AchievementsPanel = lazy(() => import('@/components/AchievementsPanel').then(m => ({ default: m.AchievementsPanel })))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]" role="status" aria-live="polite" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Loading content, please wait...</p>
        <span className="sr-only">Loading page content</span>
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('trending')
  const { favorites = [] } = useFavorites()
  const { pushToHistory, goBack, canGoBack, getPreviousTab } = useNavigationHistory()

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const handleGoBack = () => {
    const previousTab = goBack()
    if (previousTab) {
      setActiveTab(previousTab)
    }
  }

  useEffect(() => {
    pushToHistory(activeTab)
  }, [activeTab, pushToHistory])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault()
        if (canGoBack) {
          handleGoBack()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canGoBack, handleGoBack])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
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
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50" role="banner">
          <div className="container mx-auto px-4 lg:px-6 py-4 lg:py-6">
            <div className="flex items-center justify-between gap-4 mb-4 lg:mb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Code className="text-white" size={24} weight="bold" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">HuggingFace Playground</h1>
                  <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">Explore datasets, models, and APIs</p>
                </div>
              </div>
              
              <StatsWidget />
            </div>
            
            <div className="mt-4">
              <Navigation 
                activeTab={activeTab} 
                onTabChange={handleTabChange}
                favoritesCount={favorites.length}
              />
            </div>
          </div>
        </header>

        <main id="main-content" className="container mx-auto px-4 lg:px-6 py-6 lg:py-8" role="main" aria-label="Main content">
          <div className="mb-4">
            <PageBreadcrumb 
              activeTab={activeTab} 
              onNavigate={handleTabChange}
              onGoBack={handleGoBack}
              canGoBack={canGoBack}
              previousTab={getPreviousTab()}
            />
          </div>
          
          <div className="space-y-6">
            <Suspense fallback={<PageLoader />}>
              <PageTransition transitionKey={activeTab}>
                {activeTab === 'trending' && <TrendingSection />}
                {activeTab === 'datasets' && <DatasetBrowser />}
                {activeTab === 'models' && <ModelExplorer />}
                {activeTab === 'compare' && <ModelComparison />}
                {activeTab === 'favorites' && <FavoritesView />}
                {activeTab === 'playground' && <ApiPlayground />}
                {activeTab === 'learn' && <LearningResources />}
                {activeTab === 'achievements' && <AchievementsPanel />}
              </PageTransition>
            </Suspense>
          </div>
        </main>

        <footer className="border-t border-border mt-16 py-8" role="contentinfo">
          <div className="container mx-auto px-4 lg:px-6 text-center text-sm text-muted-foreground">
            <p>Educational playground for exploring HuggingFace platform features</p>
            <p className="mt-2">Built to help you learn about datasets, models, and the Inference API</p>
          </div>
        </footer>
      </div>

      <QuickNav activeTab={activeTab} onNavigate={handleTabChange} />
      <Toaster />
    </div>
  )
}

export default App