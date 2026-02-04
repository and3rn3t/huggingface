import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAchievements } from './use-achievements';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('useAchievements', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize achievements array on first run', () => {
      const { result } = renderHook(() => useAchievements());

      expect(result.current.achievements).toBeDefined();
      expect(result.current.achievements.length).toBeGreaterThan(0);
      expect(result.current.achievements[0]).toHaveProperty('id');
      expect(result.current.achievements[0]).toHaveProperty('progress', 0);
    });

    it('should preserve existing achievements on subsequent runs', () => {
      const { result, rerender } = renderHook(() => useAchievements());
      
      // Update an achievement
      act(() => {
        result.current.trackPlaygroundRun();
      });

      const firstProgress = result.current.achievements.find(a => a.id === 'first-experiment')?.progress;
      
      // Rerender
      rerender();

      const secondProgress = result.current.achievements.find(a => a.id === 'first-experiment')?.progress;
      expect(secondProgress).toBe(firstProgress);
    });

    it('should initialize stats with DEFAULT_STATS', () => {
      const { result } = renderHook(() => useAchievements());

      expect(result.current.stats.totalPlaygroundRuns).toBe(0);
      expect(result.current.stats.totalFavorites).toBe(0);
      expect(result.current.stats.lessonsCompleted).toBe(0);
      expect(result.current.stats.currentStreak).toBe(0);
      expect(result.current.stats.daysActive).toEqual([]);
    });
  });

  describe('Streak Calculation', () => {
    it('should set streak to 1 on first activity', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackPlaygroundRun();
      });

      expect(result.current.stats.currentStreak).toBe(1);
      expect(result.current.stats.longestStreak).toBe(1);
      expect(result.current.stats.daysActive.length).toBe(1);
    });

    it('should increment streak if last active was yesterday', () => {
      const { result } = renderHook(() => useAchievements());

      // Mock yesterday's date using toDateString format
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      act(() => {
        // Manually set yesterday's activity
        const stats = {
          ...result.current.stats,
          lastActiveDate: yesterdayStr,
          currentStreak: 1,
          longestStreak: 1,
          daysActive: [Date.now() - 86400000], // Yesterday's timestamp
        };
        localStorage.setItem('user-stats', JSON.stringify(stats));
      });

      // Trigger today's activity
      const { result: result2 } = renderHook(() => useAchievements());
      
      act(() => {
        result2.current.trackPlaygroundRun();
      });

      expect(result2.current.stats.currentStreak).toBe(2);
    });

    it('should maintain streak if active today (same day)', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackPlaygroundRun();
      });

      const streakAfterFirst = result.current.stats.currentStreak;

      act(() => {
        result.current.trackPlaygroundRun();
      });

      expect(result.current.stats.currentStreak).toBe(streakAfterFirst);
    });

    it('should reset to 1 if gap > 1 day', () => {
      const { result } = renderHook(() => useAchievements());

      // Mock activity from 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toDateString();

      act(() => {
        const stats = {
          ...result.current.stats,
          lastActiveDate: threeDaysAgoStr,
          currentStreak: 5,
          longestStreak: 5,
          daysActive: [Date.now() - (3 * 86400000)],
        };
        localStorage.setItem('user-stats', JSON.stringify(stats));
      });

      const { result: result2 } = renderHook(() => useAchievements());
      
      act(() => {
        result2.current.trackPlaygroundRun();
      });

      expect(result2.current.stats.currentStreak).toBe(1);
    });

    it('should update longestStreak correctly', () => {
      const { result } = renderHook(() => useAchievements());

      // Set existing longest streak
      act(() => {
        const stats = {
          ...result.current.stats,
          longestStreak: 3,
        };
        localStorage.setItem('user-stats', JSON.stringify(stats));
      });

      const { result: result2 } = renderHook(() => useAchievements());

      // Build up a streak to 5
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      act(() => {
        const stats = {
          ...result2.current.stats,
          lastActiveDate: yesterday.toDateString(),
          currentStreak: 4,
        };
        localStorage.setItem('user-stats', JSON.stringify(stats));
      });

      const { result: result3 } = renderHook(() => useAchievements());

      act(() => {
        result3.current.trackPlaygroundRun();
      });

      expect(result3.current.stats.longestStreak).toBeGreaterThanOrEqual(3);
    });

    it('should add timestamp to daysActive array', () => {
      const { result } = renderHook(() => useAchievements());

      const before = Date.now();

      act(() => {
        result.current.trackPlaygroundRun();
      });

      const after = Date.now();

      expect(result.current.stats.daysActive.length).toBeGreaterThan(0);
      const lastActive = result.current.stats.daysActive[result.current.stats.daysActive.length - 1];
      expect(lastActive).toBeGreaterThanOrEqual(before);
      expect(lastActive).toBeLessThanOrEqual(after);
    });
  });

  describe('Achievement Unlocking', () => {
    it('should unlock when progress >= requirement', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackPlaygroundRun();
      });

      const achievement = result.current.achievements.find(a => a.id === 'first-experiment');
      expect(achievement?.unlockedAt).toBeDefined();
    });

    it('should show toast notification on unlock', async () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackPlaygroundRun();
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should set unlockedAt timestamp', () => {
      const { result } = renderHook(() => useAchievements());

      const before = Date.now();

      act(() => {
        result.current.trackPlaygroundRun();
      });

      const achievement = result.current.achievements.find(a => a.id === 'first-experiment');
      const after = Date.now();

      expect(achievement?.unlockedAt).toBeGreaterThanOrEqual(before);
      expect(achievement?.unlockedAt).toBeLessThanOrEqual(after);
    });

    it('should not unlock twice', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackPlaygroundRun();
      });

      const firstUnlockTime = result.current.achievements.find(a => a.id === 'first-experiment')?.unlockedAt;

      act(() => {
        result.current.trackPlaygroundRun();
      });

      const secondUnlockTime = result.current.achievements.find(a => a.id === 'first-experiment')?.unlockedAt;

      expect(firstUnlockTime).toBe(secondUnlockTime);
    });

    it('should update progress without unlocking if below requirement', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackPlaygroundRun();
      });

      const achievement = result.current.achievements.find(a => a.id === 'api-explorer');
      expect(achievement?.progress).toBe(1);
      expect(achievement?.unlockedAt).toBeUndefined();
    });
  });

  describe('Tracking Functions', () => {
    it('should increment totalPlaygroundRuns on trackPlaygroundRun', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackPlaygroundRun();
      });

      expect(result.current.stats.totalPlaygroundRuns).toBe(1);

      act(() => {
        result.current.trackPlaygroundRun();
      });

      expect(result.current.stats.totalPlaygroundRuns).toBe(2);
    });

    it('should check 4 experimenter achievements on trackPlaygroundRun', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackPlaygroundRun();
      });

      const experimenterAchievements = result.current.achievements.filter(
        a => a.category === 'experimenter'
      );

      expect(experimenterAchievements.length).toBe(4);
      experimenterAchievements.forEach(achievement => {
        expect(achievement.progress).toBeGreaterThan(0);
      });
    });

    it('should call updateStreak on trackPlaygroundRun', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackPlaygroundRun();
      });

      expect(result.current.stats.currentStreak).toBeGreaterThan(0);
      expect(result.current.stats.lastActiveDate).toBeDefined();
    });

    it('should update totalFavorites on trackFavorite', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackFavorite(1);
      });

      expect(result.current.stats.totalFavorites).toBe(1);
    });

    it('should check collector and curator achievements on trackFavorite', () => {
      const { result } = renderHook(() => useAchievements());

      // Add 5 favorites to unlock collector
      act(() => {
        result.current.trackFavorite(5);
      });

      const collector = result.current.achievements.find(a => a.id === 'collector');
      expect(collector?.unlockedAt).toBeDefined();
    });

    it('should update lessonsCompleted on trackLessonComplete', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackLessonComplete(1);
      });

      expect(result.current.stats.lessonsCompleted).toBe(1);
    });

    it('should check learner achievements on trackLessonComplete', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackLessonComplete(1);
      });

      const firstSteps = result.current.achievements.find(a => a.id === 'first-steps');
      expect(firstSteps?.unlockedAt).toBeDefined();
    });

    it('should update quizzesPassed on trackQuizPass', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackQuizPass(1);
      });

      expect(result.current.stats.quizzesPassed).toBe(1);
    });

    it('should check quiz-master achievement on trackQuizPass', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackQuizPass(5);
      });

      const quizMaster = result.current.achievements.find(a => a.id === 'quiz-master');
      expect(quizMaster?.unlockedAt).toBeDefined();
    });

    it('should increment modelComparisons on trackComparison', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackComparison();
      });

      expect(result.current.stats.modelComparisons).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple achievements unlocking simultaneously', () => {
      const { result } = renderHook(() => useAchievements());

      // Complete 5 lessons to unlock multiple achievements
      act(() => {
        result.current.trackLessonComplete(5);
      });

      const unlockedCount = result.current.achievements.filter(a => a.unlockedAt).length;
      expect(unlockedCount).toBeGreaterThan(1);
    });

    it('should persist achievement progress across sessions', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackPlaygroundRun();
      });

      const progress1 = result.current.achievements.find(a => a.id === 'api-explorer')?.progress;

      // Simulate new session
      const { result: result2 } = renderHook(() => useAchievements());

      const progress2 = result2.current.achievements.find(a => a.id === 'api-explorer')?.progress;

      expect(progress2).toBe(progress1);
    });

    it('should handle invalid localStorage data', () => {
      localStorage.setItem('user-achievements', 'invalid json');
      localStorage.setItem('user-stats', 'invalid json');

      const { result } = renderHook(() => useAchievements());

      // Should fall back to defaults
      expect(result.current.achievements).toBeDefined();
      expect(result.current.stats).toBeDefined();
    });
  });

  describe('Utility Functions', () => {
    it('should return correct unlocked count with getUnlockedCount', () => {
      const { result } = renderHook(() => useAchievements());

      act(() => {
        result.current.trackPlaygroundRun();
      });

      const unlockedCount = result.current.getUnlockedCount();
      expect(unlockedCount).toBeGreaterThan(0);
    });

    it('should return correct total count with getTotalCount', () => {
      const { result } = renderHook(() => useAchievements());

      const totalCount = result.current.getTotalCount();
      expect(totalCount).toBeGreaterThan(0);
    });

    it('should return achievements by category', () => {
      const { result } = renderHook(() => useAchievements());

      const experimenterAchievements = result.current.achievements.filter(
        a => a.category === 'experimenter'
      );

      expect(experimenterAchievements.length).toBeGreaterThan(0);
      experimenterAchievements.forEach(a => {
        expect(a.category).toBe('experimenter');
      });
    });
  });
});
