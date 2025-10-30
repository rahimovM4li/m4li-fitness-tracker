import { Card, CardContent } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

const QUOTES = [
  "No excuses today 💪",
  "Progress, not perfection",
  "Every rep counts",
  "Your only limit is you",
  "Make it happen",
  "Train insane or remain the same",
  "Success starts with self-discipline",
  "Push harder than yesterday",
  "The pain you feel today will be the strength you feel tomorrow",
  "Don't wish for it, work for it",
  "Strive for progress, not perfection",
  "Your body can stand almost anything. It's your mind you have to convince",
  "The only bad workout is the one that didn't happen",
  "Consistency is what transforms average into excellence",
  "You don't have to be extreme, just consistent",
];

interface QuoteState {
  quote: string;
  date: string;
}

/**
 * Widget displaying daily motivational quotes
 */
export function MotivationalQuote() {
  const { t } = useLanguage();
  const [quoteState, setQuoteState] = useLocalStorage<QuoteState>('daily-quote', {
    quote: QUOTES[0],
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [displayQuote, setDisplayQuote] = useState(quoteState.quote);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Check if we need a new quote for today
    if (quoteState.date !== today) {
      // Use date-based index for consistency throughout the day
      const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const newQuote = QUOTES[dayOfYear % QUOTES.length];
      
      setQuoteState({
        quote: newQuote,
        date: today,
      });
      setDisplayQuote(newQuote);
    }
  }, [quoteState.date, setQuoteState]);

  return (
    <Card className="gradient-card border-primary/20 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10 shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t.motivational.dailyMotivation}</p>
            <p className="text-lg font-semibold text-gradient">{displayQuote}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}