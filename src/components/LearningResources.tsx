import { StreakTracker } from '@/components/StreakTracker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAchievements } from '@/hooks/use-achievements';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  ArrowRight,
  Book,
  BookOpen,
  Brain,
  CheckCircle,
  Circle,
  Code,
  Cpu,
  Database,
  GraduationCap,
  Lightbulb,
  Sparkle,
  Star,
  Target,
  Trophy,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

interface Resource {
  title: string;
  description: string;
  category: 'Getting Started' | 'Documentation' | 'Tutorial' | 'Best Practice';
  icon: typeof Book;
  link?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  quiz?: Quiz;
  icon: typeof Book;
}

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const LESSONS: Lesson[] = [
  {
    id: 'intro-hf',
    title: 'Introduction to HuggingFace',
    description: 'Learn the basics of the HuggingFace platform',
    icon: Sparkle,
    content: `HuggingFace is the leading platform for machine learning collaboration. It provides:

• **Model Hub**: 130K+ pre-trained models ready to use
• **Datasets**: 75K+ datasets for training and evaluation
• **Spaces**: Deploy ML apps with ease
• **Inference API**: Use models without setup

The platform democratizes AI by making state-of-the-art models accessible to everyone, from beginners to researchers.`,
    quiz: {
      question: 'What is the primary benefit of using pre-trained models from HuggingFace?',
      options: [
        'They are always 100% accurate',
        'You can use them without training from scratch',
        'They only work with English text',
        'They require no API token',
      ],
      correctAnswer: 1,
      explanation:
        'Pre-trained models save time and resources by allowing you to use or fine-tune existing models instead of training from scratch.',
    },
  },
  {
    id: 'understanding-models',
    title: 'Understanding Model Types',
    description: 'Explore different model architectures and their uses',
    icon: Cpu,
    content: `Different tasks require different model architectures:

**Text Models:**
• BERT - Best for understanding context (classification, Q&A)
• GPT - Excels at text generation
• T5 - Versatile for multiple tasks

**Vision Models:**
• ViT - Image classification
• CLIP - Connects images and text
• Stable Diffusion - Image generation

**Audio Models:**
• Whisper - Speech recognition
• Wav2Vec - Audio understanding

Choose based on your task, accuracy needs, and speed requirements.`,
    quiz: {
      question: 'Which model type is best suited for text generation tasks?',
      options: ['BERT', 'GPT', 'ViT', 'CLIP'],
      correctAnswer: 1,
      explanation:
        'GPT (Generative Pre-trained Transformer) models are specifically designed for generating coherent text.',
    },
  },
  {
    id: 'datasets-deep-dive',
    title: 'Working with Datasets',
    description: 'Master dataset selection and usage',
    icon: Database,
    content: `HuggingFace datasets are optimized for ML workflows:

**Dataset Structure:**
• Training split - For model training
• Validation split - For tuning hyperparameters
• Test split - For final evaluation

**Popular Datasets:**
• IMDB - Sentiment analysis (50K movie reviews)
• SQuAD - Question answering
• COCO - Image captioning
• Common Voice - Speech recognition

**Best Practices:**
• Check dataset cards for bias and limitations
• Understand the data distribution
• Use appropriate evaluation metrics
• Consider dataset size vs. compute resources`,
    quiz: {
      question: 'What is the purpose of the validation split in a dataset?',
      options: [
        'Final model evaluation',
        'Training the model',
        'Tuning hyperparameters',
        'Data visualization',
      ],
      correctAnswer: 2,
      explanation:
        'The validation split is used to tune hyperparameters and make decisions during training without touching the test set.',
    },
  },
  {
    id: 'inference-api',
    title: 'Mastering the Inference API',
    description: 'Learn to use models via API calls',
    icon: Code,
    content: `The Inference API makes model usage simple:

**Basic Usage:**
\`\`\`javascript
const response = await fetch(
  "https://api-inference.huggingface.co/models/MODEL_ID",
  {
    headers: { Authorization: "Bearer YOUR_TOKEN" },
    method: "POST",
    body: JSON.stringify({ inputs: "Your text" })
  }
)
\`\`\`

**Key Concepts:**
• Rate limits - Free tier: ~30 requests/min
• Cold starts - First request may be slower
• Model loading - Popular models are always ready
• Parameters - Customize output (temperature, max_length)

**Common Tasks:**
• Text classification
• Sentiment analysis
• Translation
• Question answering
• Text generation`,
    quiz: {
      question: 'What might cause the first API request to a model to be slower?',
      options: [
        'Network congestion',
        'Cold start - model loading',
        'Too much input text',
        'Wrong API token',
      ],
      correctAnswer: 1,
      explanation:
        'Cold starts occur when a model needs to be loaded into memory. Popular models are kept warm to avoid this.',
    },
  },
  {
    id: 'best-practices',
    title: 'Production Best Practices',
    description: 'Deploy ML models effectively',
    icon: Target,
    content: `Deploy ML models like a pro:

**Performance Optimization:**
• Use distilled models (DistilBERT) for faster inference
• Batch requests when possible
• Cache common queries
• Consider model quantization

**Error Handling:**
• Handle rate limits gracefully
• Implement retry logic with exponential backoff
• Validate inputs before sending
• Parse errors meaningfully

**Security:**
• Never expose API tokens in client-side code
• Use environment variables
• Rotate tokens regularly
• Monitor usage for anomalies

**Monitoring:**
• Track response times
• Log errors and edge cases
• Monitor token usage
• A/B test model versions`,
    quiz: {
      question: 'What is the main advantage of using distilled models like DistilBERT?',
      options: [
        'Higher accuracy',
        'Better multilingual support',
        'Faster inference with minimal accuracy loss',
        'Larger context windows',
      ],
      correctAnswer: 2,
      explanation:
        'Distilled models are compressed versions that maintain ~95-97% of performance while being significantly faster and smaller.',
    },
  },
];

