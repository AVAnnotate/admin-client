import type { Translations } from '@ty/Types.ts';

// @ts-ignore
import en from './en';

export const languages = {
  en: 'English',
};

export const defaultLang = 'en';

const labels = { en };

const defaultLabels = labels[defaultLang];

export const getLangFromUrl = (url: URL) => {
  const [, lang] = url.pathname.split('/');
  if (lang in labels) return lang as keyof typeof labels;
  return defaultLang;
};

export const getTranslationsFromUrl = (
  url: string,
  dictionary: keyof typeof defaultLabels
): Translations => {
  const lang = getLangFromUrl(new URL(url));

  return {
    lang,
    t: {
      ...defaultLabels[dictionary],
      ...labels[lang][dictionary],
    },
  };
};

export const getTranslations = (
  request: Request,
  dictionary: keyof typeof defaultLabels
): Translations => getTranslationsFromUrl(request.url, dictionary);
