import { useState } from 'react';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Calendar, Dumbbell, Weight } from 'lucide-react';
import { format } from 'date-fns';
import { de, ru } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Workout History page displaying all past workout sessions
 */
export default function HistoryPage() {
  const { workouts } = useWorkouts();
  const { t, language } = useLanguage();
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());

  const locale = language === 'de' ? de : ru;

  // Sort workouts by date (newest first)
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const toggleWorkout = (workoutId: string) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(workoutId)) {
      newExpanded.delete(workoutId);
    } else {
      newExpanded.add(workoutId);
    }
    setExpandedWorkouts(newExpanded);
  };

  if (workouts.length === 0) {
    return (
      <div className="container mx-auto p-3 pb-20 max-w-4xl md:p-4 md:pb-24">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">{t.history.title}</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">{t.history.noWorkouts}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 pb-20 max-w-4xl md:p-4 md:pb-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">{t.history.title}</h1>
      
      <div className="space-y-4">
        {sortedWorkouts.map((workout) => {
          const isExpanded = expandedWorkouts.has(workout.id);
          const totalSets = workout.exercises.reduce(
            (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
            0
          );
          const totalVolume = workout.exercises.reduce((sum, ex) => 
            sum + ex.sets.reduce((setSum, set) => 
              set.completed ? setSum + (set.reps * set.weight) : setSum, 0
            ), 0
          );

          return (
            <Collapsible
              key={workout.id}
              open={isExpanded}
              onOpenChange={() => toggleWorkout(workout.id)}
            >
              <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-lg">
                            {format(new Date(workout.date), 'EEEE, dd MMMM yyyy', { locale })}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {workout.exercises.length} {t.history.exercises} · {totalSets} {t.history.sets}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform duration-200",
                          isExpanded && "transform rotate-180"
                        )}
                      />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t.history.totalVolume}</span>
                        <span className="font-semibold">{totalVolume.toFixed(0)} kg</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {workout.exercises.map((exercise) => {
                        const completedSets = exercise.sets.filter(s => s.completed);
                        
                        return (
                          <div key={exercise.id} className="border-l-2 border-primary/30 pl-4">
                            <div className="flex items-start gap-2 mb-2">
                              <Dumbbell className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-base">{exercise.exerciseName}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {completedSets.length} {t.history.completedSets}
                                </p>
                              </div>
                            </div>
                            
                            <div className="ml-6 space-y-2">
                              {completedSets.map((set, index) => (
                                <div
                                  key={set.id}
                                  className="flex items-center gap-3 text-sm bg-card/50 p-2 rounded"
                                >
                                  <Badge variant="outline" className="font-mono">
                                    {index + 1}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Weight className="h-3 w-3 text-muted-foreground" />
                                    <span className="font-medium">{set.weight} kg</span>
                                  </div>
                                  <span className="text-muted-foreground">×</span>
                                  <span className="font-medium">{set.reps} {t.history.reps}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
