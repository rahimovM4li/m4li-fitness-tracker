// Data types for the workout tracker application

export interface Exercise {
  id: string;
  name: string;
  category: string; // e.g., "Chest", "Back", "Legs"
  createdAt: string;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  date: string; // ISO date string
  exercises: WorkoutExercise[];
  duration?: number; // in minutes
  notes?: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  date: string;
  maxWeight: number;
  totalVolume: number; // sets * reps * weight
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
  createdAt: string;
}

export interface TemplateExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalWorkouts: number;
  totalVolume: number;
  personalRecords: number;
  createdAt: string;
}