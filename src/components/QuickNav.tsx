import { useEffect, useState } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Database, Cpu, Code, Book, Heart, ArrowsLeftRight, Fire, Trophy } from '@phosphor-icons/react'

interface QuickNavProps {
  activeTab: string
  onNavigate: (tab: string) => void
}

interface NavCommand {
  id: string
  label: string
  icon: React.ElementType
  keywords: string[]
  group: string
}

const commands: NavCommand[] = [
  { 
    id: 'trending', 
    label: 'Trending', 
    icon: Fire, 
    keywords: ['trending', 'popular', 'hot', 'new'],
    group: 'Discover'
  },
  { 
    id: 'datasets', 
    label: 'Browse Datasets', 
    icon: Database, 
    keywords: ['datasets', 'data', 'browse', 'search'],
    group: 'Discover'
  },
  { 
    id: 'models', 
    label: 'Explore Models', 
    icon: Cpu, 
    keywords: ['models', 'ai', 'ml', 'explore'],
    group: 'Discover'
  },
  { 
    id: 'compare', 
    label: 'Compare Models', 
    icon: ArrowsLeftRight, 
    keywords: ['compare', 'comparison', 'side by side'],
    group: 'Tools'
  },
  { 
    id: 'playground', 
    label: 'API Playground', 
    icon: Code, 
    keywords: ['playground', 'api', 'test', 'experiment', 'code'],
    group: 'Tools'
  },
  { 
    id: 'learn', 
    label: 'Learning Resources', 
    icon: Book, 
    keywords: ['learn', 'tutorial', 'education', 'guide', 'resources'],
    group: 'Tools'
  },
  { 
    id: 'favorites', 
    label: 'My Favorites', 
    icon: Heart, 
    keywords: ['favorites', 'saved', 'bookmarks', 'starred'],
    group: 'Personal'
  },
  { 
    id: 'achievements', 
    label: 'Achievements & Stats', 
    icon: Trophy, 
    keywords: ['achievements', 'badges', 'progress', 'stats', 'streaks'],
    group: 'Personal'
  },
]

export function QuickNav({ activeTab, onNavigate }: QuickNavProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = (commandId: string) => {
    onNavigate(commandId)
    setOpen(false)
  }

  const discoverCommands = commands.filter(cmd => cmd.group === 'Discover')
  const toolsCommands = commands.filter(cmd => cmd.group === 'Tools')
  const personalCommands = commands.filter(cmd => cmd.group === 'Personal')

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search navigation..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Discover">
          {discoverCommands.map((command) => {
            const Icon = command.icon
            return (
              <CommandItem
                key={command.id}
                value={`${command.label} ${command.keywords.join(' ')}`}
                onSelect={() => handleSelect(command.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{command.label}</span>
                {activeTab === command.id && (
                  <span className="ml-auto text-xs text-accent">Current</span>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Tools">
          {toolsCommands.map((command) => {
            const Icon = command.icon
            return (
              <CommandItem
                key={command.id}
                value={`${command.label} ${command.keywords.join(' ')}`}
                onSelect={() => handleSelect(command.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{command.label}</span>
                {activeTab === command.id && (
                  <span className="ml-auto text-xs text-accent">Current</span>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Personal">
          {personalCommands.map((command) => {
            const Icon = command.icon
            return (
              <CommandItem
                key={command.id}
                value={`${command.label} ${command.keywords.join(' ')}`}
                onSelect={() => handleSelect(command.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{command.label}</span>
                {activeTab === command.id && (
                  <span className="ml-auto text-xs text-accent">Current</span>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
