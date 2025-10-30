import { useLocalStorage } from './useLocalStorage';
import { WorkoutTemplate, TemplateExercise } from '@/types/workout';

/**
 * Custom hook for managing workout templates
 */
export function useTemplates() {
  const [templates, setTemplates] = useLocalStorage<WorkoutTemplate[]>('workout-templates', []);

  const addTemplate = (name: string, description: string, exercises: TemplateExercise[]) => {
    const newTemplate: WorkoutTemplate = {
      id: Date.now().toString(),
      name,
      description,
      exercises,
      createdAt: new Date().toISOString(),
    };
    setTemplates([...templates, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (id: string, name: string, description: string, exercises: TemplateExercise[]) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, name, description, exercises } : t
    ));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
}