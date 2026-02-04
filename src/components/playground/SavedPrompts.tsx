import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Trash } from '@phosphor-icons/react';

interface SavedPrompt {
  id: string;
  name: string;
  taskId: string;
  prompt: string;
}

interface SavedPromptsProps {
  prompts: SavedPrompt[];
  onLoad: (promptId: string) => void;
  onDelete: (promptId: string) => void;
}

export function SavedPrompts({ prompts, onLoad, onDelete }: SavedPromptsProps) {
  if (prompts.length === 0) return null;

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Star size={18} weight="fill" className="text-accent" />
        Saved Prompts
      </h4>
      <div className="space-y-2">
        {prompts.slice(0, 5).map((saved) => (
          <div
            key={saved.id}
            className="flex items-center justify-between p-2 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
          >
            <button
              onClick={() => onLoad(saved.id)}
              className="flex-1 text-left text-sm truncate"
            >
              {saved.name}
            </button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(saved.id)}>
              <Trash size={14} />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
