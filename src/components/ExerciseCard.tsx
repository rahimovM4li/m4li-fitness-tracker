import { Exercise } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

/**
 * Card component for displaying an exercise with edit/delete actions
 * Supports drag-and-drop reordering
 */
export function ExerciseCard({ exercise, onEdit, onDelete, isDragging }: ExerciseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group animate-fade-in transition-all duration-200 hover:shadow-lg",
        (isDragging || isSortableDragging) && "opacity-50 scale-95"
      )}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <button
          className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{exercise.name}</h3>
          <p className="text-sm text-muted-foreground">{exercise.category}</p>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(exercise)}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(exercise.id)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}