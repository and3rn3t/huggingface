import { ThemeToggle } from '@/components/layout/theme-toggle';
import { TokenSettings } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  ArrowsLeftRight,
  Book,
  Code,
  Command,
  Cpu,
  Database,
  Fire,
  Gear,
  Heart,
  List,
  Trophy,
} from '@phosphor-icons/react';
import { memo, useState } from 'react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  favoritesCount: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  group: 'discover' | 'tools' | 'personal';
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
];

function NavigationComponent({ activeTab, onTabChange, favoritesCount }: NavigationProps) {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const getNavItem = (id: string) => {
    const item = navItems.find((item) => item.id === id);
    if (!item) return null;

    const Icon = item.icon;
    const badge = id === 'favorites' ? favoritesCount : item.badge;
    const isActive = activeTab === id;

    return (
      <div key={id} className="relative">
        <div
          className={cn(
            'group flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-all',
            isActive
              ? 'bg-accent/20 text-accent font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Icon
            size={20}
            weight={isActive || (id === 'favorites' && favoritesCount > 0) ? 'fill' : 'regular'}
            className={cn(
              'transition-transform group-hover:scale-110',
              id === 'trending' && isActive && 'text-orange-400',
              id === 'favorites' && favoritesCount > 0 && !isActive && 'text-red-400'
            )}
          />
          <span>{item.label}</span>
          {badge !== undefined && badge > 0 && (
            <Badge
              variant="secondary"
              className={cn(
                'ml-auto flex h-5 min-w-5 items-center justify-center px-1.5 text-xs',
                id === 'favorites' && 'border-red-500/50 bg-red-500/20 text-red-400'
              )}
            >
              {badge}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative"
              aria-label={`Open navigation menu${favoritesCount > 0 ? `, ${favoritesCount} favorites` : ''}`}
            >
              <List size={20} aria-hidden="true" />
              {favoritesCount > 0 && (
                <span
                  className="border-background absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-red-500 text-xs font-medium text-white"
                  aria-hidden="true"
                >
                  {favoritesCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>

            <nav className="mt-6 space-y-6" role="navigation" aria-label="Main navigation">
              <div role="group" aria-labelledby="nav-discover-heading">
                <h3
                  id="nav-discover-heading"
                  className="text-muted-foreground mb-3 px-3 text-sm font-medium"
                >
                  Discover
                </h3>
                <div
                  className="space-y-1"
                  onClick={() => handleTabChange('trending')}
                  onKeyDown={(e) => e.key === 'Enter' && handleTabChange('trending')}
                  tabIndex={0}
                  role="button"
                >
                  {getNavItem('trending')}
                </div>
                <div
                  className="space-y-1"
                  onClick={() => handleTabChange('datasets')}
                  onKeyDown={(e) => e.key === 'Enter' && handleTabChange('datasets')}
                  tabIndex={0}
                  role="button"
                >
                  {getNavItem('datasets')}
                </div>
                <div
                  className="space-y-1"
                  onClick={() => handleTabChange('models')}
                  onKeyDown={(e) => e.key === 'Enter' && handleTabChange('models')}
                  tabIndex={0}
                  role="button"
                >
                  {getNavItem('models')}
                </div>
              </div>

              <Separator />

              <div role="group" aria-labelledby="nav-tools-heading">
                <h3
                  id="nav-tools-heading"
                  className="text-muted-foreground mb-3 px-3 text-sm font-medium"
                >
                  Tools
                </h3>
                <div
                  className="space-y-1"
                  onClick={() => handleTabChange('compare')}
                  onKeyDown={(e) => e.key === 'Enter' && handleTabChange('compare')}
                  tabIndex={0}
                  role="button"
                >
                  {getNavItem('compare')}
                </div>
                <div
                  className="space-y-1"
                  onClick={() => handleTabChange('playground')}
                  onKeyDown={(e) => e.key === 'Enter' && handleTabChange('playground')}
                  tabIndex={0}
                  role="button"
                >
                  {getNavItem('playground')}
                </div>
                <div
                  className="space-y-1"
                  onClick={() => handleTabChange('learn')}
                  onKeyDown={(e) => e.key === 'Enter' && handleTabChange('learn')}
                  tabIndex={0}
                  role="button"
                >
                  {getNavItem('learn')}
                </div>
              </div>

              <Separator />

              <div role="group" aria-labelledby="nav-personal-heading">
                <h3
                  id="nav-personal-heading"
                  className="text-muted-foreground mb-3 px-3 text-sm font-medium"
                >
                  Personal
                </h3>
                <div
                  className="space-y-1"
                  onClick={() => handleTabChange('favorites')}
                  onKeyDown={(e) => e.key === 'Enter' && handleTabChange('favorites')}
                  tabIndex={0}
                  role="button"
                >
                  {getNavItem('favorites')}
                </div>
                <div
                  className="space-y-1"
                  onClick={() => handleTabChange('achievements')}
                  onKeyDown={(e) => e.key === 'Enter' && handleTabChange('achievements')}
                  tabIndex={0}
                  role="button"
                >
                  {getNavItem('achievements')}
                </div>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="scrollbar-hide flex-1 overflow-x-auto">
          <div className="flex items-center gap-2 pb-1">
            {navItems
              .filter((item) => item.id === activeTab)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="bg-accent/20 text-accent flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap"
                  >
                    <Icon size={16} weight="fill" />
                    {item.label}
                  </div>
                );
              })}
          </div>
        </div>

        <ThemeToggle />
        <TokenSettings
          trigger={
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="API Settings">
              <Gear size={18} />
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={onTabChange} aria-label="Main navigation">
        <div className="flex w-full items-center gap-4">
          <TabsList className="bg-muted/30 inline-flex h-auto p-1 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <TabsTrigger
                value="trending"
                className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent gap-2"
              >
                <Fire size={18} weight={activeTab === 'trending' ? 'fill' : 'regular'} />
                <span className="hidden lg:inline">Trending</span>
              </TabsTrigger>
              <TabsTrigger
                value="datasets"
                className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent gap-2"
              >
                <Database size={18} />
                <span className="hidden lg:inline">Datasets</span>
              </TabsTrigger>
              <TabsTrigger
                value="models"
                className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent gap-2"
              >
                <Cpu size={18} />
                <span className="hidden lg:inline">Models</span>
              </TabsTrigger>
            </div>

            <Separator orientation="vertical" className="mx-2 h-6" />

            <div className="flex items-center gap-1">
              <TabsTrigger
                value="compare"
                className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent gap-2"
              >
                <ArrowsLeftRight size={18} />
                <span className="hidden lg:inline">Compare</span>
              </TabsTrigger>
              <TabsTrigger
                value="playground"
                className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent gap-2"
              >
                <Code size={18} />
                <span className="hidden lg:inline">Playground</span>
              </TabsTrigger>
              <TabsTrigger
                value="learn"
                className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent gap-2"
              >
                <Book size={18} />
                <span className="hidden lg:inline">Learn</span>
              </TabsTrigger>
            </div>

            <Separator orientation="vertical" className="mx-2 h-6" />

            <div className="flex items-center gap-1">
              <TabsTrigger
                value="favorites"
                className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent relative gap-2"
              >
                <Heart
                  size={18}
                  weight={favoritesCount > 0 ? 'fill' : 'regular'}
                  className={cn(favoritesCount > 0 && activeTab !== 'favorites' && 'text-red-400')}
                />
                <span className="hidden lg:inline">Favorites</span>
                {favoritesCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 min-w-5 border-red-500/50 bg-red-500/20 px-1.5 text-red-400"
                  >
                    {favoritesCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent gap-2"
              >
                <Trophy size={18} />
                <span className="hidden lg:inline">Achievements</span>
              </TabsTrigger>
            </div>
          </TabsList>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground hidden gap-2 xl:flex"
              onClick={() => {}}
            >
              <Command size={14} />
              <span className="text-xs">Quick Nav</span>
              <kbd className="border-border bg-muted pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <ThemeToggle />
            <TokenSettings
              trigger={
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="API Settings">
                  <Gear size={18} />
                </Button>
              }
            />
          </div>
        </div>
      </Tabs>
    </div>
  );
}

export const Navigation = memo(NavigationComponent);
