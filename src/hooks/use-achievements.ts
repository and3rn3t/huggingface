import { useKV } from '@github/spark/hooks'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'explorer' | 'learner' | 'experimenter' | 'master' | 'streak'
  unlockedAt?: number
  progress: number
  requirement: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

export interface UserStats {
  totalPlaygroundRuns: number
  totalFavorites: number
  lessonsCompleted: number
  quizzesPassed: number
  modelComparisons: number
  daysActive: number[]
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
}

const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'GraduationCap',
    category: 'learner',
    requirement: 1,
    tier: 'bronze'
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 3 lessons',
    icon: 'Book',
    category: 'learner',
    requirement: 3,
    tier: 'silver'
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete all 5 lessons',
    icon: 'BookOpen',
    category: 'learner',
    requirement: 5,
    tier: 'gold'
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Pass all lesson quizzes',
    icon: 'Brain',
    category: 'learner',
    requirement: 5,
    tier: 'platinum'
  },
  {
    id: 'first-experiment',
    name: 'First Experiment',
    description: 'Run your first playground task',
    icon: 'Flask',
    category: 'experimenter',
    requirement: 1,
    tier: 'bronze'
  },
  {
    id: 'api-explorer',
    name: 'API Explorer',
    description: 'Execute 10 playground tasks',
    icon: 'Cpu',
    category: 'experimenter',
    requirement: 10,
    tier: 'silver'
  },
  {
    id: 'power-user',
    name: 'Power User',
    description: 'Execute 50 playground tasks',
    icon: 'Lightning',
    category: 'experimenter',
    requirement: 50,
    tier: 'gold'
  },
  {
    id: 'api-master',
    name: 'API Master',
    description: 'Execute 100 playground tasks',
    icon: 'Crown',
    category: 'experimenter',
    requirement: 100,
    tier: 'platinum'
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Save 5 favorites',
    icon: 'Heart',
    category: 'explorer',
    requirement: 5,
    tier: 'bronze'
  },
  {
    id: 'curator',
    name: 'Curator',
    description: 'Save 15 favorites',
    icon: 'Star',
    category: 'explorer',
    requirement: 15,
    tier: 'silver'
  },
  {
    id: 'comparison-expert',
    name: 'Comparison Expert',
    description: 'Compare 5 different models',
    icon: 'ArrowsLeftRight',
    category: 'explorer',
    requirement: 5,
    tier: 'silver'
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Maintain a 3-day learning streak',
    icon: 'Fire',
    category: 'streak',
    requirement: 3,
    tier: 'bronze'
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Maintain a 7-day learning streak',
    icon: 'Flame',
    category: 'streak',
    requirement: 7,
    tier: 'silver'
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 14-day learning streak',
    icon: 'Lightning',
    category: 'streak',
    requirement: 14,
    tier: 'gold'
  },
  {
    id: 'legendary',
    name: 'Legendary',
    description: 'Maintain a 30-day learning streak',
    icon: 'Crown',
    category: 'streak',
    requirement: 30,
    tier: 'platinum'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Pass all quizzes on first try',
    icon: 'Target',
    category: 'master',
    requirement: 1,
    tier: 'platinum'
  }
]

