import { useLocalStorage } from './useLocalStorage';
import { Achievement } from '@/types/workout';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Custom hook for managing achievements (with translations)
 */
export function useAchievements() {
  const { t } = useLanguage();

  // Dynamically translated achievement definitions
  const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = useMemo(() => [
    {
      id: 'first-workout',
      name: t.achievements.achievements.firstSteps,
      description: t.achievements.achievements.firstStepsDesc,
      icon: '🎯',
      target: 1,
    },
    {
      id: 'week-streak',
      name: t.achievements.achievements.weekWarrior,
      description: t.achievements.achievements.weekWarriorDesc,
      icon: '🔥',
      target: 7,
    },
    {
      id: 'month-streak',
      name: t.achievements.achievements.monthlyMaster,
      description: t.achievements.achievements.monthlyMasterDesc,
      icon: '💪',
      target: 30,
    },
    {
      id: '10-workouts',
      name: t.achievements.achievements.gettingStarted,
      description: t.achievements.achievements.gettingStartedDesc,
      icon: '⭐',
      target: 10,
    },
    {
      id: '50-workouts',
      name: t.achievements.achievements.dedicated,
      description: t.achievements.achievements.dedicatedDesc,
      icon: '🏆',
      target: 50,
    },
    {
      id: '100-workouts',
      name: t.achievements.achievements.centurion,
      description: t.achievements.achievements.centurionDesc,
      icon: '👑',
      target: 100,
    },
    {
      id: '10k-volume',
      name: t.achievements.achievements.ironMover,
      description: t.achievements.achievements.ironMoverDesc,
      icon: '🏋️',
      target: 10000,
    },
    {
      id: '50k-volume',
      name: t.achievements.achievements.volumeKing,
      description: t.achievements.achievements.volumeKingDesc,
      icon: '💎',
      target: 50000,
    },
    {
      id: '100k-volume',
      name: t.achievements.achievements.mountainMover,
      description: t.achievements.achievements.mountainMoverDesc,
      icon: '⛰️',
      target: 100000,
    },
  ], [t]);

  // Local storage state
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>(
    'achievements',
    ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      unlocked: false,
      progress: 0,
    }))
  );

  // Update achievements when stats change
  const checkAchievements = useCallback((stats: {
    totalWorkouts: number;
    totalVolume: number;
    currentStreak: number;
  }) => {
    setAchievements(prevAchievements => {
      const updated = prevAchievements.map(achievement => {
        if (achievement.unlocked) return achievement;

        let progress = 0;
        let shouldUnlock = false;

        if (achievement.id.includes('workout')) {
          progress = stats.totalWorkouts;
          shouldUnlock = stats.totalWorkouts >= (achievement.target || 0);
        } else if (achievement.id.includes('streak')) {
          progress = stats.currentStreak;
          shouldUnlock = stats.currentStreak >= (achievement.target || 0);
        } else if (achievement.id.includes('volume')) {
          progress = stats.totalVolume;
          shouldUnlock = stats.totalVolume >= (achievement.target || 0);
        }

        if (shouldUnlock) {
          toast.success(t.achievements.achievementUnlocked.replace('{name}', achievement.name), {
            description: achievement.description,
            duration: 5000,
          });

          return {
            ...achievement,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
            progress,
          };
        }

        return { ...achievement, progress };
      });

      const changed = updated.some((a, i) =>
        a.unlocked !== prevAchievements[i].unlocked ||
        a.progress !== prevAchievements[i].progress
      );

      return changed ? updated : prevAchievements;
    });
  }, [setAchievements, t]);

  // Helpers
  const getUnlockedCount = () => achievements.filter(a => a.unlocked).length;

  const getProgressPercentage = (achievement: Achievement) => {
    if (!achievement.target) return 0;
    return Math.min(100, Math.round(((achievement.progress || 0) / achievement.target) * 100));
  };

  return {
    achievements,
    checkAchievements,
    getUnlockedCount,
    getProgressPercentage,
  };
}
