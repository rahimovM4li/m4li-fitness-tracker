import { useState } from 'react';
import { useTemplates } from '@/hooks/useTemplates';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Save, Copy, Edit } from 'lucide-react';
import { TemplateExercise } from '@/types/workout';
import { toast } from 'sonner';

/**
 * Page for managing workout templates/routines
 */
export default function Templates() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const { exercises } = useWorkouts();
  const { t } = useLanguage();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateExercises, setTemplateExercises] = useState<TemplateExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');

  const resetForm = () => {
    setTemplateName('');
    setTemplateDescription('');
    setTemplateExercises([]);
    setSelectedExerciseId('');
    setEditingTemplate(null);
  };

  const openEditDialog = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setTemplateName(template.name);
      setTemplateDescription(template.description || '');
      setTemplateExercises(template.exercises);
      setEditingTemplate(templateId);
      setIsDialogOpen(true);
    }
  };

  const addExerciseToTemplate = () => {
    if (!selectedExerciseId) {
      toast.error(t.common.selectExercise);
      return;
    }

    const exercise = exercises.find(ex => ex.id === selectedExerciseId);
    if (!exercise) return;

    const newExercise: TemplateExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 3,
      reps: 10,
      weight: 0,
    };

    setTemplateExercises([...templateExercises, newExercise]);
    setSelectedExerciseId('');
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

    if (editingTemplate) {
      updateTemplate(editingTemplate, templateName, templateDescription, templateExercises);
      toast.success(t.templates.templateUpdated);
    } else {
      addTemplate(templateName, templateDescription, templateExercises);
      toast.success(t.templates.templateCreated);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm(t.templates.deleteConfirm)) {
      deleteTemplate(id);
      toast.success(t.templates.templateDeleted);
    }
  };

  return (
    <main className="min-h-screen pb-20 px-4 pt-6">
      <div className="container max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">{t.templates.title}</h1>
            <p className="text-muted-foreground">{t.templates.subtitle}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                {t.templates.newTemplate}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? t.templates.editTemplate : t.templates.createTemplate}</DialogTitle>
                <DialogDescription>
                  {editingTemplate ? t.templates.updateTemplate : t.templates.subtitle}
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
                  />
                </div>

                {/* Add Exercise */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.templates.addExercises}</label>
                  <div className="flex gap-2">
                    <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t.workout.selectExercise} />
                      </SelectTrigger>
                      <SelectContent>
                        {exercises.map(exercise => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addExerciseToTemplate} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Exercise List */}
                {templateExercises.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">{t.templates.exercisesInTemplate}</label>
                    {templateExercises.map((exercise) => (
                      <Card key={exercise.exerciseId}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{exercise.exerciseName}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeExerciseFromTemplate(exercise.exerciseId)}
                                className="text-destructive"
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
                                  value={exercise.sets}
                                  onChange={(e) => updateTemplateExercise(exercise.exerciseId, 'sets', parseInt(e.target.value) || 1)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">{t.common.reps}</label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={exercise.reps}
                                  onChange={(e) => updateTemplateExercise(exercise.exerciseId, 'reps', parseInt(e.target.value) || 1)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">{t.common.weight} (kg)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={exercise.weight || 0}
                                  onChange={(e) => updateTemplateExercise(exercise.exerciseId, 'weight', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Button onClick={saveTemplate} className="w-full" variant="gradient">
                  <Save className="h-4 w-4 mr-2" />
                  {editingTemplate ? t.templates.updateTemplate : t.templates.createTemplate}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates List */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
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
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(template.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-destructive hover:text-destructive"
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
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <span className="font-medium">{exercise.exerciseName}</span>
                        <span className="text-sm text-muted-foreground">
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
      </div>
    </main>
  );
}