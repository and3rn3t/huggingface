import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { House, ArrowLeft } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface PageBreadcrumbProps {
  activeTab: string
  onNavigate?: (tab: string) => void
  onGoBack?: () => void
  canGoBack?: boolean
  previousTab?: string | null
}

const tabLabels: Record<string, string> = {
  trending: 'Trending',
  datasets: 'Datasets',
  models: 'Models',
  compare: 'Compare Models',
  playground: 'API Playground',
  learn: 'Learning Resources',
  favorites: 'Favorites',
  achievements: 'Achievements',
}

const tabGroups: Record<string, string> = {
  trending: 'Discover',
  datasets: 'Discover',
  models: 'Discover',
  compare: 'Tools',
  playground: 'Tools',
  learn: 'Tools',
  favorites: 'Personal',
  achievements: 'Personal',
}

const groupDefaultTabs: Record<string, string> = {
  'Discover': 'trending',
  'Tools': 'playground',
  'Personal': 'favorites',
}

const groupDescriptions: Record<string, string> = {
  'Discover': 'Explore trending models and datasets',
  'Tools': 'Interactive tools and learning resources',
  'Personal': 'Your saved items and achievements',
}

export function PageBreadcrumb({ activeTab, onNavigate, onGoBack, canGoBack, previousTab }: PageBreadcrumbProps) {
  const group = tabGroups[activeTab]
  const label = tabLabels[activeTab]
  const previousLabel = previousTab ? tabLabels[previousTab] : null
  const groupDefaultTab = group ? groupDefaultTabs[group] : null
  const isOnGroupDefault = groupDefaultTab === activeTab

  const handleGroupClick = () => {
    if (group && groupDefaultTab && onNavigate && !isOnGroupDefault) {
      onNavigate(groupDefaultTab)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {canGoBack && onGoBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoBack}
          className={cn(
            "gap-2 text-muted-foreground hover:text-foreground transition-all",
            "hover:bg-accent/10 hover:scale-105"
          )}
          title={previousLabel ? `Back to ${previousLabel}` : 'Go back'}
        >
          <ArrowLeft size={16} weight="bold" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      )}
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              className="flex items-center gap-1 cursor-pointer hover:text-accent transition-colors" 
              onClick={() => onNavigate?.('trending')}
              title="Go to Home"
            >
              <House size={14} weight="fill" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {group && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  className={cn(
                    "transition-colors",
                    isOnGroupDefault 
                      ? "text-muted-foreground cursor-default" 
                      : "cursor-pointer hover:text-accent"
                  )}
                  onClick={handleGroupClick}
                  title={isOnGroupDefault ? groupDescriptions[group] : `Jump to ${group}`}
                >
                  {group}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground font-medium">
              {label}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
