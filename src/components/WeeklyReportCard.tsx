import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WeeklyReport } from '@/types/workout';
import { TrendingUp, Dumbbell, Award, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeeklyReportCardProps {
  report: WeeklyReport;
  onViewHistory?: () => void;
}

/**
 * Card displaying weekly workout summary
 */
export function WeeklyReportCard({ report, onViewHistory }: WeeklyReportCardProps) {
  const { t, locale } = useLanguage();
  
  return (
    <Card className="animate-fade-in border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {t.weeklyReport.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(new Date(report.weekStart), 'MMM d', { locale })} - {format(new Date(report.weekEnd), 'MMM d, yyyy', { locale })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Dumbbell className="h-4 w-4" />
              <span className="text-xs">{t.weeklyReport.workouts}</span>
            </div>
            <p className="text-2xl font-bold">{report.totalWorkouts}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">{t.weeklyReport.volume}</span>
            </div>
            <p className="text-2xl font-bold">{(report.totalVolume / 1000).toFixed(1)}k</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Award className="h-4 w-4" />
              <span className="text-xs">{t.weeklyReport.prs}</span>
            </div>
            <p className="text-2xl font-bold">{report.personalRecords}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.weeklyReport.weeklyGoal}</span>
            <span className="font-medium">{Math.min(100, Math.round((report.totalWorkouts / 4) * 100))}%</span>
          </div>
          <Progress value={Math.min(100, (report.totalWorkouts / 4) * 100)} className="h-2" />
          <p className="text-xs text-muted-foreground">{t.weeklyReport.goal}</p>
        </div>

        {onViewHistory && (
          <Button variant="outline" className="w-full" onClick={onViewHistory}>
            {t.weeklyReport.viewAllReports}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
