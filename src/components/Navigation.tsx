import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, TrendingUp, Copy, History, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Bottom navigation bar for mobile-first design
 * Displays icons with labels for main app sections
 */
export function Navigation() {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/', label: t.nav.home, icon: Home },
    { path: '/workout', label: t.nav.workout, icon: Dumbbell },
    { path: '/history', label: t.nav.history, icon: History },
    { path: '/progress', label: t.nav.progress, icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav">
      <div className="container flex h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-all duration-200",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
