import { useState } from 'react';
import { useWorkouts } from '@/hooks/useWorkouts';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { Exercise } from '@/types/workout';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Exercises page for managing the exercise library
 * Features: Add, edit, delete, search, and drag-to-reorder exercises
 */
export default function Exercises() {
  const { exercises, addExercise, updateExercise, deleteExercise, reorderExercises } = useWorkouts();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const CATEGORIES = [
    t.exercises.categories.chest,
    t.exercises.categories.back,
    t.exercises.categories.legs,
    t.exercises.categories.shoulders,
    t.exercises.categories.arms,
    t.exercises.categories.core,
    t.exercises.categories.cardio,
    t.exercises.categories.other,
  ];

  // Filter exercises based on search and category
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exercise.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenDialog = (exercise?: Exercise) => {
    if (exercise) {
      setEditingExercise(exercise);
      setFormName(exercise.name);
      setFormCategory(exercise.category);
    } else {
      setEditingExercise(null);
      setFormName('');
      setFormCategory('');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExercise(null);
    setFormName('');
    setFormCategory('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formName.trim() || !formCategory) {
      toast.error(t.common.fillAllFields);
      return;
    }

    if (editingExercise) {
      updateExercise(editingExercise.id, formName.trim(), formCategory);
      toast.success(t.common.exerciseUpdated);
    } else {
      addExercise(formName.trim(), formCategory);
      toast.success(t.common.exerciseAdded.replace('{exercise}', formName.trim()));
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm(t.exercises.deleteConfirm)) {
      deleteExercise(id);
      toast.success(t.common.exerciseDeleted);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = exercises.findIndex(ex => ex.id === active.id);
      const newIndex = exercises.findIndex(ex => ex.id === over.id);
      const newOrder = arrayMove(exercises, oldIndex, newIndex);
      reorderExercises(newOrder);
    }
  };

  return (
    <main className="min-h-screen pb-20 px-3 pt-4 md:px-4 md:pt-6">
      <div className="container max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t.exercises.title}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{t.exercises.subtitle}</p>
          </div>
          <Button variant="gradient" onClick={() => handleOpenDialog()} className="w-full sm:w-auto h-11 md:h-10 touch-manipulation">
            <Plus className="h-4 w-4 mr-2" />
            {t.exercises.addExercise}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t.exercises.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 md:h-10 touch-manipulation"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[180px] h-11 md:h-10 touch-manipulation">
              <SelectValue placeholder={t.exercises.selectCategory} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.exercises.allCategories}</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exercise List */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm md:text-base text-muted-foreground">{t.exercises.noExercises}</p>
              <Button variant="outline" onClick={() => handleOpenDialog()} className="h-11 md:h-10 touch-manipulation">
                <Plus className="h-4 w-4 mr-2" />
                {t.exercises.addFirstExercise}
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredExercises.map(ex => ex.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? t.exercises.editExercise : t.exercises.addNewExercise}
            </DialogTitle>
            <DialogDescription>
              {editingExercise ? t.exercises.updateDetails : t.exercises.addToLibrary}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.exercises.exerciseName}</Label>
                <Input
                  id="name"
                  placeholder={t.exercises.namePlaceholder}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-11 md:h-10 touch-manipulation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t.exercises.category}</Label>
                <Select value={formCategory} onValueChange={setFormCategory} required>
                  <SelectTrigger id="category" className="h-11 md:h-10 touch-manipulation">
                    <SelectValue placeholder={t.exercises.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleCloseDialog} className="h-11 md:h-10 touch-manipulation">
                {t.exercises.cancel}
              </Button>
              <Button type="submit" variant="gradient" className="h-11 md:h-10 touch-manipulation">
                {editingExercise ? t.exercises.update : t.exercises.add}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}