import { useWorkouts } from '@/hooks/useWorkouts';
import { useAchievements } from '@/hooks/useAchievements';
import { useWeeklyReports } from '@/hooks/useWeeklyReports';
import { StatCard } from '@/components/StatCard';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { WeeklyReportCard } from '@/components/WeeklyReportCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, TrendingUp, Calendar, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { professionalExercises } from '@/data/exerciseLibrary';

/**
 * Dashboard page showing workout overview and quick stats
 */
export default function Dashboard() {
  const { workouts, exercises, getStats, getWorkoutStreak } = useWorkouts();
  const { checkAchievements } = useAchievements();
  const { getCurrentWeekReport, generateWeeklyReport } = useWeeklyReports();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Helper to get translated exercise name
  const getTranslatedExerciseName = (exerciseName: string) => {
    const exercise = professionalExercises.find(ex => 
      ex.name === exerciseName || 
      t.exerciseLibrary[exerciseName as keyof typeof t.exerciseLibrary] === exerciseName
    );
    if (exercise) {
      return t.exerciseLibrary[exercise.name as keyof typeof t.exerciseLibrary] || exercise.name;
    }
    return exerciseName;
  };
  
  const stats = getStats();
  const streak = getWorkoutStreak();
  const todaysWorkout = workouts.find(w => 
    w.date.startsWith(format(new Date(), 'yyyy-MM-dd'))
  );
  const weeklyReport = getCurrentWeekReport(workouts);

  // Check achievements whenever stats change
  useEffect(() => {
    checkAchievements({
      totalWorkouts: stats.totalWorkouts,
      totalVolume: stats.totalVolume,
      currentStreak: streak,
    });
  }, [stats.totalWorkouts, stats.totalVolume, streak, checkAchievements]);

  // Persist current week's report without triggering render loops
  useEffect(() => {
    generateWeeklyReport(workouts);
  }, [workouts, generateWeeklyReport]);

  return (
    <main className="min-h-screen pb-20 px-3 pt-4 md:px-4 md:pt-6">
      <div className="container max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="space-y-1 md:space-y-2 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient">{t.dashboard.title}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>

        {/* Motivational Quote */}
        <div className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <MotivationalQuote />
        </div>

                  <LanguageToggle />
                    <ThemeToggle />

        {/* Stats Grid */}
   <div
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-in"
  style={{ animationDelay: '0.1s' }}
>
          <StatCard
            title={t.dashboard.totalWorkouts}
            value={stats.totalWorkouts}
            icon={Dumbbell}
            gradient
          />
          <StatCard
            title={t.dashboard.thisWeek}
            value={stats.thisWeek}
            icon={Calendar}
          />
          <StatCard
            title={t.dashboard.totalVolume}
            value={`${(stats.totalVolume / 1000).toFixed(1)}k`}
            icon={TrendingUp}
          />
          <StatCard
            title={t.dashboard.streak}
            value={`${streak} ${t.dashboard.days}`}
            icon={TrendingUp}
            gradient
            className="border-2 border-primary"
          />
        </div>

        {/* Today's Workout */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="block items-center justify-between  md:space-y-0 md:flex">
              <span>{t.dashboard.todaysWorkout}</span>
              {!todaysWorkout && (
                <Link to="/workout">
                  <Button variant='default' className='mt-5 md:m-0' size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.dashboard.startWorkout}
                  </Button>
                </Link>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysWorkout ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {todaysWorkout.exercises.length} {t.dashboard.exercisesLogged}
                </p>
                <div className="space-y-2">
                  {todaysWorkout.exercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="font-medium">{getTranslatedExerciseName(exercise.exerciseName)}</span>
                      <span className="text-sm text-muted-foreground">
                        {exercise.sets.filter(s => s.completed).length} {t.dashboard.sets}
                      </span>
                    </div>
                  ))}
                </div>
                <Link to="/workout">
                  <Button variant="outline" className="w-full mt-3">
                    {t.dashboard.continueWorkout}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="inline-flex p-4 rounded-full bg-primary/10">
                  <Dumbbell className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground">{t.dashboard.noWorkoutYet}</p>
                <p className="text-sm text-muted-foreground">{t.dashboard.startTracking}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Report */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <WeeklyReportCard report={weeklyReport} onViewHistory={() => navigate('/history')} />
        </div>

        {/* Quick Stats */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle>{t.dashboard.exerciseLibrary}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="block items-center justify-between  md:space-y-0 md:flex">
              <div>
                <p className="text-2xl font-bold">{exercises.length}</p>
                <p className="text-sm text-muted-foreground pb-4">{t.dashboard.exercisesAvailable}</p>
              </div>
              <Link to="/exercises">
                <Button variant="outline" className="w-full md:w-auto">
                  {t.dashboard.manageExercises}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

                {/* Install CTA */}
        <Card className="gradient-primary p-1 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="bg-background rounded-lg p-6 md:p-8 text-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gradient">
                {t.cta_install_title}
              </h2>
              <p className="text-muted-foreground">
                {t.cta_install_subtitle}
              </p>
            </div>
            <Link to="/install">
              <Button variant="gradient" size="lg" className="w-full md:w-auto">
                {t.how_to_install}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
