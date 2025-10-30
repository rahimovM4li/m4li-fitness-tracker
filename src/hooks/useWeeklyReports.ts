import { useLocalStorage } from './useLocalStorage';
import { WeeklyReport, Workout } from '@/types/workout';
import { startOfWeek, endOfWeek, format, isWithinInterval } from 'date-fns';

/**
 * Custom hook for managing weekly reports
 */
export function useWeeklyReports() {
  const [reports, setReports] = useLocalStorage<WeeklyReport[]>('weekly-reports', []);

  const computeReport = (workouts: Workout[], targetDate?: Date): WeeklyReport => {
    const date = targetDate || new Date();
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday

    // Filter workouts for this week
    const weekWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return isWithinInterval(workoutDate, { start: weekStart, end: weekEnd });
    });

    // Calculate stats
    const totalWorkouts = weekWorkouts.length;
    
    const totalVolume = weekWorkouts.reduce((sum, workout) => {
      return sum + workout.exercises.reduce((exSum, exercise) => {
        return exSum + exercise.sets.reduce((setSum, set) => {
          return set.completed ? setSum + (set.reps * set.weight) : setSum;
        }, 0);
      }, 0);
    }, 0);

    // Calculate PRs (simplified: count unique exercises with max weight improvements)
    const exerciseMaxWeights = new Map<string, number>();
    weekWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const completedSets = exercise.sets.filter(s => s.completed);
        if (completedSets.length > 0) {
          const maxWeight = Math.max(...completedSets.map(s => s.weight));
          const currentMax = exerciseMaxWeights.get(exercise.exerciseId) || 0;
          if (maxWeight > currentMax) {
            exerciseMaxWeights.set(exercise.exerciseId, maxWeight);
          }
        }
      });
    });
    const personalRecords = exerciseMaxWeights.size;

    return {
      id: Date.now().toString(),
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      weekEnd: format(weekEnd, 'yyyy-MM-dd'),
      totalWorkouts,
      totalVolume,
      personalRecords,
      createdAt: new Date().toISOString(),
    };
  };

  const generateWeeklyReport = (workouts: Workout[], targetDate?: Date) => {
    const report = computeReport(workouts, targetDate);

    // Check if report for this week already exists
    const existingReportIndex = reports.findIndex(r => r.weekStart === report.weekStart);
    if (existingReportIndex >= 0) {
      const existing = reports[existingReportIndex];
      const changed =
        existing.weekEnd !== report.weekEnd ||
        existing.totalWorkouts !== report.totalWorkouts ||
        existing.totalVolume !== report.totalVolume ||
        existing.personalRecords !== report.personalRecords;

      if (!changed) return existing;

      const updatedReports = [...reports];
      updatedReports[existingReportIndex] = { ...existing, ...report };
      setReports(updatedReports);
      return updatedReports[existingReportIndex];
    } else {
      setReports([report, ...reports]);
      return report;
    }
  };

  const getCurrentWeekReport = (workouts: Workout[]) => computeReport(workouts);

  const getReportForWeek = (weekStart: string) => {
    return reports.find(r => r.weekStart === weekStart);
  };

  return {
    reports,
    generateWeeklyReport,
    getCurrentWeekReport,
    getReportForWeek,
  };
}
