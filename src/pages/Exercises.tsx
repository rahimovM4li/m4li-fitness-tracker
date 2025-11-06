import { useState } from 'react';
import { useWorkouts } from '@/hooks/useWorkouts';
import { ExerciseCardEnhanced } from '@/components/ExerciseCardEnhanced';
import { ExerciseDetailDrawer } from '@/components/ExerciseDetailDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
 * Features: Add, edit, delete, search, filter, and drag-to-reorder exercises
 */
export default function Exercises() {
  const { exercises, addExercise, updateExercise, deleteExercise, reorderExercises } = useWorkouts();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [formTargetMuscles, setFormTargetMuscles] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Category mapping object
  const CATEGORY_MAP = {
    'Chest': 'chest',
    'Brust': 'chest',
    'Грудь': 'chest',
    'Back': 'back',
    'Rücken': 'back',
    'Спина': 'back',
    'Legs': 'legs',
    'Beine': 'legs',
    'Ноги': 'legs',
    'Shoulders': 'shoulders',
    'Schultern': 'shoulders',
    'Плечи': 'shoulders',
    'Arms': 'arms',
    'Arme': 'arms',
    'Руки': 'arms',
    'Core': 'core',
    'Rumpf': 'core',
    'Корпус': 'core',
    'Cardio': 'cardio',
    'Кардио': 'cardio',
    'Other': 'other',
    'Sonstiges': 'other',
    'Другое': 'other',
  };

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

  const DIFFICULTIES = [
    { value: 'beginner', label: t.exercises.difficulties.beginner },
    { value: 'intermediate', label: t.exercises.difficulties.intermediate },
    { value: 'advanced', label: t.exercises.difficulties.advanced },
  ];

  // Helper function to get category key from translated value
  const getCategoryKey = (translatedCategory: string): string => {
    return CATEGORY_MAP[translatedCategory as keyof typeof CATEGORY_MAP] || translatedCategory.toLowerCase();
  };

  // Helper function to get difficulty key from translated value
  const getDifficultyKey = (translatedDifficulty: string): string => {
    const diffEntry = DIFFICULTIES.find(d => d.label === translatedDifficulty);
    return diffEntry ? diffEntry.value : translatedDifficulty.toLowerCase();
  };

  // Filter exercises based on search, category, and difficulty
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Convert selected filter to internal key for comparison
    const selectedCategoryKey = filterCategory === 'all' ? 'all' : getCategoryKey(filterCategory);
    const matchesCategory = filterCategory === 'all' || exercise.category.toLowerCase() === selectedCategoryKey;
    
    const selectedDifficultyKey = filterDifficulty === 'all' ? 'all' : getDifficultyKey(filterDifficulty);
    const matchesDifficulty = filterDifficulty === 'all' || exercise.difficulty === selectedDifficultyKey;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleOpenDialog = (exercise?: Exercise) => {
    if (exercise) {
      setEditingExercise(exercise);
      setFormName(exercise.name);
      setFormCategory(exercise.category);
      setFormDifficulty(exercise.difficulty || 'beginner');
      setFormTargetMuscles(exercise.targetMuscles?.join(', ') || '');
      setFormDescription(exercise.description || '');
      setFormImage(exercise.image || '');
    } else {
      setEditingExercise(null);
      setFormName('');
      setFormCategory('');
      setFormDifficulty('beginner');
      setFormTargetMuscles('');
      setFormDescription('');
      setFormImage('');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExercise(null);
    setFormName('');
    setFormCategory('');
    setFormDifficulty('beginner');
    setFormTargetMuscles('');
    setFormDescription('');
    setFormImage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formName.trim() || !formCategory) {
      toast.error(t.common.fillAllFields);
      return;
    }

    const targetMusclesArray = formTargetMuscles
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    // Convert translated category back to English key for storage
    const categoryKey = getCategoryKey(formCategory);

    if (editingExercise) {
      updateExercise(
        editingExercise.id,
        formName.trim(),
        categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1), // Capitalize first letter
        targetMusclesArray.length > 0 ? targetMusclesArray : undefined,
        formDescription.trim() || undefined,
        formDifficulty,
        formImage.trim() || undefined
      );
      toast.success(t.common.exerciseUpdated);
    } else {
      addExercise(
        formName.trim(),
        categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1), // Capitalize first letter
        targetMusclesArray.length > 0 ? targetMusclesArray : undefined,
        formDescription.trim() || undefined,
        formDifficulty,
        formImage.trim() || undefined
      );
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
      const oldIndex = filteredExercises.findIndex(ex => ex.id === active.id);
      const newIndex = filteredExercises.findIndex(ex => ex.id === over.id);
      
      // Get the full exercises array indices
      const fullOldIndex = exercises.findIndex(ex => ex.id === active.id);
      const fullNewIndex = exercises.findIndex(ex => ex.id === over.id);
      
      const newOrder = arrayMove(exercises, fullOldIndex, fullNewIndex);
      reorderExercises(newOrder);
    }
  };

  const handleViewDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDetailDrawerOpen(true);
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
        <div className="flex flex-col gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t.exercises.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 md:h-10 touch-manipulation"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-11 md:h-10 touch-manipulation">
                <SelectValue placeholder={t.exercises.selectCategory} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.exercises.allCategories}</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="h-11 md:h-10 touch-manipulation">
                <SelectValue placeholder={t.exercises.filterByDifficulty} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.exercises.allDifficulties}</SelectItem>
                {DIFFICULTIES.map(diff => (
                  <SelectItem key={diff.value} value={diff.label}>{diff.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                  <ExerciseCardEnhanced
                    key={exercise.id}
                    exercise={exercise}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
              <div className="space-y-2">
                <Label htmlFor="difficulty">{t.exercises.difficulty}</Label>
                <Select value={formDifficulty} onValueChange={(val) => setFormDifficulty(val as any)}>
                  <SelectTrigger id="difficulty" className="h-11 md:h-10 touch-manipulation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(diff => (
                      <SelectItem key={diff.value} value={diff.value}>{diff.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetMuscles">{t.exercises.targetMuscles}</Label>
                <Input
                  id="targetMuscles"
                  placeholder="e.g. Pectorals, Triceps (comma separated)"
                  value={formTargetMuscles}
                  onChange={(e) => setFormTargetMuscles(e.target.value)}
                  className="h-11 md:h-10 touch-manipulation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.exercises.description}</Label>
                <Textarea
                  id="description"
                  placeholder={t.exercises.howToPerform}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="min-h-20 resize-none touch-manipulation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Emoji/Icon</Label>
                <Input
                  id="image"
                  placeholder="e.g. 💪, 🏋️, 🦵"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="h-11 md:h-10 touch-manipulation"
                  maxLength={2}
                />
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

      {/* Exercise Detail Drawer */}
      <ExerciseDetailDrawer
        exercise={selectedExercise}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
      />
    </main>
  );
}