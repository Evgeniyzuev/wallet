'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type TranslationKey = 'send' | 'clear_chat' | 'enter_message' | 'wallet_balance' | 
  'Core' | 'Ai' | 'Wallet' | 'Tasks' | 'Frens' | 'Goals';

const translations = {
  ru: {
    'send': 'Отправить',
    'clear_chat': 'Очистить чат',
    'enter_message': 'Введите сообщение...',
    'wallet_balance': 'Баланс кошелька',
    'Core': 'Ядро',
    'Ai': 'Ии',
    'Wallet': 'Кошелек',
    'Tasks': 'Задачи',
    'Frens': 'Друзья',
    'Goals': 'Цели'
  },
  en: {
    'send': 'Send',
    'clear_chat': 'Clear Chat',
    'enter_message': 'Enter message...',
    'wallet_balance': 'Wallet Balance',
    'Core': 'Core',
    'Ai': 'Ai',
    'Wallet': 'Wallet',
    'Tasks': 'Tasks',
    'Frens': 'Frens',
    'Goals': 'Goals'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      } else {
        try {
          const tg = WebApp;
          const userLanguage = tg.initDataUnsafe?.user?.language_code;
          if (userLanguage === 'ru') {
            setLanguage('ru');
          }
        } catch (error) {
          console.error('Error getting Telegram language:', error);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language, isInitialized]);

  const t = (key: TranslationKey) => {
    return translations[language as keyof typeof translations]?.[key] || key;
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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