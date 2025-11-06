import { useLocalStorage } from './useLocalStorage';
import { Workout, Exercise, ExerciseProgress, PersonalRecord } from '@/types/workout';
import { format } from 'date-fns';
import { professionalExercises } from '@/data/exerciseLibrary';
import { toast } from 'sonner';

/**
 * Custom hook for managing workouts in localStorage
 */
export function useWorkouts() {
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('workouts', []);
  const [personalRecords, setPersonalRecords] = useLocalStorage<PersonalRecord[]>('personalRecords', []);
  
  // Initialize with professional exercise library
  const getDefaultExercises = (): Exercise[] => {
    return professionalExercises.map((ex, index) => ({
      ...ex,
      id: (index + 1).toString(),
      createdAt: new Date().toISOString(),
    }));
  };
  
  const [exercises, setExercises] = useLocalStorage<Exercise[]>('exercises', getDefaultExercises());

  // Add a new exercise
  const addExercise = (
    name: string, 
    category: string, 
    targetMuscles?: string[], 
    description?: string, 
    difficulty?: 'beginner' | 'intermediate' | 'advanced',
    image?: string
  ) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name,
      category,
      targetMuscles,
      description,
      difficulty,
      image,
      createdAt: new Date().toISOString(),
    };
    setExercises([...exercises, newExercise]);
    return newExercise;
  };

  // Update an exercise
  const updateExercise = (
    id: string, 
    name: string, 
    category: string,
    targetMuscles?: string[], 
    description?: string, 
    difficulty?: 'beginner' | 'intermediate' | 'advanced',
    image?: string
  ) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, name, category, targetMuscles, description, difficulty, image } : ex
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

  // Check and record personal records
  const checkPersonalRecords = (workout: Workout) => {
    const newPRs: PersonalRecord[] = [];
    
    workout.exercises.forEach(exercise => {
      const completedSets = exercise.sets.filter(s => s.completed);
      if (completedSets.length === 0) return;

      const maxWeight = Math.max(...completedSets.map(s => s.weight));
      const totalVolume = completedSets.reduce((sum, set) => sum + (set.reps * set.weight), 0);
      const maxReps = Math.max(...completedSets.map(s => s.reps));

      // Get previous PRs for this exercise
      const prevMaxWeight = personalRecords
        .filter(pr => pr.exerciseId === exercise.exerciseId && pr.type === 'maxWeight')
        .sort((a, b) => b.value - a.value)[0];
      
      const prevMaxVolume = personalRecords
        .filter(pr => pr.exerciseId === exercise.exerciseId && pr.type === 'maxVolume')
        .sort((a, b) => b.value - a.value)[0];

      const prevMaxReps = personalRecords
        .filter(pr => pr.exerciseId === exercise.exerciseId && pr.type === 'maxReps')
        .sort((a, b) => b.value - a.value)[0];

      // Check for new max weight PR
      if (!prevMaxWeight || maxWeight > prevMaxWeight.value) {
        newPRs.push({
          id: `${workout.id}-${exercise.exerciseId}-weight`,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          type: 'maxWeight',
          value: maxWeight,
          date: workout.date,
          workoutId: workout.id,
        });
      }

      // Check for new volume PR
      if (!prevMaxVolume || totalVolume > prevMaxVolume.value) {
        newPRs.push({
          id: `${workout.id}-${exercise.exerciseId}-volume`,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          type: 'maxVolume',
          value: totalVolume,
          date: workout.date,
          workoutId: workout.id,
        });
      }

      // Check for new max reps PR
      if (!prevMaxReps || maxReps > prevMaxReps.value) {
        newPRs.push({
          id: `${workout.id}-${exercise.exerciseId}-reps`,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          type: 'maxReps',
          value: maxReps,
          date: workout.date,
          workoutId: workout.id,
        });
      }
    });

    if (newPRs.length > 0) {
      setPersonalRecords([...personalRecords, ...newPRs]);
      
      // Show toast for each new PR
      newPRs.forEach(pr => {
        const prType = pr.type === 'maxWeight' ? 'Weight' : pr.type === 'maxVolume' ? 'Volume' : 'Reps';
        toast.success(`🎉 New ${prType} PR!`, {
          description: `${pr.exerciseName}: ${pr.value.toFixed(1)} ${pr.type === 'maxReps' ? 'reps' : 'kg'}`,
          duration: 5000,
        });
      });
    }

    return newPRs.length;
  };

  // Add a new workout
  const addWorkout = (workout: Workout) => {
    setWorkouts([...workouts, workout]);
    checkPersonalRecords(workout);
  };

  // Update a workout
  const updateWorkout = (id: string, workout: Workout) => {
    setWorkouts(workouts.map(w => w.id === id ? workout : w));
    checkPersonalRecords(workout);
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

  // Get personal records for an exercise
  const getPersonalRecords = (exerciseId: string) => {
    return personalRecords
      .filter(pr => pr.exerciseId === exerciseId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get current PR for exercise and type
  const getCurrentPR = (exerciseId: string, type: PersonalRecord['type']) => {
    return personalRecords
      .filter(pr => pr.exerciseId === exerciseId && pr.type === type)
      .sort((a, b) => b.value - a.value)[0];
  };

  return {
    workouts,
    exercises,
    personalRecords,
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
    getPersonalRecords,
    getCurrentPR,
  };
}
