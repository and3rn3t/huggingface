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
        className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
          isSelected
            ? 'border-accent bg-accent/10 shadow-accent/20'
            : 'hover:border-accent/50'
        }`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">{task.icon}</div>
          {task.badge && (
            <Badge variant="secondary" className="text-xs">
              {task.badge}
            </Badge>
          )}
        </div>
        <h4 className="font-semibold text-sm mb-1">{task.name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      </Card>
    </motion.div>
  );
}
