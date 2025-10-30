import { useState } from 'react';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useAchievements } from '@/hooks/useAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, Trophy, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Progress page showing strength gains over time with charts
 */
export default function Progress() {
  const { exercises, getExerciseProgress } = useWorkouts();
  const { achievements, getUnlockedCount, getProgressPercentage } = useAchievements();
  const { t } = useLanguage();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(exercises[0]?.id || '');

  const progressData = selectedExerciseId ? getExerciseProgress(selectedExerciseId) : [];
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  // Format data for recharts
  const chartData = progressData.map(p => ({
    date: format(new Date(p.date), 'MMM d'),
    maxWeight: p.maxWeight,
    volume: p.totalVolume,
  }));

  const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);

  return (
    <main className="min-h-screen pb-20 px-3 pt-4 md:px-4 md:pt-6">
      <div className="container max-w-4xl mx-auto space-y-4 md:space-y-6">
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="progress">{t.progress.title}</TabsTrigger>
            <TabsTrigger value="achievements">{t.achievements.title}</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-bold">{t.progress.title}</h1>
              <p className="text-sm md:text-base text-muted-foreground">{t.progress.subtitle}</p>
            </div>

        {/* Exercise Selector */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.progress.selectExercise}</label>
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger className="h-11 md:h-10 touch-manipulation">
                  <SelectValue placeholder={t.progress.chooseExercise} />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        {progressData.length === 0 ? (
          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="text-center py-12 space-y-3">
              <div className="inline-flex p-4 rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">{t.progress.noData}</p>
              <p className="text-sm text-muted-foreground">
                {t.progress.completeWorkouts.replace('{exercise}', selectedExercise?.name || t.common.thisExercise)}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Max Weight Chart */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>{t.progress.maxWeightProgress}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="maxWeight"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Total Volume Chart */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle>{t.progress.totalVolumeProgress}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="volume"
                      stroke="hsl(var(--accent))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--accent))', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>{t.progress.summaryStats}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.progress.totalWorkouts}</p>
                  <p className="text-2xl font-bold">{progressData.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.progress.currentMax}</p>
                  <p className="text-2xl font-bold text-primary">
                    {progressData[progressData.length - 1]?.maxWeight || 0} {t.progress.lbs}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.progress.bestVolume}</p>
                  <p className="text-2xl font-bold text-accent">
                    {Math.max(...progressData.map(p => p.totalVolume), 0)} {t.progress.lbs}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {/* Header */}
            <div className="space-y-2 animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
                <Trophy className="h-7 w-7 md:h-8 md:w-8" />
                {t.achievements.title}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {getUnlockedCount()} {t.common.of} {achievements.length} {t.achievements.title.toLowerCase()}
              </p>
            </div>

            {/* Overall Progress */}
            <Card className="animate-fade-in gradient-card border-primary/20" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t.achievements.overallProgress}</span>
                    <span className="text-xl md:text-2xl font-bold">
                      {Math.round((getUnlockedCount() / achievements.length) * 100)}%
                    </span>
                  </div>
                  <ProgressBar value={(getUnlockedCount() / achievements.length) * 100} className="h-2 md:h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-lg md:text-xl font-bold">{t.achievements.unlocked}</h2>
                <div className="grid gap-3">
                  {unlockedAchievements.map((achievement) => (
                    <Card key={achievement.id} className="gradient-card border-primary/20 hover:scale-[1.02] transition-transform">
                      <CardContent className="p-4 md:p-5">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="text-3xl md:text-4xl shrink-0">{achievement.icon}</div>
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-base md:text-lg font-bold truncate">{achievement.name}</h3>
                              {achievement.unlockedAt && (
                                <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                                  {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{achievement.description}</p>
                            {achievement.target && (
                              <div className="pt-2">
                                <ProgressBar value={100} className="h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-lg md:text-xl font-bold">{t.achievements.inProgress}</h2>
                <div className="grid gap-3">
                  {lockedAchievements.map((achievement) => (
                    <Card key={achievement.id} className="opacity-75 hover:opacity-100 transition-opacity">
                      <CardContent className="p-4 md:p-5">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="relative shrink-0">
                            <div className="text-3xl md:text-4xl grayscale">{achievement.icon}</div>
                            <Lock className="absolute -bottom-1 -right-1 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-2 min-w-0">
                            <h3 className="text-base md:text-lg font-bold truncate">{achievement.name}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{achievement.description}</p>
                            {achievement.target && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{t.achievements.progress}</span>
                                  <span>
                                    {achievement.progress || 0} / {achievement.target}
                                  </span>
                                </div>
                                <ProgressBar value={getProgressPercentage(achievement)} className="h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}