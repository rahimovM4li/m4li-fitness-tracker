import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { Exercise } from '@/types/workout';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExerciseCardEnhancedProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
  onViewDetails: (exercise: Exercise) => void;
}

export function ExerciseCardEnhanced({
  exercise,
  onEdit,
  onDelete,
  onViewDetails,
}: ExerciseCardEnhancedProps) {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    if (!difficulty) return '';
    return t.exercises.difficulties[difficulty as keyof typeof t.exercises.difficulties];
  };

  const translatedName =
    (t.exerciseLibrary as any)?.[exercise.name] || exercise.name;
  const translatedCategory =
    t.exercises.categories[
      exercise.category.toLowerCase() as keyof typeof t.exercises.categories
    ] || exercise.category;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="overflow-hidden hover:shadow-md transition-all touch-manipulation"
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="hidden md:flex items-center px-2 bg-muted/50 cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3 md:p-4 flex items-start gap-3">
            {/* Exercise Icon */}
            <div className="w-12 h-12 rounded-lg bg-muted/40 flex items-center justify-center text-2xl shrink-0">
              {exercise.image || '💪'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
<h3
  className="
    font-semibold text-base md:text-lg leading-tight break-words
    whitespace-normal overflow-visible
    md:truncate md:whitespace-nowrap md:overflow-hidden
  "
>
  {translatedName}
</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onViewDetails(exercise)}
                  className="h-8 w-8 shrink-0 touch-manipulation hover:bg-muted"
                  title={t.exercises.view || 'View'}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-1">
                <Badge variant="secondary" className="text-xs font-normal">
                  {translatedCategory}
                </Badge>
                {exercise.difficulty && (
                  <Badge
                    className={`text-xs font-normal border ${getDifficultyColor(
                      exercise.difficulty
                    )}`}
                  >
                    {getDifficultyLabel(exercise.difficulty)}
                  </Badge>
                )}
              </div>

              {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                <p className="hidden sm:block text-xs text-muted-foreground line-clamp-1">
                  {exercise.targetMuscles.slice(0, 2).join(', ')}
                  {exercise.targetMuscles.length > 2 && '...'}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col border-l bg-muted/30">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(exercise)}
              className="h-1/2 w-12 md:w-14 rounded-none border-b hover:bg-muted touch-manipulation"
              title={t.exercises.edit || 'Edit'}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(exercise.id)}
              className="h-1/2 w-12 md:w-14 rounded-none text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
              title={t.exercises.delete || 'Delete'}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
