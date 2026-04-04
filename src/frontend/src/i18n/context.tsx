import React, { createContext, useContext, useState } from 'react';
import type { Language, Translations } from './types';
import { translations, LANGUAGES } from './translations/index';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'food-story-lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    return stored && stored in translations ? stored : 'en';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

export { LANGUAGES };

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

export function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

export function timeAgo(dateStr: string, t: Translations): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) {
    const n = Math.max(mins, 1);
    return interpolate(plural(n, t.minAgo, t.minsAgo), { n });
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return interpolate(plural(hours, t.hourAgo, t.hoursAgo), { n: hours });
  }
  const days = Math.floor(hours / 24);
  return interpolate(plural(days, t.dayAgo, t.daysAgo), { n: days });
}
