import { useAchievements } from '@/hooks/useAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Page displaying achievements and badges
 */
export default function Achievements() {
  const { achievements, getUnlockedCount, getProgressPercentage } = useAchievements();
  const { t, locale } = useLanguage();

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <main className="min-h-screen pb-20 px-4 pt-6">
      <div className="container max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient flex items-center gap-3">
            <Trophy className="h-10 w-10" />
            {t.achievements.title}
          </h1>
          <p className="text-muted-foreground">
            {getUnlockedCount()} {t.common.of} {achievements.length} {t.achievements.title.toLowerCase()}
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="animate-fade-in gradient-card border-primary/20" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.achievements.overallProgress}</span>
                <span className="text-2xl font-bold text-gradient">
                  {Math.round((getUnlockedCount() / achievements.length) * 100)}%
                </span>
              </div>
              <Progress value={(getUnlockedCount() / achievements.length) * 100} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold">{t.achievements.unlocked}</h2>
            <div className="grid gap-4">
              {unlockedAchievements.map((achievement) => (
                <Card key={achievement.id} className="gradient-card border-primary/20 hover:scale-105 transition-transform">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl shrink-0">{achievement.icon}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold text-gradient">{achievement.name}</h3>
                          {achievement.unlockedAt && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {format(new Date(achievement.unlockedAt), 'MMM d, yyyy', { locale })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.target && (
                          <div className="pt-2">
                            <Progress value={100} className="h-2" />
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
            <h2 className="text-2xl font-bold">{t.achievements.inProgress}</h2>
            <div className="grid gap-4">
              {lockedAchievements.map((achievement) => (
                <Card key={achievement.id} className="opacity-75 hover:opacity-100 transition-opacity">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className="text-4xl grayscale">{achievement.icon}</div>
                        <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-bold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.target && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{t.achievements.progress}</span>
                              <span>
                                {achievement.progress || 0} / {achievement.target}
                              </span>
                            </div>
                            <Progress value={getProgressPercentage(achievement)} className="h-2" />
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
      </div>
    </main>
  );
}