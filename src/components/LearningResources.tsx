import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Book, Sparkle, ArrowRight, Code, Database, Cpu } from '@phosphor-icons/react'

interface Resource {
  title: string
  description: string
  category: 'Getting Started' | 'Documentation' | 'Tutorial' | 'Best Practice'
  icon: typeof Book
  link?: string
}

const RESOURCES: Resource[] = [
  {
    title: 'What is HuggingFace?',
    description: 'HuggingFace is a platform for machine learning, offering tools, models, and datasets. It\'s best known for the Transformers library and model hub.',
    category: 'Getting Started',
    icon: Sparkle
  },
  {
    title: 'Understanding Datasets',
    description: 'Datasets are collections of data used to train ML models. HuggingFace hosts thousands of datasets for tasks like text classification, translation, and more.',
    category: 'Getting Started',
    icon: Database
  },
  {
    title: 'Exploring Models',
    description: 'Pre-trained models are ready-to-use neural networks. You can use them directly or fine-tune them for specific tasks without training from scratch.',
    category: 'Getting Started',
    icon: Cpu
  },
  {
    title: 'Inference API Basics',
    description: 'The Inference API lets you use models without downloading them. Send HTTP requests with your data and get predictions back instantly.',
    category: 'Tutorial',
    icon: Code
  },
  {
    title: 'Choosing the Right Model',
    description: 'Consider your task (classification, generation, etc.), language requirements, model size, and inference speed when selecting a model.',
    category: 'Best Practice',
    icon: Book
  },
  {
    title: 'API Token Usage',
    description: 'Get an API token from your HuggingFace account settings. Use it in request headers for higher rate limits and access to private models.',
    category: 'Documentation',
    icon: Code
  }
]

const QUICK_TIPS = [
  'Start with popular models (high download counts) - they\'re well-tested and documented',
  'Use the \'distil\' versions of models (like DistilBERT) for faster inference with minimal accuracy loss',
  'Most text models work best with English - check language tags for multilingual support',
  'The Inference API has rate limits - consider caching results for repeated queries'
]

export function LearningResources() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight">Learning Resources</h2>
        <p className="text-muted-foreground">Essential guides and tips for working with HuggingFace</p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
        <div className="flex items-start gap-3 mb-4">
          <Sparkle className="text-accent flex-shrink-0 mt-1" size={28} />
          <div>
            <h3 className="font-semibold text-lg mb-1">Quick Tips</h3>
            <p className="text-sm text-muted-foreground">Pro tips to accelerate your learning</p>
          </div>
        </div>
        <ul className="space-y-2">
          {QUICK_TIPS.map((tip, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <ArrowRight className="text-accent flex-shrink-0 mt-0.5" size={16} />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RESOURCES.map((resource, index) => {
          const Icon = resource.icon
          return (
            <Card
              key={index}
              className="p-4 hover:shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-1 border-border hover:border-accent/50"
            >
              <div className="flex items-start gap-3 mb-3">
                <Icon className="text-accent flex-shrink-0" size={24} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{resource.title}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs mb-2">
                    {resource.category}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </Card>
          )
        })}
      </div>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-4">Common HuggingFace Concepts</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-1">Pipeline</h4>
            <p className="text-sm text-muted-foreground">
              A high-level API that groups together a model with its preprocessing and postprocessing steps. The easiest way to use models.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-1">Tokenizer</h4>
            <p className="text-sm text-muted-foreground">
              Converts text into numbers (tokens) that models can understand. Each model has its own tokenizer trained on specific vocabulary.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-1">Fine-tuning</h4>
            <p className="text-sm text-muted-foreground">
              Taking a pre-trained model and training it further on your specific dataset. Much faster and requires less data than training from scratch.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-1">Model Card</h4>
            <p className="text-sm text-muted-foreground">
              Documentation for each model describing its training data, intended use, limitations, and performance metrics. Always read before using a model.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-primary/10 border-primary/30">
          <div className="text-3xl font-bold text-accent mb-1">130K+</div>
          <div className="text-sm text-muted-foreground">Available Models</div>
        </Card>
        <Card className="p-4 text-center bg-accent/10 border-accent/30">
          <div className="text-3xl font-bold text-accent mb-1">75K+</div>
          <div className="text-sm text-muted-foreground">Datasets</div>
        </Card>
        <Card className="p-4 text-center bg-primary/10 border-primary/30">
          <div className="text-3xl font-bold text-accent mb-1">10M+</div>
          <div className="text-sm text-muted-foreground">Monthly Users</div>
        </Card>
      </div>
    </div>
  )
}
