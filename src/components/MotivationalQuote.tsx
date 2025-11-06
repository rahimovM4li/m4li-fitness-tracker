import { Card, CardContent } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ca, de } from 'date-fns/locale';

interface QuoteState {
  date: string; // nur Datum merken
}

/**
 * Widget: tägliche Motivation — Deutsch & Russisch
 */
export function MotivationalQuote() {
  const { t, language } = useLanguage();

  // Zitate
  const QUOTES = useMemo(
    () => ({
      de: [
        'Heute keine Ausreden 💪',
        'Fortschritt, nicht Perfektion',
        'Jede Wiederholung zählt',
        'Deine einzige Grenze bist du selbst',
        'Mach es einfach möglich',
        'Trainiere verrückt oder bleib der Gleiche',
        'Erfolg beginnt mit Selbstdisziplin',
        'Drück härter als gestern',
        'Der Schmerz von heute ist die Stärke von morgen',
        'Wünsch es dir nicht – arbeite dafür',
        'Strebe nach Fortschritt, nicht nach Perfektion',
        'Dein Körper kann fast alles – du musst nur deinen Geist überzeugen',
        'Das einzige schlechte Training ist das, das nicht stattgefunden hat',
        'Konstanz verwandelt Durchschnitt in Exzellenz',
        'Du musst nicht extrem sein, nur konsequent',
      ],
      ru: [
        'Без оправданий сегодня 💪',
        'Прогресс, а не совершенство',
        'Каждое повторение имеет значение',
        'Твой единственный предел — это ты сам',
        'Просто сделай это возможным',
        'Тренируйся как зверь или оставайся тем же',
        'Успех начинается с самодисциплины',
        'Жми сильнее, чем вчера',
        'Боль сегодня — сила завтра',
        'Не желай — действуй',
        'Стремись к прогрессу, а не к идеалу',
        'Твоё тело выдержит всё — убедить нужно разум',
        'Плохая тренировка — это та, что не состоялась',
        'Постоянство превращает среднее в выдающееся',
        'Не будь экстремальным — будь последовательным',
      ],
      en: [
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
      ],
    }),
    []
  );

  // LocalStorage nur für Datum, nicht für Zitat
  const [quoteState, setQuoteState] = useLocalStorage<QuoteState>('daily-quote', {
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Quote basierend auf Tag und Sprache
  const displayQuote = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const dayOfYear =
      Math.floor(
        (new Date().getTime() -
          new Date(new Date().getFullYear(), 0, 0).getTime()) /
          86400000
      ) % QUOTES.de.length;

    // Update Datum falls anders
    if (quoteState.date !== today) {
      setQuoteState({ date: today });
    }
    switch (language) {
      case 'de':
        return QUOTES.de[dayOfYear];
      case 'ru':
        return QUOTES.ru[dayOfYear];
      case 'en':
        return QUOTES.en[dayOfYear];
        default:
          return QUOTES.en[dayOfYear];
    }   

  }, [language, quoteState.date, QUOTES, setQuoteState]);

  return (
    <Card className="gradient-card border-primary/20 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10 shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {t.motivational.dailyMotivation}
            </p>
            <p className="text-lg font-semibold text-gradient">{displayQuote}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
