import { useLocalStorage } from './useLocalStorage';
import { Achievement } from '@/types/workout';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const ACHIEVEMENT_DEFINITIONS = (t: any): Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] => [
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
];

/**
 * Custom hook for managing achievements
 */
export function useAchievements() {
  const { t, language } = useLanguage();
  const achievementDefs = ACHIEVEMENT_DEFINITIONS(t);
  
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>(
    'achievements',
    achievementDefs.map(def => ({ ...def, unlocked: false, progress: 0 }))
  );

  // Update achievement translations when language changes
  useEffect(() => {
    const currentDefs = ACHIEVEMENT_DEFINITIONS(t);
    setAchievements(prevAchievements => {
      return prevAchievements.map(achievement => {
        const currentDef = currentDefs.find(d => d.id === achievement.id);
        if (currentDef) {
          return {
            ...achievement,
            name: currentDef.name,
            description: currentDef.description,
          };
        }
        return achievement;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const checkAchievements = useCallback((stats: {
    totalWorkouts: number;
    totalVolume: number;
    currentStreak: number;
  }) => {
    const currentDefs = ACHIEVEMENT_DEFINITIONS(t);
    setAchievements(prevAchievements => {
      const updatedAchievements = prevAchievements.map((achievement, idx) => {
        // Update name and description from current translations
        const currentDef = currentDefs.find(d => d.id === achievement.id);
        const baseAchievement = currentDef ? {
          ...achievement,
          name: currentDef.name,
          description: currentDef.description,
        } : achievement;
        if (baseAchievement.unlocked) return baseAchievement;

        let progress = 0;
        let shouldUnlock = false;

        // Check based on achievement type
        if (baseAchievement.id.includes('workout')) {
          progress = stats.totalWorkouts;
          shouldUnlock = stats.totalWorkouts >= (baseAchievement.target || 0);
        } else if (baseAchievement.id.includes('streak')) {
          progress = stats.currentStreak;
          shouldUnlock = stats.currentStreak >= (baseAchievement.target || 0);
        } else if (baseAchievement.id.includes('volume')) {
          progress = stats.totalVolume;
          shouldUnlock = stats.totalVolume >= (baseAchievement.target || 0);
        }

        if (shouldUnlock) {
          // Show toast notification for newly unlocked achievement
          toast.success(t.achievements.achievementUnlocked.replace('{name}', baseAchievement.name), {
            description: baseAchievement.description,
            duration: 5000,
          });

          return {
            ...baseAchievement,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
            progress,
          };
        }

        return { ...baseAchievement, progress };
      });

      // Only update if something actually changed
      const hasChanges = updatedAchievements.some((ach, idx) => 
        ach.progress !== prevAchievements[idx].progress || 
        ach.unlocked !== prevAchievements[idx].unlocked
      );

      return hasChanges ? updatedAchievements : prevAchievements;
    });
  }, [setAchievements, t]);

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
