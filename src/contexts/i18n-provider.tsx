'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Locale = 'en' | 'zh';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 导入翻译文件
import enMessages from '@/messages/en.json';
import zhMessages from '@/messages/zh.json';

const messages: Record<Locale, Record<string, any>> = {
  en: enMessages,
  zh: zhMessages,
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

    if (savedLocale && ['en', 'zh'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else if (browserLang.startsWith('zh')) {
      setLocaleState('zh');
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
