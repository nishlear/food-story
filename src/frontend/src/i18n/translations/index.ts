import { en } from './en';
import { vi } from './vi';
import { ko } from './ko';
import { ja } from './ja';
import { zhCN } from './zh-CN';
import { zhTW } from './zh-TW';
import { es } from './es';
import type { Language, Translations } from '../types';

export const translations: Record<Language, Translations> = {
  en,
  vi,
  ko,
  ja,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  es,
};

export const LANGUAGES: { code: Language; nativeName: string }[] = [
  { code: 'en',    nativeName: 'English' },
  { code: 'vi',    nativeName: 'Tiếng Việt' },
  { code: 'ko',    nativeName: '한국어' },
  { code: 'ja',    nativeName: '日本語' },
  { code: 'zh-CN', nativeName: '简体中文' },
  { code: 'zh-TW', nativeName: '繁體中文' },
  { code: 'es',    nativeName: 'Español' },
];
