import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Fire, Flame, CalendarCheck, TrendUp, Trophy } from '@phosphor-icons/react'
import { useAchievements } from '@/hooks/use-achievements'
import { motion } from 'framer-motion'

export function StreakTracker() {
  const { stats } = useAchievements()
  
  const currentStreak = stats.currentStreak || 0
  const longestStreak = stats.longestStreak || 0
  const daysActive = (stats.daysActive || []).length

  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { label: 'Legendary', color: 'text-purple-400', bgColor: 'bg-purple-500/20' }
    if (streak >= 14) return { label: 'On Fire', color: 'text-orange-400', bgColor: 'bg-orange-500/20' }
    if (streak >= 7) return { label: 'Hot Streak', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
    if (streak >= 3) return { label: 'Getting Warm', color: 'text-accent', bgColor: 'bg-accent/20' }
    return { label: 'Just Started', color: 'text-muted-foreground', bgColor: 'bg-muted' }
  }

  const level = getStreakLevel(currentStreak)

  const getLast7Days = () => {
    const days: Array<{
      date: number
      dayName: string
      isActive: boolean
      isToday: boolean
    }> = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      
      const isActive = stats.daysActive?.some(timestamp => {
        const activeDate = new Date(timestamp).toDateString()
        return activeDate === dateStr
      })
      
      days.push({
        date: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isActive,
        isToday: dateStr === today.toDateString()
      })
    }
    
    return days
  }

  const last7Days = getLast7Days()

  return (
    <Card className="p-6 bg-linear-to-br from-orange-500/10 via-yellow-500/10 to-accent/10 border-orange-500/30 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl" />
      
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
                repeatType: 'loop'
              }}
              className={`p-3 rounded-xl ${level.bgColor}`}
            >
              <Fire
                className={level.color}
                size={32}
                weight="fill"
              />
            </motion.div>
            
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
                {currentStreak > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    <Badge className={`${level.color} bg-transparent border-current`}>
                      {level.label}
                    </Badge>
                  </motion.div>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">Current learning streak</p>
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
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                  day.isActive
                    ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/30'
                    : 'bg-muted text-muted-foreground'
                } ${day.isToday ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}`}
              >
                {day.isActive ? (
                  <Fire size={20} weight="fill" />
                ) : (
                  day.date
                )}
              </div>
              <span className="text-xs text-muted-foreground mt-1">{day.dayName}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="text-orange-400" size={16} weight="fill" />
              <div className="text-2xl font-bold text-orange-400">{longestStreak}</div>
            </div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CalendarCheck className="text-accent" size={16} weight="fill" />
              <div className="text-2xl font-bold text-accent">{daysActive}</div>
            </div>
            <div className="text-xs text-muted-foreground">Days Active</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="text-yellow-400" size={16} weight="fill" />
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round((currentStreak / Math.max(longestStreak, 1)) * 100)}%
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Of Best</div>
          </div>
        </div>

        {currentStreak === 0 && (
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Complete a lesson or use the playground today to start your streak! 🚀
            </p>
          </div>
        )}

        {currentStreak > 0 && currentStreak < 3 && (
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-center">
            <p className="text-sm text-foreground">
              Keep going! {3 - currentStreak} more day{3 - currentStreak !== 1 ? 's' : ''} to unlock the "Early Bird" achievement! 🎯
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
