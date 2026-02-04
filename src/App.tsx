import { Navigation } from '@/components/Navigation';
import { PageBreadcrumb } from '@/components/PageBreadcrumb';
import { QuickNav } from '@/components/QuickNav';
import { StatsWidget } from '@/components/StatsWidget';
import { PageTransition } from '@/components/ui/page-transition';
import { Toaster } from '@/components/ui/sonner';
import { useFavorites } from '@/hooks/use-favorites';
import { useNavigationHistory } from '@/hooks/use-navigation-history';
import { Code } from '@phosphor-icons/react';
import { lazy, Suspense, useEffect, useState } from 'react';

// Lazy load with retry on failure (handles stale chunks after deployment)
const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      return await componentImport();
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assuming that the error is caused by a stale chunk, refresh the page once
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
      }
      throw error;
    }
  });

// Lazy load heavy components for better initial load performance
const DatasetBrowser = lazyWithRetry(() =>
  import('@/components/DatasetBrowser').then((m) => ({ default: m.DatasetBrowser }))
);
const ModelExplorer = lazyWithRetry(() =>
  import('@/components/ModelExplorer').then((m) => ({ default: m.ModelExplorer }))
);
const ApiPlayground = lazyWithRetry(() =>
  import('@/components/ApiPlayground').then((m) => ({ default: m.ApiPlayground }))
);
const LearningResources = lazyWithRetry(() =>
  import('@/components/LearningResources').then((m) => ({ default: m.LearningResources }))
);
const FavoritesView = lazyWithRetry(() =>
  import('@/components/FavoritesView').then((m) => ({ default: m.FavoritesView }))
);
const ModelComparison = lazyWithRetry(() =>
  import('@/components/ModelComparison').then((m) => ({ default: m.ModelComparison }))
);
const TrendingSection = lazyWithRetry(() =>
  import('@/components/TrendingSection').then((m) => ({ default: m.TrendingSection }))
);
const AchievementsPanel = lazyWithRetry(() =>
  import('@/components/AchievementsPanel').then((m) => ({ default: m.AchievementsPanel }))
);

// Loading fallback component
function PageLoader() {
  return (
    <div
      className="flex min-h-[400px] items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          aria-hidden="true"
        />
        <p className="text-muted-foreground text-sm">Loading content, please wait...</p>
        <span className="sr-only">Loading page content</span>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('trending');
  const { favorites = [] } = useFavorites();
  const { pushToHistory, goBack, canGoBack, getPreviousTab } = useNavigationHistory();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleGoBack = () => {
    const previousTab = goBack();
    if (previousTab) {
      setActiveTab(previousTab);
    }
  };

  useEffect(() => {
    pushToHistory(activeTab);
  }, [activeTab, pushToHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault();
        if (canGoBack) {
          handleGoBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack, handleGoBack]);

  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            radial-gradient(circle at 20% 50%, oklch(0.75 0.15 195) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, oklch(0.35 0.15 285) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, oklch(0.75 0.15 195) 0%, transparent 30%)
          `,
          }}
        ></div>
        <div
          className="absolute inset-0"
          style={{
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
            backgroundSize: '80px 80px',
          }}
        ></div>
      </div>

      <div className="relative">
        <header
          className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm"
          role="banner"
        >
          <div className="container mx-auto px-4 py-4 lg:px-6 lg:py-6">
            <div className="mb-4 flex items-center justify-between gap-4 lg:mb-0">
              <div className="flex items-center gap-3">
                <div className="from-primary to-accent flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br">
                  <Code className="text-white" size={24} weight="bold" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                    HuggingFace Playground
                  </h1>
                  <p className="text-muted-foreground hidden text-xs sm:block lg:text-sm">
                    Explore datasets, models, and APIs
                  </p>
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

        <main
          id="main-content"
          className="container mx-auto px-4 py-6 lg:px-6 lg:py-8"
          role="main"
          aria-label="Main content"
        >
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

        <footer className="border-border mt-16 border-t py-8" role="contentinfo">
          <div className="text-muted-foreground container mx-auto px-4 text-center text-sm lg:px-6">
            <p>Educational playground for exploring HuggingFace platform features</p>
            <p className="mt-2">
              Built to help you learn about datasets, models, and the Inference API
            </p>
          </div>
        </footer>
      </div>

      <QuickNav activeTab={activeTab} onNavigate={handleTabChange} />
      <Toaster />
    </div>
  );
}

export default App;
