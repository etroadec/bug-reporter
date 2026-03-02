import { SupportedLocale, Translations } from '../types';
import { en } from './en';
import { fr } from './fr';

const translations: Record<SupportedLocale, Translations> = { en, fr };

export function getTranslations(locale: SupportedLocale = 'en'): Translations {
  return translations[locale] ?? translations.en;
}
