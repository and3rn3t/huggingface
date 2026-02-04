import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from '@phosphor-icons/react';

export interface HistoryItem {
  id: string;
  taskId: string;
  taskName: string;
  input: string;
  output: string;
  timestamp: number;
  executionTime: number;
  model: string;
}

interface ExecutionHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export function ExecutionHistory({ history, onSelect }: ExecutionHistoryProps) {
  if (history.length === 0) return null;

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Clock size={18} />
        Recent Executions
      </h4>
      <div className="space-y-2">
        {history.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="p-3 bg-muted rounded-lg space-y-1 hover:bg-muted/70 transition-colors cursor-pointer"
            onClick={() => onSelect(item)}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{item.taskName}</span>
              <Badge variant="outline" className="text-xs">
                {item.executionTime}ms
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{item.input}</p>
            <div className="text-xs text-muted-foreground">
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
