'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Locale = 'en' | 'zh' | 'es' | 'de' | 'fr' | 'ja' | 'ko' | 'pt' | 'it' | 'ru' | 'ar' | 'hi' | 'nl' | 'tr' | 'id' | 'pl' | 'sv' | 'vi';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 导入翻译文件
import enMessages from '@/messages/en.json';
import zhMessages from '@/messages/zh.json';
import esMessages from '@/messages/es.json';
import deMessages from '@/messages/de.json';
import frMessages from '@/messages/fr.json';
import jaMessages from '@/messages/ja.json';
import koMessages from '@/messages/ko.json';
import ptMessages from '@/messages/pt.json';
import itMessages from '@/messages/it.json';
import ruMessages from '@/messages/ru.json';
import arMessages from '@/messages/ar.json';
import hiMessages from '@/messages/hi.json';
import nlMessages from '@/messages/nl.json';
import trMessages from '@/messages/tr.json';
import idMessages from '@/messages/id.json';
import plMessages from '@/messages/pl.json';
import svMessages from '@/messages/sv.json';
import viMessages from '@/messages/vi.json';

const messages: Record<Locale, Record<string, any>> = {
  en: enMessages,
  zh: zhMessages,
  es: esMessages,
  de: deMessages,
  fr: frMessages,
  ja: jaMessages,
  ko: koMessages,
  pt: ptMessages,
  it: itMessages,
  ru: ruMessages,
  ar: arMessages,
  hi: hiMessages,
  nl: nlMessages,
  tr: trMessages,
  id: idMessages,
  pl: plMessages,
  sv: svMessages,
  vi: viMessages,
};

// 扁平化获取翻译的辅助函数
function getNestedValue(obj: Record<string, any>, path: string): string {
  const result = path.split('.').reduce((acc, key) => acc?.[key], obj);
  return typeof result === 'string' ? result : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // 检测浏览器语言
    const browserLang = navigator.language.toLowerCase();
    const savedLocale = localStorage.getItem('o2o_locale') as Locale | null;

    if (savedLocale && ['en', 'zh', 'es', 'de', 'fr', 'ja', 'ko', 'pt', 'it', 'ru', 'ar', 'hi', 'nl', 'tr', 'id', 'pl', 'sv', 'vi'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else if (browserLang.startsWith('zh')) {
      setLocaleState('zh');
    } else if (browserLang.startsWith('es')) {
      setLocaleState('es');
    } else if (browserLang.startsWith('de')) {
      setLocaleState('de');
    } else if (browserLang.startsWith('fr')) {
      setLocaleState('fr');
    } else if (browserLang.startsWith('ja')) {
      setLocaleState('ja');
    } else if (browserLang.startsWith('ko')) {
      setLocaleState('ko');
    } else if (browserLang.startsWith('pt')) {
      setLocaleState('pt');
    } else if (browserLang.startsWith('it')) {
      setLocaleState('it');
    } else if (browserLang.startsWith('ru')) {
      setLocaleState('ru');
    } else if (browserLang.startsWith('ar')) {
      setLocaleState('ar');
    } else if (browserLang.startsWith('hi')) {
      setLocaleState('hi');
    } else if (browserLang.startsWith('nl')) {
      setLocaleState('nl');
    } else if (browserLang.startsWith('tr')) {
      setLocaleState('tr');
    } else if (browserLang.startsWith('id')) {
      setLocaleState('id');
    } else if (browserLang.startsWith('pl')) {
      setLocaleState('pl');
    } else if (browserLang.startsWith('sv')) {
      setLocaleState('sv');
    } else if (browserLang.startsWith('vi')) {
      setLocaleState('vi');
    } else {
      setLocaleState('en');
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('o2o_locale', newLocale);
  };

  const t = (key: string): string => {
    const value = getNestedValue(messages[locale], key);
    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
