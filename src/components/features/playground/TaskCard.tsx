import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export interface PlaygroundTask {
  id: string;
  name: string;
  category: 'text' | 'vision' | 'audio' | 'multimodal';
  description: string;
  placeholder: string;
  exampleInput: string;
  icon: React.ReactNode;
  badge?: string;
  models: string[];
  parameters?: {
    temperature?: boolean;
    maxTokens?: boolean;
    topP?: boolean;
  };
}

interface TaskCardProps {
  task: PlaygroundTask;
  isSelected: boolean;
  onClick: () => void;
}

export function TaskCard({ task, isSelected, onClick }: TaskCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className={`cursor-pointer p-4 transition-all hover:shadow-lg ${
          isSelected ? 'border-accent bg-accent/10 shadow-accent/20' : 'hover:border-accent/50'
        }`}
        onClick={onClick}
      >
        <div className="mb-2 flex items-start justify-between">
          <div className="bg-primary/10 text-primary rounded-lg p-2">{task.icon}</div>
          {task.badge && (
            <Badge variant="secondary" className="text-xs">
              {task.badge}
            </Badge>
          )}
        </div>
        <h4 className="mb-1 text-sm font-semibold">{task.name}</h4>
        <p className="text-muted-foreground line-clamp-2 text-xs">{task.description}</p>
      </Card>
    </motion.div>
  );
}
