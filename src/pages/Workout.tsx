import { useState, useEffect, useMemo } from 'react';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useTemplates } from '@/hooks/useTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Check, Copy, Save, Edit, Info } from 'lucide-react';
import { WorkoutExercise, WorkoutSet, Workout, TemplateExercise } from '@/types/workout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { RestTimer } from '@/components/RestTimer';
import { ExerciseDetailDrawer } from '@/components/ExerciseDetailDrawer';
import { professionalExercises } from '@/data/exerciseLibrary';

/**
 * Workout tracking page for logging today's exercises
 */
export default function WorkoutPage() {
  const { exercises, addWorkout, getTodaysWorkout, updateWorkout } = useWorkouts();
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const { t } = useLanguage();
  const todaysWorkout = getTodaysWorkout();
  
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    todaysWorkout?.exercises || []
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailExercise, setDetailExercise] = useState<any>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  
  // Template management state
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateExercises, setTemplateExercises] = useState<TemplateExercise[]>([]);
  const [selectedTemplateExerciseId, setSelectedTemplateExerciseId] = useState('');

  useEffect(() => {
    if (todaysWorkout) {
      setWorkoutExercises(todaysWorkout.exercises);
    }
  }, [todaysWorkout]);

  // Filter exercises based on selected categories and search
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(exercise.category);
      const matchesSearch = searchQuery === '' || 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [exercises, selectedCategories, searchQuery]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(exercises.map(ex => ex.category)));
    return uniqueCategories.sort();
  }, [exercises]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Helper to get translated exercise name
  const getTranslatedExerciseName = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return '';
    return (t.exerciseLibrary as any)?.[exercise.name] || exercise.name;
  };

  // Helper to open exercise detail
  const openExerciseDetail = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      setDetailExercise(exercise);
      setIsDetailDrawerOpen(true);
    }
  };

  const addExerciseToWorkout = () => {
    if (!selectedExerciseId) {
      toast.error(t.common.selectExercise);
      return;
    }

    const exercise = exercises.find(ex => ex.id === selectedExerciseId);
    if (!exercise) return;

    const newWorkoutExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [
        { id: '1', reps: 0, weight: 0, completed: false },
        { id: '2', reps: 0, weight: 0, completed: false },
        { id: '3', reps: 0, weight: 0, completed: false },
      ],
    };

    setWorkoutExercises([newWorkoutExercise, ...workoutExercises]);
    setSelectedExerciseId('');
    toast.success(t.common.exerciseAdded.replace('{exercise}', exercise.name));
  };

  const removeExerciseFromWorkout = (exerciseId: string) => {
    setWorkoutExercises(workoutExercises.filter(ex => ex.id !== exerciseId));
  };

  const addSetToExercise = (exerciseId: string) => {
    setWorkoutExercises(workoutExercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSet: WorkoutSet = {
          id: Date.now().toString(),
          reps: 0,
          weight: 0,
          completed: false,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof WorkoutSet, value: any) => {
    setWorkoutExercises(workoutExercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set => {
            if (set.id === setId) {
              const updatedSet = { ...set, [field]: value };
              // Start rest timer when a set is marked as completed
              if (field === 'completed' && value === true && !set.completed) {
                setShowRestTimer(true);
              }
              return updatedSet;
            }
            return set;
          }),
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setWorkoutExercises(workoutExercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter(set => set.id !== setId),
        };
      }
      return ex;
    }));
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const templateWorkoutExercises: WorkoutExercise[] = template.exercises.map(ex => ({
      id: Date.now().toString() + Math.random(),
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        id: (i + 1).toString(),
        reps: ex.reps,
        weight: ex.weight || 0,
        completed: false,
      })),
    }));

    setWorkoutExercises(templateWorkoutExercises);
    toast.success(t.templates.templateLoaded.replace('{name}', template.name));
  };

  const saveWorkout = () => {
    if (workoutExercises.length === 0) {
      toast.error(t.workout.addAtLeastOne);
      return;
    }

    const workout: Workout = {
      id: todaysWorkout?.id || Date.now().toString(),
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      exercises: workoutExercises,
    };

    if (todaysWorkout) {
      updateWorkout(workout.id, workout);
      toast.success(t.workout.updated);
    } else {
      addWorkout(workout);
      toast.success(t.workout.saved);
    }
  };

  // Template management functions
  const resetTemplateForm = () => {
    setTemplateName('');
    setTemplateDescription('');
    setTemplateExercises([]);
    setSelectedTemplateExerciseId('');
    setEditingTemplateId(null);
  };

  const openEditTemplateDialog = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setTemplateName(template.name);
      setTemplateDescription(template.description || '');
      setTemplateExercises(template.exercises);
      setEditingTemplateId(templateId);
      setIsTemplateDialogOpen(true);
    }
  };

  const addExerciseToTemplate = () => {
    if (!selectedTemplateExerciseId) {
      toast.error(t.common.selectExercise);
      return;
    }

    const exercise = exercises.find(ex => ex.id === selectedTemplateExerciseId);
    if (!exercise) return;

    const newExercise: TemplateExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 3,
      reps: 10,
      weight: 0,
    };

    setTemplateExercises([...templateExercises, newExercise]);
    setSelectedTemplateExerciseId('');
  };

  const removeExerciseFromTemplate = (exerciseId: string) => {
    setTemplateExercises(templateExercises.filter(ex => ex.exerciseId !== exerciseId));
  };

  const updateTemplateExercise = (exerciseId: string, field: keyof TemplateExercise, value: any) => {
    setTemplateExercises(templateExercises.map(ex =>
      ex.exerciseId === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      toast.error(t.templates.enterName);
      return;
    }

    if (templateExercises.length === 0) {
      toast.error(t.templates.addOneExercise);
      return;
    }

    if (editingTemplateId) {
      updateTemplate(editingTemplateId, templateName, templateDescription, templateExercises);
      toast.success(t.templates.templateUpdated);
    } else {
      addTemplate(templateName, templateDescription, templateExercises);
      toast.success(t.templates.templateCreated);
    }

    setIsTemplateDialogOpen(false);
    resetTemplateForm();
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm(t.templates.deleteConfirm)) {
      deleteTemplate(id);
      toast.success(t.templates.templateDeleted);
    }
  };

  return (
    <main className="min-h-screen pb-20 px-3 pt-4 md:px-4 md:pt-6">
      <div className="container max-w-4xl mx-auto space-y-4 md:space-y-6">
        <Tabs defaultValue="workout" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="workout">{t.workout.title}</TabsTrigger>
            <TabsTrigger value="templates">{t.templates.title}</TabsTrigger>
          </TabsList>

          <TabsContent value="workout" className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold">{t.workout.title}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        {/* Add Exercise / Load Template */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg">{t.workout.addExerciseTitle}</CardTitle>
              {templates.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Copy className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">{t.templates.loadRoutine}</span>
                      <span className="sm:hidden text-xs">{t.templates.loadRoutine}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {templates.map(template => (
                      <DropdownMenuItem key={template.id} onClick={() => loadTemplate(template.id)}>
                        {template.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Category Filter */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t.exercises.filterByDifficulty.replace('Difficulty', 'Category')}</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category)}
                    className="h-8 text-xs"
                  >
                    {t.exercises.categories[category.toLowerCase() as keyof typeof t.exercises.categories] || category}
                  </Button>
                ))}
                {selectedCategories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategories([])}
                    className="h-8 text-xs"
                  >
                    {t.exercises.allCategories}
                  </Button>
                )}
              </div>
            </div>

            {/* Exercise Selection */}
            <div className="flex gap-2 md:gap-3">
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t.workout.selectExercise} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredExercises.map(exercise => {
                    const translatedName = (t.exerciseLibrary as any)?.[exercise.name] || exercise.name;
                    const translatedCategory = t.exercises.categories[exercise.category.toLowerCase() as keyof typeof t.exercises.categories] || exercise.category;
                    return (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {translatedName} ({translatedCategory})
                      </SelectItem>
                    );
                  })}
                  {filteredExercises.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {t.exercises.noExercises}
                    </div>
                  )}
                </SelectContent>
              </Select>
              <Button onClick={addExerciseToWorkout} variant="gradient" size="default" className="shrink-0">
                <Plus className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">{t.exercises.add}</span>
              <span className="sm:hidden">{t.exercises.add}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workout Exercises */}
        <div className="space-y-3 md:space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {workoutExercises.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 md:py-12 space-y-2 md:space-y-3">
                <p className="text-sm md:text-base text-muted-foreground">{t.workout.noExercises}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{t.workout.startSelecting}</p>
              </CardContent>
            </Card>
          ) : (
            workoutExercises.map((exercise) => (
              <Card key={exercise.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 md:pb-4">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg md:text-xl">{getTranslatedExerciseName(exercise.exerciseId)}</CardTitle>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openExerciseDetail(exercise.exerciseId)}
                      className="h-8 w-8 md:h-9 md:w-9 hover:bg-accent"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeExerciseFromWorkout(exercise.id)}
                    className="text-destructive hover:text-destructive h-8 w-8 md:h-10 md:w-10"
                  >
                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-3">
                  {/* Sets Header */}
                  <div className="grid grid-cols-[auto,1fr,1fr,auto,auto] gap-2 text-xs md:text-sm font-medium text-muted-foreground px-1 md:px-2">
                    <div className="w-6 md:w-8"></div>
                    <div>{t.workout.reps}</div>
                    <div>{t.workout.weight}</div>
                    <div className="w-10 md:w-12"></div>
                    <div className="w-6 md:w-8"></div>
                  </div>

                  {/* Sets List */}
                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className="grid grid-cols-[auto,1fr,1fr,auto,auto] gap-2 items-center">
                      <div className="w-6 md:w-8 text-xs md:text-sm text-muted-foreground text-center font-medium">
                        {setIndex + 1}
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max="999"
                        value={set.reps || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 999)) {
                            updateSet(exercise.id, set.id, 'reps', val === '' ? 0 : parseInt(val));
                          }
                        }}
                        placeholder="0"
                        className="text-center h-12 md:h-10 text-base touch-manipulation"
                        inputMode="numeric"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="9999"
                        step="0.5"
                        value={set.weight || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 9999)) {
                            updateSet(exercise.id, set.id, 'weight', val === '' ? 0 : parseFloat(val));
                          }
                        }}
                        placeholder="0"
                        className="text-center h-12 md:h-10 text-base touch-manipulation"
                        inputMode="decimal"
                      />
                      <Checkbox
                        checked={set.completed}
                        onCheckedChange={(checked) => updateSet(exercise.id, set.id, 'completed', checked)}
                        className="w-10 h-10 md:w-10 md:h-10 border-2 touch-manipulation"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeSet(exercise.id, set.id)}
                        className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground hover:text-destructive touch-manipulation"
                      >
                        <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSetToExercise(exercise.id)}
                    className="w-full h-9 md:h-9"
                  >
                    <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                    {t.workout.addSet}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Save Button */}
        {workoutExercises.length > 0 && (
          <Button
            onClick={saveWorkout}
            variant="gradient"
            size="lg"
            className="w-full animate-fade-in h-12 md:h-11 text-base"
            style={{ animationDelay: '0.3s' }}
          >
            <Check className="h-5 w-5 mr-2" />
            {t.workout.saveWorkout}
          </Button>
        )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {/* Templates Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">{t.templates.title}</h2>
                <p className="text-sm text-muted-foreground">{t.templates.subtitle}</p>
              </div>
              <Dialog open={isTemplateDialogOpen} onOpenChange={(open) => {
                setIsTemplateDialogOpen(open);
                if (!open) resetTemplateForm();
              }}>
                <DialogTrigger asChild>
                  <Button variant="gradient" size="sm" className="h-9">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t.templates.newTemplate}</span>
                    <span className="sm:inline md:hidden">{t.templates.newTemplate}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingTemplateId ? t.templates.editTemplate : t.templates.createTemplate}</DialogTitle>
                    <DialogDescription>
                      {editingTemplateId ? t.templates.updateTemplate : t.templates.subtitle}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Template Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t.templates.templateName}</label>
                      <Input
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder={t.templates.templateNamePlaceholder}
                        className="h-11 md:h-10 touch-manipulation"
                      />
                    </div>

                    {/* Template Description */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t.templates.description}</label>
                      <Textarea
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        placeholder={t.templates.descriptionPlaceholder}
                        rows={2}
                        className="touch-manipulation resize-none"
                      />
                    </div>

                    {/* Add Exercise */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t.templates.addExercises}</label>
                      <div className="flex gap-2">
                        <Select value={selectedTemplateExerciseId} onValueChange={setSelectedTemplateExerciseId}>
                          <SelectTrigger className="flex-1 h-11 md:h-10 touch-manipulation">
                            <SelectValue placeholder={t.workout.selectExercise} />
                          </SelectTrigger>
                          <SelectContent>
                            {exercises.map(exercise => {
                              const translatedName = (t.exerciseLibrary as any)?.[exercise.name] || exercise.name;
                              return (
                                <SelectItem key={exercise.id} value={exercise.id}>
                                  {translatedName}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Button onClick={addExerciseToTemplate} variant="outline" size="icon" className="shrink-0 h-11 w-11 md:h-10 md:w-10 touch-manipulation">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Exercise List */}
                    {templateExercises.length > 0 && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">{t.templates.exercisesInTemplate}</label>
                        {templateExercises.map((exercise) => {
                          const translatedName = (t.exerciseLibrary as any)?.[exercise.exerciseName] || exercise.exerciseName;
                          return (
                            <Card key={exercise.exerciseId}>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{translatedName}</span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => removeExerciseFromTemplate(exercise.exerciseId)}
                                      className="text-destructive h-8 w-8"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                <div className="grid grid-cols-3 gap-2">
                                   <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">{t.common.sets}</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="99"
                                      value={exercise.sets}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 99)) {
                                          updateTemplateExercise(exercise.exerciseId, 'sets', val === '' ? 1 : parseInt(val));
                                        }
                                      }}
                                      className="h-11 md:h-10 touch-manipulation"
                                      inputMode="numeric"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">{t.common.reps}</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="999"
                                      value={exercise.reps}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 999)) {
                                          updateTemplateExercise(exercise.exerciseId, 'reps', val === '' ? 1 : parseInt(val));
                                        }
                                      }}
                                      className="h-11 md:h-10 touch-manipulation"
                                      inputMode="numeric"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">{t.common.weight} (kg)</label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="9999"
                                      step="0.5"
                                      value={exercise.weight || 0}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 9999)) {
                                          updateTemplateExercise(exercise.exerciseId, 'weight', val === '' ? 0 : parseFloat(val));
                                        }
                                      }}
                                      className="h-11 md:h-10 touch-manipulation"
                                      inputMode="decimal"
                                    />
                                  </div>
                                 </div>
                              </div>
                            </CardContent>
                          </Card>
                          );
                        })}
                      </div>
                    )}

                    <Button onClick={saveTemplate} className="w-full h-11 md:h-10 touch-manipulation" variant="gradient">
                      <Save className="h-4 w-4 mr-2" />
                      {editingTemplateId ? t.templates.updateTemplate : t.templates.createTemplate}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Templates List */}
            <div className="space-y-3">
              {templates.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12 space-y-3">
                    <div className="inline-flex p-4 rounded-full bg-primary/10">
                      <Copy className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">{t.templates.noTemplates}</p>
                    <p className="text-sm text-muted-foreground">{t.templates.createFirst}</p>
                  </CardContent>
                </Card>
              ) : (
                templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          {template.description && (
                            <CardDescription className="mt-1 text-sm">{template.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditTemplateDialog(template.id)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-destructive hover:text-destructive h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {template.exercises.length} {t.templates.exercises}
                        </p>
                        {template.exercises.map((exercise) => (
                          <div
                            key={exercise.exerciseId}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 text-sm"
                          >
                            <span className="font-medium">{exercise.exerciseName}</span>
                            <span className="text-xs text-muted-foreground">
                              {exercise.sets} × {exercise.reps} {exercise.weight ? `@ ${exercise.weight}kg` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Rest Timer */}
      {showRestTimer && <RestTimer onClose={() => setShowRestTimer(false)} />}

      {/* Exercise Detail Drawer */}
      <ExerciseDetailDrawer
        exercise={detailExercise}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
      />
    </main>
  );
}
