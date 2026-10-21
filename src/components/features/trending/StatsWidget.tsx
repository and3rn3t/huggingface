import { Card } from '@/components/ui/card';
import { Fire, Trophy } from '@phosphor-icons/react';
import { useAchievements } from '@/hooks/use-achievements';
import { motion } from 'framer-motion';
import { memo } from 'react';

function StatsWidgetComponent() {
  const { stats, getUnlockedCount, getTotalCount } = useAchievements();

  const currentStreak = stats.currentStreak || 0;
  const unlockedCount = getUnlockedCount();

  return (
    <div className="flex items-center gap-3">
      {currentStreak > 0 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <Card className="flex items-center gap-2 border-orange-500/50 bg-linear-to-r from-orange-500/20 to-yellow-500/20 px-3 py-1.5">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop',
              }}
            >
              <Fire className="text-orange-400" size={18} weight="fill" />
            </motion.div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-orange-400">{currentStreak}</span>
              <span className="text-muted-foreground text-xs">
                day{currentStreak !== 1 ? 's' : ''}
              </span>
            </div>
          </Card>
        </motion.div>
      )}

      <Card className="from-accent/20 to-primary/20 border-accent/50 flex items-center gap-2 bg-linear-to-r px-3 py-1.5">
        <Trophy className="text-accent" size={18} weight="fill" />
        <div className="flex items-baseline gap-1">
          <span className="text-accent text-lg font-bold">{unlockedCount}</span>
          <span className="text-muted-foreground text-xs">/ {getTotalCount()}</span>
        </div>
      </Card>
    </div>
  );
}

export const StatsWidget = memo(StatsWidgetComponent);
