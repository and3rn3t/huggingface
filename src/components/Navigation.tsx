import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Database, Cpu, Code, Book, Heart, ArrowsLeftRight, Fire, Trophy, List, Command } from '@phosphor-icons/react'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  favoritesCount: number
}

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  badge?: number
  group: 'discover' | 'tools' | 'personal'
}

const navItems: NavItem[] = [
  { id: 'trending', label: 'Trending', icon: Fire, group: 'discover' },
  { id: 'datasets', label: 'Datasets', icon: Database, group: 'discover' },
  { id: 'models', label: 'Models', icon: Cpu, group: 'discover' },
  { id: 'compare', label: 'Compare', icon: ArrowsLeftRight, group: 'tools' },
  { id: 'playground', label: 'Playground', icon: Code, group: 'tools' },
  { id: 'learn', label: 'Learn', icon: Book, group: 'tools' },
  { id: 'favorites', label: 'Favorites', icon: Heart, group: 'personal' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, group: 'personal' },
]

export function Navigation({ activeTab, onTabChange, favoritesCount }: NavigationProps) {
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    setMobileMenuOpen(false)
  }

  const getNavItem = (id: string) => {
    const item = navItems.find(item => item.id === id)
    if (!item) return null
    
    const Icon = item.icon
    const badge = id === 'favorites' ? favoritesCount : item.badge
    const isActive = activeTab === id

    return (
      <div key={id} className="relative">
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-all cursor-pointer group",
          isActive 
            ? "bg-accent/20 text-accent font-medium" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}>
          <Icon 
            size={20} 
            weight={isActive || (id === 'favorites' && favoritesCount > 0) ? 'fill' : 'regular'} 
            className={cn(
              "transition-transform group-hover:scale-110",
              id === 'trending' && isActive && "text-orange-400",
              id === 'favorites' && favoritesCount > 0 && !isActive && "text-red-400"
            )}
          />
          <span>{item.label}</span>
          {badge !== undefined && badge > 0 && (
            <Badge 
              variant="secondary" 
              className={cn(
                "ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center text-xs",
                id === 'favorites' && "bg-red-500/20 text-red-400 border-red-500/50"
              )}
            >
              {badge}
            </Badge>
          )}
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <List size={20} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium border-2 border-background">
                  {favoritesCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-3">Discover</h3>
                <div className="space-y-1" onClick={() => handleTabChange('trending')}>
                  {getNavItem('trending')}
                </div>
                <div className="space-y-1" onClick={() => handleTabChange('datasets')}>
                  {getNavItem('datasets')}
                </div>
                <div className="space-y-1" onClick={() => handleTabChange('models')}>
                  {getNavItem('models')}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-3">Tools</h3>
                <div className="space-y-1" onClick={() => handleTabChange('compare')}>
                  {getNavItem('compare')}
                </div>
                <div className="space-y-1" onClick={() => handleTabChange('playground')}>
                  {getNavItem('playground')}
                </div>
                <div className="space-y-1" onClick={() => handleTabChange('learn')}>
                  {getNavItem('learn')}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-3">Personal</h3>
                <div className="space-y-1" onClick={() => handleTabChange('favorites')}>
                  {getNavItem('favorites')}
                </div>
                <div className="space-y-1" onClick={() => handleTabChange('achievements')}>
                  {getNavItem('achievements')}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 pb-1">
            {navItems.filter(item => item.id === activeTab).map(item => {
              const Icon = item.icon
              return (
                <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-accent rounded-full text-sm font-medium whitespace-nowrap">
                  <Icon size={16} weight="fill" />
                  {item.label}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <div className="flex items-center gap-4 w-full">
          <TabsList className="inline-flex h-auto p-1 bg-muted/30 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <TabsTrigger value="trending" className="gap-2 data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Fire size={18} weight={activeTab === 'trending' ? 'fill' : 'regular'} />
                <span className="hidden lg:inline">Trending</span>
              </TabsTrigger>
              <TabsTrigger value="datasets" className="gap-2 data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Database size={18} />
                <span className="hidden lg:inline">Datasets</span>
              </TabsTrigger>
              <TabsTrigger value="models" className="gap-2 data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Cpu size={18} />
                <span className="hidden lg:inline">Models</span>
              </TabsTrigger>
            </div>
            
            <Separator orientation="vertical" className="mx-2 h-6" />
            
            <div className="flex items-center gap-1">
              <TabsTrigger value="compare" className="gap-2 data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <ArrowsLeftRight size={18} />
                <span className="hidden lg:inline">Compare</span>
              </TabsTrigger>
              <TabsTrigger value="playground" className="gap-2 data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Code size={18} />
                <span className="hidden lg:inline">Playground</span>
              </TabsTrigger>
              <TabsTrigger value="learn" className="gap-2 data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Book size={18} />
                <span className="hidden lg:inline">Learn</span>
              </TabsTrigger>
            </div>

            <Separator orientation="vertical" className="mx-2 h-6" />
            
            <div className="flex items-center gap-1">
              <TabsTrigger value="favorites" className="gap-2 relative data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Heart 
                  size={18} 
                  weight={favoritesCount > 0 ? 'fill' : 'regular'}
                  className={cn(favoritesCount > 0 && activeTab !== 'favorites' && "text-red-400")}
                />
                <span className="hidden lg:inline">Favorites</span>
                {favoritesCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1 h-5 min-w-5 px-1.5 bg-red-500/20 text-red-400 border-red-500/50"
                  >
                    {favoritesCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2 data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Trophy size={18} />
                <span className="hidden lg:inline">Achievements</span>
              </TabsTrigger>
            </div>
          </TabsList>

          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-2 text-muted-foreground hidden xl:flex"
            onClick={() => {}}
          >
            <Command size={14} />
            <span className="text-xs">Quick Nav</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
      </Tabs>
    </div>
  )
}
