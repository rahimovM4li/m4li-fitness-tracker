import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: boolean;
  className?: string;
}

/**
 * Card component for displaying statistics on the dashboard
 */
export function StatCard({ title, value, icon: Icon, gradient, className }: StatCardProps) {
return (
  <Card
    className={cn(
      "animate-fade-in transition-all duration-200 hover:scale-105 active:scale-95 glass-strong",
      gradient && "border-primary/30",
      className
    )}
  >
    <CardContent className="p-4 sm:p-5 md:p-6">
      <div
        className={cn(
          // flex-wrap + zentrieren, damit Icons sich bei schmalem Platz umbrechen
          "flex flex-wrap items-center justify-between gap-3 sm:gap-4"
        )}
      >
        <div className="space-y-0.5 md:space-y-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p
            className={cn(
              "text-xl sm:text-2xl md:text-3xl font-bold break-words",
              gradient && "text-gradient"
            )}
          >
            {value}
          </p>
        </div>

        {/* Icon-Container */}
        <div
          className={cn(
            "p-2 sm:p-3 rounded-lg glass flex-shrink-0",
            gradient ? "bg-primary/20 border-primary/30" : "bg-accent/20 border-accent/30"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5 sm:h-6 sm:w-6",
              gradient ? "text-primary" : "text-accent"
            )}
          />
        </div>
      </div>
    </CardContent>
  </Card>
);
}