export function useAchievements() {
  const [achievements = [], setAchievements] = useKV<Achievement[]>('user-achievements', [])
  const [stats = {
    totalPlaygroundRuns: 0,
    totalFavorites: 0,
    lessonsCompleted: 0,
    quizzesPassed: 0,
    modelComparisons: 0,
    daysActive: [],
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: ''
  }, setStats] = useKV<UserStats>('user-stats', {
    totalPlaygroundRuns: 0,
    totalFavorites: 0,
    lessonsCompleted: 0,
    quizzesPassed: 0,
    modelComparisons: 0,
    daysActive: [],
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: ''
  })

  const initializeAchievements = useCallback(() => {
    setAchievements((current = []) => {
      if (current.length === 0) {
        return ACHIEVEMENTS.map(a => ({
          ...a,
          progress: 0
        }))
      }
      return current
    })
  }, [setAchievements])

  useEffect(() => {
    initializeAchievements()
  }, [initializeAchievements])

  const updateStreak = useCallback(() => {
    const today = new Date().toDateString()
    
    setStats((current = {
      totalPlaygroundRuns: 0,
      totalFavorites: 0,
      lessonsCompleted: 0,
      quizzesPassed: 0,
      modelComparisons: 0,
      daysActive: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: ''
    }) => {
      if (current.lastActiveDate === today) {
        return current
      }

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toDateString()

      const newDaysActive = [...(current.daysActive || []), Date.now()]
      let newStreak = current.currentStreak || 0

      if (current.lastActiveDate === yesterdayStr) {
        newStreak += 1
      } else if (current.lastActiveDate !== today) {
        newStreak = 1
      }

      const newLongestStreak = Math.max(newStreak, current.longestStreak || 0)

      return {
        ...current,
        daysActive: newDaysActive,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: today
      }
    })
  }, [setStats])

  const checkAndUnlockAchievement = useCallback((achievementId: string, currentProgress: number) => {
    setAchievements((current = []) => {
      const achievement = current.find(a => a.id === achievementId)
      if (!achievement) return current

      if (achievement.unlockedAt) return current

      if (currentProgress >= achievement.requirement) {
        const unlocked = current.map(a =>
          a.id === achievementId
            ? { ...a, progress: currentProgress, unlockedAt: Date.now() }
            : a
        )

        toast.success('Achievement Unlocked!', {
          description: `${achievement.name} - ${achievement.description}`,
          duration: 5000
        })

        return unlocked
      }

      return current.map(a =>
        a.id === achievementId
          ? { ...a, progress: currentProgress }
          : a
      )
    })
  }, [setAchievements])

  const trackPlaygroundRun = useCallback(() => {
    updateStreak()
    setStats((current = {
      totalPlaygroundRuns: 0,
      totalFavorites: 0,
      lessonsCompleted: 0,
      quizzesPassed: 0,
      modelComparisons: 0,
      daysActive: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: ''
    }) => {
      const newCount = (current.totalPlaygroundRuns || 0) + 1
      checkAndUnlockAchievement('first-experiment', newCount)
      checkAndUnlockAchievement('api-explorer', newCount)
      checkAndUnlockAchievement('power-user', newCount)
      checkAndUnlockAchievement('api-master', newCount)
      
      return { ...current, totalPlaygroundRuns: newCount }
    })
  }, [setStats, updateStreak, checkAndUnlockAchievement])

  const trackFavorite = useCallback((count: number) => {
    setStats((current = {
      totalPlaygroundRuns: 0,
      totalFavorites: 0,
      lessonsCompleted: 0,
      quizzesPassed: 0,
      modelComparisons: 0,
      daysActive: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: ''
    }) => {
      checkAndUnlockAchievement('collector', count)
      checkAndUnlockAchievement('curator', count)
      
      return { ...current, totalFavorites: count }
    })
  }, [setStats, checkAndUnlockAchievement])

  const trackLessonComplete = useCallback((count: number) => {
    updateStreak()
    setStats((current = {
      totalPlaygroundRuns: 0,
      totalFavorites: 0,
      lessonsCompleted: 0,
      quizzesPassed: 0,
      modelComparisons: 0,
      daysActive: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: ''
    }) => {
      checkAndUnlockAchievement('first-steps', count)
      checkAndUnlockAchievement('knowledge-seeker', count)
      checkAndUnlockAchievement('scholar', count)
      
      return { ...current, lessonsCompleted: count }
    })
  }, [setStats, updateStreak, checkAndUnlockAchievement])

  const trackQuizPass = useCallback((count: number) => {
    setStats((current = {
      totalPlaygroundRuns: 0,
      totalFavorites: 0,
      lessonsCompleted: 0,
      quizzesPassed: 0,
      modelComparisons: 0,
      daysActive: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: ''
    }) => {
      checkAndUnlockAchievement('quiz-master', count)
      
      return { ...current, quizzesPassed: count }
    })
  }, [setStats, checkAndUnlockAchievement])

  const trackComparison = useCallback(() => {
    setStats((current = {
      totalPlaygroundRuns: 0,
      totalFavorites: 0,
      lessonsCompleted: 0,
      quizzesPassed: 0,
      modelComparisons: 0,
      daysActive: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: ''
    }) => {
      const newCount = (current.modelComparisons || 0) + 1
      checkAndUnlockAchievement('comparison-expert', newCount)
      
      return { ...current, modelComparisons: newCount }
    })
  }, [setStats, checkAndUnlockAchievement])

  useEffect(() => {
    const streak = stats.currentStreak || 0
    checkAndUnlockAchievement('early-bird', streak)
    checkAndUnlockAchievement('dedicated', streak)
    checkAndUnlockAchievement('unstoppable', streak)
    checkAndUnlockAchievement('legendary', streak)
  }, [stats.currentStreak, checkAndUnlockAchievement])

  const getUnlockedCount = useCallback(() => {
    return achievements.filter(a => a.unlockedAt).length
  }, [achievements])

  const getTotalCount = useCallback(() => {
    return ACHIEVEMENTS.length
  }, [])

  const getAchievementsByCategory = useCallback((category: Achievement['category']) => {
    return achievements.filter(a => a.category === category)
  }, [achievements])

  return {
    achievements,
    stats,
    trackPlaygroundRun,
    trackFavorite,
    trackLessonComplete,
    trackQuizPass,
    trackComparison,
    updateStreak,
    getUnlockedCount,
    getTotalCount,
    getAchievementsByCategory
  }
}
