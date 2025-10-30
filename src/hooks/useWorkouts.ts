import { useLocalStorage } from './useLocalStorage';
import { Workout, Exercise, ExerciseProgress } from '@/types/workout';
import { format } from 'date-fns';

/**
 * Custom hook for managing workouts in localStorage
 */
export function useWorkouts() {
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('workouts', []);
  const [exercises, setExercises] = useLocalStorage<Exercise[]>('exercises', [
    // Default exercises - names will be displayed based on current language
    { id: '1', name: 'Bankdrücken', category: 'Brust', createdAt: new Date().toISOString() },
    { id: '2', name: 'Kniebeugen', category: 'Beine', createdAt: new Date().toISOString() },
    { id: '3', name: 'Kreuzheben', category: 'Rücken', createdAt: new Date().toISOString() },
    { id: '4', name: 'Schulterdrücken', category: 'Schultern', createdAt: new Date().toISOString() },
    { id: '5', name: 'Klimmzüge', category: 'Rücken', createdAt: new Date().toISOString() },
  ]);

  // Add a new exercise
  const addExercise = (name: string, category: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name,
      category,
      createdAt: new Date().toISOString(),
    };
    setExercises([...exercises, newExercise]);
    return newExercise;
  };

  // Update an exercise
  const updateExercise = (id: string, name: string, category: string) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, name, category } : ex
    ));
  };

  // Delete an exercise
  const deleteExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  // Reorder exercises (for drag-and-drop)
  const reorderExercises = (newOrder: Exercise[]) => {
    setExercises(newOrder);
  };

  // Add a new workout
  const addWorkout = (workout: Workout) => {
    setWorkouts([...workouts, workout]);
  };

  // Update a workout
  const updateWorkout = (id: string, workout: Workout) => {
    setWorkouts(workouts.map(w => w.id === id ? workout : w));
  };

  // Delete a workout
  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(w => w.id !== id));
  };

  // Get today's workout
  const getTodaysWorkout = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return workouts.find(w => w.date.startsWith(today));
  };

  // Get exercise progress data for charts
  const getExerciseProgress = (exerciseId: string): ExerciseProgress[] => {
    const progress: ExerciseProgress[] = [];
    
    workouts
      .filter(w => w.exercises.some(e => e.exerciseId === exerciseId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(workout => {
        const exercise = workout.exercises.find(e => e.exerciseId === exerciseId);
        if (!exercise) return;

        const completedSets = exercise.sets.filter(s => s.completed);
        if (completedSets.length === 0) return;

        const maxWeight = Math.max(...completedSets.map(s => s.weight));
        const totalVolume = completedSets.reduce((sum, set) => sum + (set.reps * set.weight), 0);

        progress.push({
          exerciseId,
          exerciseName: exercise.exerciseName,
          date: workout.date,
          maxWeight,
          totalVolume,
        });
      });

    return progress;
  };

  // Get workout statistics
  const getStats = () => {
    const totalWorkouts = workouts.length;
    const thisWeek = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    }).length;

    const totalVolume = workouts.reduce((sum, workout) => {
      return sum + workout.exercises.reduce((exSum, exercise) => {
        return exSum + exercise.sets.reduce((setSum, set) => {
          return set.completed ? setSum + (set.reps * set.weight) : setSum;
        }, 0);
      }, 0);
    }, 0);

    return {
      totalWorkouts,
      thisWeek,
      totalVolume,
    };
  };

  // Calculate workout streak
  const getWorkoutStreak = () => {
    if (workouts.length === 0) return 0;

    const sortedDates = workouts
      .map(w => format(new Date(w.date), 'yyyy-MM-dd'))
      .sort()
      .filter((date, index, self) => self.indexOf(date) === index); // unique dates

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if there's a workout today or yesterday
    const today = format(currentDate, 'yyyy-MM-dd');
    const yesterday = format(new Date(currentDate.getTime() - 86400000), 'yyyy-MM-dd');
    
    if (!sortedDates.includes(today) && !sortedDates.includes(yesterday)) {
      return 0; // Streak broken
    }

    // Count backwards from today
    for (let i = 0; i < 365; i++) {
      const checkDate = format(new Date(currentDate.getTime() - i * 86400000), 'yyyy-MM-dd');
      if (sortedDates.includes(checkDate)) {
        streak++;
      } else if (i > 0) {
        break; // Streak ends at first missing day (after today)
      }
    }

    return streak;
  };

  return {
    workouts,
    exercises,
    addExercise,
    updateExercise,
    deleteExercise,
    reorderExercises,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getTodaysWorkout,
    getExerciseProgress,
    getStats,
    getWorkoutStreak,
  };
}