const RESOURCES: Resource[] = [
  {
    title: 'What is HuggingFace?',
    description:
      "HuggingFace is a platform for machine learning, offering tools, models, and datasets. It's best known for the Transformers library and model hub.",
    category: 'Getting Started',
    icon: Sparkle,
    link: 'https://huggingface.co/docs',
  },
  {
    title: 'Understanding Datasets',
    description:
      'Datasets are collections of data used to train ML models. HuggingFace hosts thousands of datasets for tasks like text classification, translation, and more.',
    category: 'Getting Started',
    icon: Database,
    link: 'https://huggingface.co/docs/datasets',
  },
  {
    title: 'Exploring Models',
    description:
      'Pre-trained models are ready-to-use neural networks. You can use them directly or fine-tune them for specific tasks without training from scratch.',
    category: 'Getting Started',
    icon: Cpu,
    link: 'https://huggingface.co/docs/transformers',
  },
  {
    title: 'Inference API Basics',
    description:
      'The Inference API lets you use models without downloading them. Send HTTP requests with your data and get predictions back instantly.',
    category: 'Tutorial',
    icon: Code,
    link: 'https://huggingface.co/docs/api-inference',
  },
  {
    title: 'Choosing the Right Model',
    description:
      'Consider your task (classification, generation, etc.), language requirements, model size, and inference speed when selecting a model.',
    category: 'Best Practice',
    icon: Book,
    link: 'https://huggingface.co/docs/transformers/model_doc/auto',
  },
  {
    title: 'API Token Usage',
    description:
      'Get an API token from your HuggingFace account settings. Use it in request headers for higher rate limits and access to private models.',
    category: 'Documentation',
    icon: Code,
    link: 'https://huggingface.co/docs/hub/security-tokens',
  },
];

const QUICK_TIPS = [
  "Start with popular models (high download counts) - they're well-tested and documented",
  "Use the 'distil' versions of models (like DistilBERT) for faster inference with minimal accuracy loss",
  'Most text models work best with English - check language tags for multilingual support',
  'The Inference API has rate limits - consider caching results for repeated queries',
];

