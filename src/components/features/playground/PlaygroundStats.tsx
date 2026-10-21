import { Card } from '@/components/ui/card';

interface PlaygroundStatsProps {
  totalRuns: number;
  savedPrompts: number;
}

export function PlaygroundStats({ totalRuns, savedPrompts }: PlaygroundStatsProps) {
  return (
    <Card className="from-primary/10 to-accent/10 border-primary/30 bg-linear-to-br p-4">
      <h4 className="mb-3 font-semibold">Quick Stats</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-accent text-2xl font-bold">{totalRuns}</div>
          <div className="text-muted-foreground text-xs">Total Runs</div>
        </div>
        <div>
          <div className="text-accent text-2xl font-bold">{savedPrompts}</div>
          <div className="text-muted-foreground text-xs">Saved Prompts</div>
        </div>
        <div>
          <div className="text-primary text-2xl font-bold">130K+</div>
          <div className="text-muted-foreground text-xs">Models</div>
        </div>
        <div>
          <div className="text-primary text-2xl font-bold">150+</div>
          <div className="text-muted-foreground text-xs">Tasks</div>
        </div>
      </div>
    </Card>
  );
}
