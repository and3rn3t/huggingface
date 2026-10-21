import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fire, Flame, CalendarCheck, TrendUp, Trophy } from '@phosphor-icons/react';
import { useAchievements } from '@/hooks/use-achievements';
import { motion } from 'framer-motion';

export function StreakTracker() {
  const { stats } = useAchievements();

  const currentStreak = stats.currentStreak || 0;
  const longestStreak = stats.longestStreak || 0;
  const daysActive = (stats.daysActive || []).length;

  const getStreakLevel = (streak: number) => {
    if (streak >= 30)
      return { label: 'Legendary', color: 'text-purple-400', bgColor: 'bg-purple-500/20' };
    if (streak >= 14)
      return { label: 'On Fire', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    if (streak >= 7)
      return { label: 'Hot Streak', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (streak >= 3)
      return { label: 'Getting Warm', color: 'text-accent', bgColor: 'bg-accent/20' };
    return { label: 'Just Started', color: 'text-muted-foreground', bgColor: 'bg-muted' };
  };

  const level = getStreakLevel(currentStreak);

  const getLast7Days = () => {
    const days: Array<{
      date: number;
      dayName: string;
      isActive: boolean;
      isToday: boolean;
    }> = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();

      const isActive = stats.daysActive?.some((timestamp) => {
        const activeDate = new Date(timestamp).toDateString();
        return activeDate === dateStr;
      });

      days.push({
        date: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isActive,
        isToday: dateStr === today.toDateString(),
      });
    }

    return days;
  };

  const last7Days = getLast7Days();

  return (
    <Card className="to-accent/10 relative overflow-hidden border-orange-500/30 bg-linear-to-br from-orange-500/10 via-yellow-500/10 p-6">
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-yellow-500/20 blur-3xl" />

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: currentStreak > 0 ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: currentStreak > 0 ? Infinity : 0,
                repeatType: 'loop',
              }}
              className={`rounded-xl p-3 ${level.bgColor}`}
            >
              <Fire className={level.color} size={32} weight="fill" />
            </motion.div>

            <div>
              <h3 className="flex items-center gap-2 text-2xl font-bold">
                {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
                {currentStreak > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    <Badge className={`${level.color} border-current bg-transparent`}>
                      {level.label}
                    </Badge>
                  </motion.div>
                )}
              </h3>
              <p className="text-muted-foreground text-sm">Current learning streak</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((day, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col items-center"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                  day.isActive
                    ? 'bg-accent text-accent-foreground shadow-accent/30 shadow-lg'
                    : 'bg-muted text-muted-foreground'
                } ${day.isToday ? 'ring-accent ring-offset-background ring-2 ring-offset-2' : ''}`}
              >
                {day.isActive ? <Fire size={20} weight="fill" /> : day.date}
              </div>
              <span className="text-muted-foreground mt-1 text-xs">{day.dayName}</span>
            </motion.div>
          ))}
        </div>

        <div className="border-border/50 grid grid-cols-3 gap-4 border-t pt-4">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Flame className="text-orange-400" size={16} weight="fill" />
              <div className="text-2xl font-bold text-orange-400">{longestStreak}</div>
            </div>
            <div className="text-muted-foreground text-xs">Best Streak</div>
          </div>

          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <CalendarCheck className="text-accent" size={16} weight="fill" />
              <div className="text-accent text-2xl font-bold">{daysActive}</div>
            </div>
            <div className="text-muted-foreground text-xs">Days Active</div>
          </div>

          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Trophy className="text-yellow-400" size={16} weight="fill" />
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round((currentStreak / Math.max(longestStreak, 1)) * 100)}%
              </div>
            </div>
            <div className="text-muted-foreground text-xs">Of Best</div>
          </div>
        </div>

        {currentStreak === 0 && (
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-muted-foreground text-sm">
              Complete a lesson or use the playground today to start your streak! 🚀
            </p>
          </div>
        )}

        {currentStreak > 0 && currentStreak < 3 && (
          <div className="bg-accent/10 border-accent/30 rounded-lg border p-3 text-center">
            <p className="text-foreground text-sm">
              Keep going! {3 - currentStreak} more day{3 - currentStreak !== 1 ? 's' : ''} to unlock
              the "Early Bird" achievement! 🎯
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
