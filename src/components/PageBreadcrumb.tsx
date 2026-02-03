import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { House } from '@phosphor-icons/react'

interface PageBreadcrumbProps {
  activeTab: string
  onNavigate?: (tab: string) => void
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

export function PageBreadcrumb({ activeTab, onNavigate }: PageBreadcrumbProps) {
  const group = tabGroups[activeTab]
  const label = tabLabels[activeTab]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            className="flex items-center gap-1 cursor-pointer hover:text-accent transition-colors" 
            onClick={() => onNavigate?.('trending')}
          >
            <House size={14} weight="fill" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {group && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-muted-foreground">
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
  )
}