export function LearningResources() {
  const [completedLessons = [], setCompletedLessons] = useLocalStorage<string[]>(
    'completed-lessons',
    []
  );
  const [quizScores = {}, setQuizScores] = useLocalStorage<Record<string, boolean>>(
    'quiz-scores',
    {}
  );
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const { trackLessonComplete, trackQuizPass } = useAchievements();

  const currentLesson = LESSONS.find((l) => l.id === selectedLesson);
  const progress = (completedLessons.length / LESSONS.length) * 100;
  const totalQuizzes = LESSONS.filter((l) => l.quiz).length;
  const passedQuizzes = Object.values(quizScores).filter(Boolean).length;

  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons((current) => {
      const lessons = current || [];
      if (!lessons.includes(lessonId)) {
        const newLessons = [...lessons, lessonId];
        trackLessonComplete(newLessons.length);
        toast.success('Lesson completed!', {
          description: 'Keep up the great work!',
        });
        return newLessons;
      }
      return lessons;
    });
  };

  const handleQuizSubmit = (lessonId: string, correct: boolean) => {
    setQuizScores((current) => {
      const newScores = { ...(current || {}), [lessonId]: correct };
      const passedCount = Object.values(newScores).filter(Boolean).length;
      trackQuizPass(passedCount);
      return newScores;
    });
    setShowExplanation(true);

    if (correct) {
      toast.success('Correct!', {
        description: "You've mastered this concept!",
      });
      handleLessonComplete(lessonId);
    } else {
      toast.error('Not quite right', {
        description: 'Review the explanation and try again!',
      });
    }
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 text-2xl font-semibold tracking-tight">Learning Center</h2>
          <p className="text-muted-foreground">
            Master HuggingFace with interactive lessons and quizzes
          </p>
        </div>

        {completedLessons.length > 0 && (
          <Card className="from-accent/20 to-primary/20 border-accent/50 bg-gradient-to-br p-4">
            <div className="flex items-center gap-3">
              <Trophy className="text-accent" size={32} weight="fill" />
              <div>
                <div className="text-2xl font-bold">
                  {completedLessons.length}/{LESSONS.length}
                </div>
                <div className="text-muted-foreground text-xs">Lessons Completed</div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <StreakTracker />

      <Card className="from-primary/10 to-accent/10 border-primary/30 bg-gradient-to-br p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-accent" size={28} weight="bold" />
            <div>
              <h3 className="text-lg font-semibold">Your Progress</h3>
              <p className="text-muted-foreground text-sm">{Math.round(progress)}% complete</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-accent text-sm font-medium">
              {passedQuizzes}/{totalQuizzes} Quizzes Passed
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2">
            <BookOpen className="text-accent" size={24} />
            <h3 className="text-lg font-semibold">Interactive Lessons</h3>
          </div>

          <div className="space-y-3">
            {LESSONS.map((lesson, index) => {
              const Icon = lesson.icon;
              const isCompleted = completedLessons.includes(lesson.id);
              const isSelected = selectedLesson === lesson.id;
              const hasQuiz = !!lesson.quiz;
              const quizPassed = quizScores[lesson.id];

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`hover:shadow-primary/20 cursor-pointer p-4 transition-all hover:shadow-lg ${
                      isSelected
                        ? 'border-accent shadow-accent/20 shadow-lg'
                        : 'border-border hover:border-accent/50'
                    }`}
                    onClick={() => {
                      setSelectedLesson(isSelected ? null : lesson.id);
                      resetQuiz();
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                          isCompleted ? 'bg-accent/20' : 'bg-muted'
                        }`}
                      >
                        <Icon
                          className={isCompleted ? 'text-accent' : 'text-muted-foreground'}
                          size={20}
                          weight={isCompleted ? 'fill' : 'regular'}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="font-medium">{lesson.title}</h4>
                          {hasQuiz && <Brain className="text-primary" size={16} />}
                        </div>
                        <p className="text-muted-foreground text-sm">{lesson.description}</p>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
                        {quizPassed && <Star className="text-accent" size={20} weight="fill" />}
                        {isCompleted ? (
                          <CheckCircle className="text-accent" size={24} weight="fill" />
                        ) : (
                          <Circle className="text-muted-foreground" size={24} />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isSelected && currentLesson && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-border mt-4 border-t pt-4"
                        >
                          <div className="prose prose-sm mb-4 max-w-none">
                            <div className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                              {currentLesson.content}
                            </div>
                          </div>

                          {currentLesson.quiz && (
                            <Card className="bg-primary/5 border-primary/20 p-4">
                              <div className="mb-3 flex items-center gap-2">
                                <Brain className="text-primary" size={20} weight="fill" />
                                <h5 className="text-sm font-semibold">Knowledge Check</h5>
                              </div>

                              <p className="mb-3 text-sm font-medium">
                                {currentLesson.quiz.question}
                              </p>

                              <div className="mb-4 space-y-2">
                                {currentLesson.quiz.options.map((option, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setSelectedAnswer(idx)}
                                    disabled={showExplanation}
                                    className={`w-full rounded-lg border p-3 text-left text-sm transition-all ${
                                      selectedAnswer === idx
                                        ? showExplanation
                                          ? idx === currentLesson.quiz!.correctAnswer
                                            ? 'border-accent bg-accent/10 text-accent font-medium'
                                            : 'border-destructive bg-destructive/10 text-destructive'
                                          : 'border-accent bg-accent/10'
                                        : 'border-border bg-background hover:border-accent/50 hover:bg-muted'
                                    } ${showExplanation && idx === currentLesson.quiz!.correctAnswer ? 'border-accent bg-accent/10' : ''}`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>

                              {showExplanation && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-accent/10 border-accent/30 mb-3 rounded-lg border p-3"
                                >
                                  <div className="flex items-start gap-2">
                                    <Lightbulb
                                      className="text-accent mt-0.5 flex-shrink-0"
                                      size={18}
                                      weight="fill"
                                    />
                                    <p className="text-sm">{currentLesson.quiz.explanation}</p>
                                  </div>
                                </motion.div>
                              )}

                              <div className="flex gap-2">
                                {!showExplanation ? (
                                  <Button
                                    onClick={() => {
                                      if (selectedAnswer !== null) {
                                        handleQuizSubmit(
                                          currentLesson.id,
                                          selectedAnswer === currentLesson.quiz!.correctAnswer
                                        );
                                      }
                                    }}
                                    disabled={selectedAnswer === null}
                                    className="flex-1"
                                    size="sm"
                                  >
                                    Submit Answer
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      onClick={resetQuiz}
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                    >
                                      Try Again
                                    </Button>
                                    {!isCompleted && (
                                      <Button
                                        onClick={() => handleLessonComplete(currentLesson.id)}
                                        className="flex-1"
                                        size="sm"
                                      >
                                        <CheckCircle size={16} weight="fill" className="mr-1" />
                                        Mark Complete
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </Card>
                          )}

                          {!currentLesson.quiz && !isCompleted && (
                            <Button
                              onClick={() => handleLessonComplete(currentLesson.id)}
                              className="mt-2 w-full"
                              size="sm"
                            >
                              <CheckCircle size={16} weight="fill" className="mr-1" />
                              Mark as Complete
                            </Button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="from-primary/10 to-accent/10 border-primary/30 bg-gradient-to-br p-4">
            <div className="mb-4 flex items-start gap-3">
              <Sparkle className="text-accent mt-1 flex-shrink-0" size={24} weight="fill" />
              <div>
                <h3 className="mb-1 font-semibold">Quick Tips</h3>
                <p className="text-muted-foreground text-xs">Pro tips to accelerate learning</p>
              </div>
            </div>
            <ul className="space-y-2">
              {QUICK_TIPS.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-xs">
                  <ArrowRight className="text-accent mt-0.5 flex-shrink-0" size={14} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-muted/50 p-4">
            <h3 className="mb-3 text-sm font-semibold">Key Concepts</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="pipeline">
                <AccordionTrigger className="py-2 text-sm">Pipeline</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-xs">
                  A high-level API that groups together a model with its preprocessing and
                  postprocessing steps.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="tokenizer">
                <AccordionTrigger className="py-2 text-sm">Tokenizer</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-xs">
                  Converts text into numbers (tokens) that models can understand. Each model has its
                  own tokenizer.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="fine-tuning">
                <AccordionTrigger className="py-2 text-sm">Fine-tuning</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-xs">
                  Training a pre-trained model further on your specific dataset. Much faster than
                  training from scratch.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="model-card">
                <AccordionTrigger className="py-2 text-sm">Model Card</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-xs">
                  Documentation describing training data, intended use, limitations, and performance
                  metrics.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            <Card className="bg-primary/10 border-primary/30 p-3 text-center">
              <div className="text-accent mb-0.5 text-2xl font-bold">130K+</div>
              <div className="text-muted-foreground text-xs">Models</div>
            </Card>
            <Card className="bg-accent/10 border-accent/30 p-3 text-center">
              <div className="text-accent mb-0.5 text-2xl font-bold">75K+</div>
              <div className="text-muted-foreground text-xs">Datasets</div>
            </Card>
            <Card className="bg-primary/10 border-primary/30 p-3 text-center">
              <div className="text-accent mb-0.5 text-2xl font-bold">10M+</div>
              <div className="text-muted-foreground text-xs">Users</div>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {RESOURCES.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-primary/20 border-border hover:border-accent/50 p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 flex items-start gap-3">
                <Icon className="text-accent flex-shrink-0" size={24} />
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-medium">{resource.title}</h3>
                  </div>
                  <Badge variant="outline" className="mb-2 text-xs">
                    {resource.category}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-3 text-sm">{resource.description}</p>
              {resource.link && (
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent inline-flex items-center gap-1 text-sm hover:underline"
                >
                  Read documentation
                  <ArrowRight size={14} />
                </a>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
