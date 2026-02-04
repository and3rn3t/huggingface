import { Card } from '@/components/ui/card';

interface PlaygroundStatsProps {
  totalRuns: number;
  savedPrompts: number;
}

export function PlaygroundStats({ totalRuns, savedPrompts }: PlaygroundStatsProps) {
  return (
    <Card className="p-4 bg-linear-to-br from-primary/10 to-accent/10 border-primary/30">
      <h4 className="font-semibold mb-3">Quick Stats</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-2xl font-bold text-accent">{totalRuns}</div>
          <div className="text-xs text-muted-foreground">Total Runs</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-accent">{savedPrompts}</div>
          <div className="text-xs text-muted-foreground">Saved Prompts</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">130K+</div>
          <div className="text-xs text-muted-foreground">Models</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">150+</div>
          <div className="text-xs text-muted-foreground">Tasks</div>
        </div>
      </div>
    </Card>
  );
}
