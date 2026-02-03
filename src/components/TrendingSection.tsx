import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendUp, Fire, Database, Cpu, ArrowUp, Sparkle } from '@phosphor-icons/react'

interface TrendingItem {
  id: string
  name: string
  type: 'dataset' | 'model'
  description: string
  trendScore: number
  changePercent: number
  downloads: number
  category: string
}

const TRENDING_ITEMS: TrendingItem[] = [
  {
    id: 'llama-2-7b',
    name: 'Llama 2 7B',
    type: 'model',
    description: 'Meta\'s latest open-source large language model',
    trendScore: 98,
    changePercent: 234,
    downloads: 89200000,
    category: 'Text Generation'
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    type: 'model',
    description: 'Advanced text-to-image generation model',
    trendScore: 95,
    changePercent: 187,
    downloads: 72400000,
    category: 'Image Generation'
  },
  {
    id: 'OpenAssistant',
    name: 'OpenAssistant Conversations',
    type: 'dataset',
    description: 'Crowd-sourced assistant-style conversation dataset',
    trendScore: 91,
    changePercent: 156,
    downloads: 8900000,
    category: 'Conversational'
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    type: 'model',
    description: 'Efficient 7B parameter model outperforming larger models',
    trendScore: 89,
    changePercent: 142,
    downloads: 45600000,
    category: 'Text Generation'
  },
  {
    id: 'code-alpaca',
    name: 'Code Alpaca',
    type: 'dataset',
    description: 'Instruction-following dataset for code generation',
    trendScore: 85,
    changePercent: 128,
    downloads: 5200000,
    category: 'Code'
  },
  {
    id: 'whisper-large-v3',
    name: 'Whisper Large v3',
    type: 'model',
    description: 'OpenAI\'s latest speech recognition model',
    trendScore: 82,
    changePercent: 119,
    downloads: 34200000,
    category: 'Speech Recognition'
  }
]

export function TrendingSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight flex items-center gap-2">
          <Fire className="text-accent" size={28} weight="fill" />
          Trending Now
        </h2>
        <p className="text-muted-foreground">Most popular models and datasets in the HuggingFace community</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-accent/20 to-primary/20 border-accent/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendUp className="text-accent" size={20} />
            <span className="text-sm text-muted-foreground">Top Trending</span>
          </div>
          <div className="text-3xl font-bold text-accent mb-1">
            {TRENDING_ITEMS.length}
          </div>
          <div className="text-xs text-muted-foreground">Hot items this week</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/20 to-accent/10 border-primary/50">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUp className="text-green-500" size={20} weight="bold" />
            <span className="text-sm text-muted-foreground">Avg Growth</span>
          </div>
          <div className="text-3xl font-bold text-green-500 mb-1">
            +{Math.round(TRENDING_ITEMS.reduce((acc, item) => acc + item.changePercent, 0) / TRENDING_ITEMS.length)}%
          </div>
          <div className="text-xs text-muted-foreground">Week over week</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-accent/10 to-primary/20 border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="text-accent" size={20} />
            <span className="text-sm text-muted-foreground">Hot Models</span>
          </div>
          <div className="text-3xl font-bold text-accent mb-1">
            {TRENDING_ITEMS.filter(item => item.type === 'model').length}
          </div>
          <div className="text-xs text-muted-foreground">Trending models</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Database className="text-accent" size={20} />
            <span className="text-sm text-muted-foreground">Hot Datasets</span>
          </div>
          <div className="text-3xl font-bold text-accent mb-1">
            {TRENDING_ITEMS.filter(item => item.type === 'dataset').length}
          </div>
          <div className="text-xs text-muted-foreground">Trending datasets</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TRENDING_ITEMS.map((item, index) => {
          const Icon = item.type === 'model' ? Cpu : Database
          const isTopTrending = index < 3

          return (
            <Card
              key={item.id}
              className={`p-4 hover:shadow-lg hover:shadow-accent/20 transition-all cursor-pointer hover:-translate-y-1 border-border hover:border-accent/50 relative ${
                isTopTrending ? 'bg-gradient-to-br from-card to-accent/5' : ''
              }`}
            >
              {isTopTrending && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-accent text-accent-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm">
                    #{index + 1}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <Icon className="text-accent flex-shrink-0" size={24} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-lg truncate">{item.name}</h3>
                    {isTopTrending && <Sparkle className="text-accent flex-shrink-0" size={16} weight="fill" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {item.type}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    {(item.downloads / 1000000).toFixed(1)}M downloads
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-500 font-medium">
                  <ArrowUp size={16} weight="bold" />
                  <span>+{item.changePercent}%</span>
                </div>
              </div>

              <div className="mt-3 bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-accent to-primary h-full transition-all"
                  style={{ width: `${item.trendScore}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Trend Score: {item.trendScore}/100
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendUp className="text-accent" size={20} />
          What Makes Something Trending?
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Download Velocity</h4>
            <p className="text-muted-foreground">
              Rapid increase in downloads over the past 7 days compared to the previous period
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Community Engagement</h4>
            <p className="text-muted-foreground">
              Likes, comments, and discussions around the model or dataset
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Recent Updates</h4>
            <p className="text-muted-foreground">
              New versions, improvements, or significant documentation changes
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
