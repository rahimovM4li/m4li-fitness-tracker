import { Exercise } from '@/types/workout';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Target, Info, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ExerciseDetailDrawerProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExerciseDetailDrawer({ exercise, isOpen, onClose }: ExerciseDetailDrawerProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!exercise) return null;

  // Get translated exercise name and description
  const translatedName = (t.exerciseLibrary as any)?.[exercise.name] || exercise.name;
  const translatedDescription = (t.exerciseLibrary as any)?.[`${exercise.name}_desc`] || exercise.description;
  const translatedCategory = t.exercises.categories[exercise.category.toLowerCase() as keyof typeof t.exercises.categories] || exercise.category;

  const handleAddToWorkout = () => {
    const translatedName = (t.exerciseLibrary as any)?.[exercise.name] || exercise.name;
    navigate('/workout');
    toast.success(t.common.exerciseAdded.replace('{exercise}', translatedName));
    onClose();
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    if (!difficulty) return '';
    return t.exercises.difficulties[difficulty as keyof typeof t.exercises.difficulties];
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="glass-strong">
        <DrawerHeader className="text-left">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl">{exercise.image || '💪'}</span>
                {exercise.difficulty && (
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {getDifficultyLabel(exercise.difficulty)}
                  </Badge>
                )}
              </div>
              <DrawerTitle className="text-2xl mb-1">{translatedName}</DrawerTitle>
              <DrawerDescription className="text-base">
                <Badge variant="outline" className="mr-2">{translatedCategory}</Badge>
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Target Muscles */}
          {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-primary" />
                <span>{t.exercises.musclesWorked}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {exercise.targetMuscles.map((muscle, idx) => (
                  <Badge key={idx} variant="secondary" className="glass">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {translatedDescription && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Info className="h-4 w-4 text-primary" />
                <span>{t.exercises.howToPerform}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                {translatedDescription}
              </p>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={handleAddToWorkout}
            className="w-full h-12 text-base"
            variant="gradient"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {t.exercises.addToWorkout}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
