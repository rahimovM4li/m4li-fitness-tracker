import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/translations';
import { de, enUS, ru, type Locale } from 'date-fns/locale';

export type Language = 'de' | 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.de;
  locale: Locale;
}

const localeMap: Record<Language, Locale> = {
  de,
  en: enUS,
  ru,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Auto-detect browser language
const detectLanguage = (): Language => {
  const stored = localStorage.getItem('language');
  if (stored && (stored === 'de' || stored === 'ru' || stored === 'en')) {
    return stored as Language;
  }
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('ru')) return 'ru';
  return 'en'; // Default to English
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    locale: localeMap[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
