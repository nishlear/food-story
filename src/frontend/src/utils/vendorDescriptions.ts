import type { Language, VendorDescriptionTranslations } from '../types';

const FALLBACK_ORDER: Language[] = ['vi', 'en', 'ko', 'ja', 'zh-CN', 'zh-TW', 'es'];

function clean(text: string | null | undefined): string | null {
  if (typeof text !== 'string') return null;
  const value = text.trim();
  return value ? value : null;
}

export function getDescriptionForLanguage(
  descriptions: VendorDescriptionTranslations | null | undefined,
  language: Language
): string | null {
  if (!descriptions) return null;

  const direct = clean(descriptions[language]);
  if (direct) return direct;

  for (const fallbackLanguage of FALLBACK_ORDER) {
    const fallback = clean(descriptions[fallbackLanguage]);
    if (fallback) return fallback;
  }

  for (const value of Object.values(descriptions)) {
    const fallback = clean(value);
    if (fallback) return fallback;
  }

  return null;
}
