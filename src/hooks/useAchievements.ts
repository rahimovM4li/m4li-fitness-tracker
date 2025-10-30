import { useLocalStorage } from './useLocalStorage';
import { Achievement } from '@/types/workout';
import { useCallback } from 'react';
import { toast } from 'sonner';

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first-workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    icon: '🎯',
    target: 1,
  },
  {
    id: 'week-streak',
    name: 'Week Warrior',
    description: 'Train 7 days in a row',
    icon: '🔥',
    target: 7,
  },
  {
    id: 'month-streak',
    name: 'Monthly Master',
    description: 'Train 30 days in a row',
    icon: '💪',
    target: 30,
  },
  {
    id: '10-workouts',
    name: 'Getting Started',
    description: 'Complete 10 workouts',
    icon: '⭐',
    target: 10,
  },
  {
    id: '50-workouts',
    name: 'Dedicated',
    description: 'Complete 50 workouts',
    icon: '🏆',
    target: 50,
  },
  {
    id: '100-workouts',
    name: 'Centurion',
    description: 'Complete 100 workouts',
    icon: '👑',
    target: 100,
  },
  {
    id: '10k-volume',
    name: 'Iron Mover',
    description: 'Lift 10,000 kg total',
    icon: '🏋️',
    target: 10000,
  },
  {
    id: '50k-volume',
    name: 'Volume King',
    description: 'Lift 50,000 kg total',
    icon: '💎',
    target: 50000,
  },
  {
    id: '100k-volume',
    name: 'Mountain Mover',
    description: 'Lift 100,000 kg total',
    icon: '⛰️',
    target: 100000,
  },
];

/**
 * Custom hook for managing achievements
 */
export function useAchievements() {
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>(
    'achievements',
    ACHIEVEMENT_DEFINITIONS.map(def => ({ ...def, unlocked: false, progress: 0 }))
  );

  const checkAchievements = useCallback((stats: {
    totalWorkouts: number;
    totalVolume: number;
    currentStreak: number;
  }) => {
    setAchievements(prevAchievements => {
      const updatedAchievements = prevAchievements.map(achievement => {
        if (achievement.unlocked) return achievement;

        let progress = 0;
        let shouldUnlock = false;

        // Check based on achievement type
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
          // Show toast notification for newly unlocked achievement
          toast.success(`🎉 Achievement Unlocked: ${achievement.name}!`, {
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

      // Only update if something actually changed
      const hasChanges = updatedAchievements.some((ach, idx) => 
        ach.progress !== prevAchievements[idx].progress || 
        ach.unlocked !== prevAchievements[idx].unlocked
      );

      return hasChanges ? updatedAchievements : prevAchievements;
    });
  }, [setAchievements]);

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
