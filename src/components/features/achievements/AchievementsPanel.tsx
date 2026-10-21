import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  GraduationCap,
  Book,
  BookOpen,
  Brain,
  Flask,
  Cpu,
  Lightning,
  Crown,
  Heart,
  Star,
  ArrowsLeftRight,
  Fire,
  Flame,
  Target,
  Sparkle,
} from '@phosphor-icons/react';
import { useAchievements, Achievement } from '@/hooks/use-achievements';
import { motion } from 'framer-motion';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  GraduationCap,
  Book,
  BookOpen,
  Brain,
  Flask,
  Cpu,
  Lightning,
  Crown,
  Heart,
  Star,
  ArrowsLeftRight,
  Fire,
  Flame,
  Target,
};

const TIER_COLORS = {
  bronze: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
  silver: 'bg-gray-300/20 border-gray-300/50 text-gray-200',
  gold: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
  platinum: 'bg-cyan-400/20 border-cyan-400/50 text-cyan-300',
};

const TIER_BADGE_COLORS = {
  bronze: 'bg-orange-500/30 text-orange-200 border-orange-500/50',
  silver: 'bg-gray-300/30 text-gray-100 border-gray-300/50',
  gold: 'bg-yellow-500/30 text-yellow-100 border-yellow-500/50',
  platinum: 'bg-cyan-400/30 text-cyan-100 border-cyan-400/50',
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = ICON_MAP[achievement.icon] || Trophy;
  const isUnlocked = !!achievement.unlockedAt;
  const progressPercent = (achievement.progress / achievement.requirement) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isUnlocked ? 1.05 : 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        className={`p-4 transition-all ${
          isUnlocked
            ? `${TIER_COLORS[achievement.tier]} shadow-lg`
            : 'bg-muted/30 border-border opacity-60 grayscale'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
              isUnlocked ? 'bg-accent/30 shadow-accent/20 shadow-md' : 'bg-muted'
            }`}
          >
            <Icon
              size={24}
              weight={isUnlocked ? 'fill' : 'regular'}
              className={isUnlocked ? 'text-accent' : 'text-muted-foreground'}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-start justify-between gap-2">
              <h4 className="text-sm leading-tight font-semibold">{achievement.name}</h4>
              <Badge
                variant="outline"
                className={`text-xs tracking-wide uppercase ${TIER_BADGE_COLORS[achievement.tier]}`}
              >
                {achievement.tier}
              </Badge>
            </div>

            <p className="text-muted-foreground mb-2 text-xs leading-relaxed">
              {achievement.description}
            </p>

            {!isUnlocked && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {achievement.progress} / {achievement.requirement}
                  </span>
                  <span className="text-muted-foreground font-medium">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <Progress value={progressPercent} className="h-1.5" />
              </div>
            )}

            {isUnlocked && (
              <div className="text-accent flex items-center gap-1 text-xs">
                <Sparkle size={12} weight="fill" />
                Unlocked {new Date(achievement.unlockedAt!).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function AchievementsPanel() {
  const { achievements, getUnlockedCount, getTotalCount, getAchievementsByCategory } =
    useAchievements();

  const unlockedCount = getUnlockedCount();
  const totalCount = getTotalCount();
  const completionPercent = (unlockedCount / totalCount) * 100;

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'learner', name: 'Learner', icon: GraduationCap },
    { id: 'experimenter', name: 'Experimenter', icon: Flask },
    { id: 'explorer', name: 'Explorer', icon: Star },
    { id: 'streak', name: 'Streaks', icon: Fire },
    { id: 'master', name: 'Master', icon: Crown },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="from-accent via-primary to-accent mb-2 bg-linear-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Achievements
          </h2>
          <p className="text-muted-foreground">Track your learning journey and unlock rewards</p>
        </div>

        <Card className="from-accent/20 to-primary/20 border-accent/50 min-w-[200px] bg-linear-to-br p-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent/30 rounded-lg p-2">
              <Trophy className="text-accent" size={28} weight="fill" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {unlockedCount}/{totalCount}
              </div>
              <div className="text-muted-foreground text-xs">Achievements</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="from-primary/10 to-accent/10 border-primary/30 bg-linear-to-br p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="text-accent" size={24} weight="fill" />
            <div>
              <h3 className="font-semibold">Overall Progress</h3>
              <p className="text-muted-foreground text-sm">
                {Math.round(completionPercent)}% Complete
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-accent text-sm font-medium">{unlockedCount} Unlocked</div>
          </div>
        </div>
        <Progress value={completionPercent} className="h-3" />
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-muted/50 grid w-full grid-cols-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const categoryAchievements =
              cat.id === 'all' ? achievements : getAchievementsByCategory(cat.id as any);
            const categoryUnlocked = categoryAchievements.filter((a) => a.unlockedAt).length;

            return (
              <TabsTrigger key={cat.id} value={cat.id} className="relative gap-2">
                <Icon size={16} />
                <span className="hidden sm:inline">{cat.name}</span>
                {categoryUnlocked > 0 && (
                  <span className="bg-accent text-accent-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
                    {categoryUnlocked}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((cat) => {
          const categoryAchievements =
            cat.id === 'all' ? achievements : getAchievementsByCategory(cat.id as any);

          const unlocked = categoryAchievements.filter((a) => a.unlockedAt);
          const locked = categoryAchievements.filter((a) => !a.unlockedAt);

          return (
            <TabsContent key={cat.id} value={cat.id} className="space-y-6">
              {unlocked.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-accent flex items-center gap-2 text-sm font-semibold">
                    <Sparkle size={16} weight="fill" />
                    Unlocked ({unlocked.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {unlocked.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </div>
              )}

              {locked.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
                    Locked ({locked.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {locked.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </div>
              )}

              {categoryAchievements.length === 0 && (
                <Card className="bg-muted/30 p-12 text-center">
                  <Trophy className="text-muted-foreground mx-auto mb-3" size={48} />
                  <p className="text-muted-foreground">No achievements in this category yet</p>
                </Card>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
