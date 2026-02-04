import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { formatNumber } from '@/lib/utils';
import { HFDataset, HFModel, searchDatasets, searchModels } from '@/services/huggingface';
import {
  ArrowsLeftRight,
  Book,
  Code,
  Cpu,
  Database,
  Fire,
  Heart,
  Spinner,
  Trophy,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

interface QuickNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

interface NavCommand {
  id: string;
  label: string;
  icon: React.ElementType;
  keywords: string[];
  group: string;
}

const commands: NavCommand[] = [
  {
    id: 'trending',
    label: 'Trending',
    icon: Fire,
    keywords: ['trending', 'popular', 'hot', 'new'],
    group: 'Discover',
  },
  {
    id: 'datasets',
    label: 'Browse Datasets',
    icon: Database,
    keywords: ['datasets', 'data', 'browse', 'search'],
    group: 'Discover',
  },
  {
    id: 'models',
    label: 'Explore Models',
    icon: Cpu,
    keywords: ['models', 'ai', 'ml', 'explore'],
    group: 'Discover',
  },
  {
    id: 'compare',
    label: 'Compare Models',
    icon: ArrowsLeftRight,
    keywords: ['compare', 'comparison', 'side by side'],
    group: 'Tools',
  },
  {
    id: 'playground',
    label: 'API Playground',
    icon: Code,
    keywords: ['playground', 'api', 'test', 'experiment', 'code'],
    group: 'Tools',
  },
  {
    id: 'learn',
    label: 'Learning Resources',
    icon: Book,
    keywords: ['learn', 'tutorial', 'education', 'guide', 'resources'],
    group: 'Tools',
  },
  {
    id: 'favorites',
    label: 'My Favorites',
    icon: Heart,
    keywords: ['favorites', 'saved', 'bookmarks', 'starred'],
    group: 'Personal',
  },
  {
    id: 'achievements',
    label: 'Achievements & Stats',
    icon: Trophy,
    keywords: ['achievements', 'badges', 'progress', 'stats', 'streaks'],
    group: 'Personal',
  },
];

export function QuickNav({ activeTab, onNavigate }: QuickNavProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modelResults, setModelResults] = useState<HFModel[]>([]);
  const [datasetResults, setDatasetResults] = useState<HFDataset[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setModelResults([]);
      setDatasetResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [models, datasets] = await Promise.all([
          searchModels({ search: searchQuery, limit: 5 }),
          searchDatasets({ search: searchQuery, limit: 5 }),
        ]);
        setModelResults(models);
        setDatasetResults(datasets);
      } catch {
        // Silently fail - search is optional enhancement
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelect = (commandId: string) => {
    onNavigate(commandId);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
      setModelResults([]);
      setDatasetResults([]);
    }
  };

  const discoverCommands = commands.filter((cmd) => cmd.group === 'Discover');
  const toolsCommands = commands.filter((cmd) => cmd.group === 'Tools');
  const personalCommands = commands.filter((cmd) => cmd.group === 'Personal');

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder="Search navigation, models, or datasets..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Discover">
          {discoverCommands.map((command) => {
            const Icon = command.icon;
            return (
              <CommandItem
                key={command.id}
                value={`${command.label} ${command.keywords.join(' ')}`}
                onSelect={() => handleSelect(command.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{command.label}</span>
                {activeTab === command.id && (
                  <span className="text-accent ml-auto text-xs">Current</span>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Tools">
          {toolsCommands.map((command) => {
            const Icon = command.icon;
            return (
              <CommandItem
                key={command.id}
                value={`${command.label} ${command.keywords.join(' ')}`}
                onSelect={() => handleSelect(command.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{command.label}</span>
                {activeTab === command.id && (
                  <span className="text-accent ml-auto text-xs">Current</span>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Personal">
          {personalCommands.map((command) => {
            const Icon = command.icon;
            return (
              <CommandItem
                key={command.id}
                value={`${command.label} ${command.keywords.join(' ')}`}
                onSelect={() => handleSelect(command.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{command.label}</span>
                {activeTab === command.id && (
                  <span className="text-accent ml-auto text-xs">Current</span>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>

        {(modelResults.length > 0 || datasetResults.length > 0 || isSearching) && (
          <>
            <CommandSeparator />

            {isSearching && (
              <div className="text-muted-foreground py-6 text-center text-sm">
                <Spinner className="mx-auto mb-2 animate-spin" size={20} />
                Searching...
              </div>
            )}

            {!isSearching && modelResults.length > 0 && (
              <CommandGroup heading="Models">
                {modelResults.map((model) => (
                  <CommandItem
                    key={model.id || model.modelId}
                    value={model.id || model.modelId}
                    onSelect={() => {
                      // Navigate to models tab and close
                      onNavigate('models');
                      setOpen(false);
                    }}
                  >
                    <Cpu className="text-accent mr-2 h-4 w-4" />
                    <div className="flex-1 truncate">
                      <span className="font-medium">{model.id || model.modelId}</span>
                      {model.pipeline_tag && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          {model.pipeline_tag}
                        </span>
                      )}
                    </div>
                    {model.downloads && (
                      <span className="text-muted-foreground text-xs">
                        ⬇️ {formatNumber(model.downloads)}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!isSearching && datasetResults.length > 0 && (
              <CommandGroup heading="Datasets">
                {datasetResults.map((dataset) => (
                  <CommandItem
                    key={dataset.id}
                    value={dataset.id}
                    onSelect={() => {
                      // Navigate to datasets tab and close
                      onNavigate('datasets');
                      setOpen(false);
                    }}
                  >
                    <Database className="text-accent mr-2 h-4 w-4" />
                    <div className="flex-1 truncate">
                      <span className="font-medium">{dataset.id}</span>
                    </div>
                    {dataset.downloads && (
                      <span className="text-muted-foreground text-xs">
                        ⬇️ {formatNumber(dataset.downloads)}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
