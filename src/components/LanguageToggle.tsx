import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Language toggle button to switch between English, German, and Russian
 */
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const languageLabels: Record<Language, string> = {
    en: 'EN',
    de: 'DE',
    ru: 'RU',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
  
      className="absolute top-0 right-3 md:top-4 md:right-4 z-50 gap-1.5 md:gap-2 h-9 md:h-10 px-2.5 md:px-3 touch-manipulation"
        >
          <Languages className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="font-medium text-xs md:text-sm">{languageLabels[language]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass">
        <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('de')} className="cursor-pointer">
          🇩🇪 Deutsch
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('ru')} className="cursor-pointer">
          🇷🇺 Русский
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
