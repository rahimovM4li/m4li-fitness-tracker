import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';

/**
 * Language toggle button to switch between German and Russian
 */
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'de' ? 'ru' : 'de');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="absolute top-0 right-3 md:top-4 md:right-4 z-50 gap-1.5 md:gap-2 h-9 md:h-10 px-2.5 md:px-3 touch-manipulation"
    >
      <Languages className="h-3.5 w-3.5 md:h-4 md:w-4" />
      <span className="font-medium text-xs md:text-sm">{language === 'de' ? 'DE' : 'RU'}</span>
    </Button>
  );
}
