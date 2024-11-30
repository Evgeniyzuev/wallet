'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Add this type definition
type TranslationKey = 'send' | 'clear_chat' | 'enter_message' | 'wallet_balance' | 
  'Core' | 'Ai' | 'Wallet' | 'Tasks' | 'Frens' | 'Goals';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      // First check localStorage
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) {
        return savedLanguage;
      }

      // Then try to get language from Telegram WebApp
      try {
        const tg = WebApp;
        const userLanguage = tg.initDataUnsafe?.user?.language_code;
        
        // Check if the language code is supported (ru or en)
        if (userLanguage === 'ru') {
          return 'ru';
        }
      } catch (error) {
        console.error('Error getting Telegram language:', error);
      }

      // Default to English if nothing else is available
      return 'en';
    }
    return 'en';
  });

  // Translation object
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

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: TranslationKey) => {
    return translations[language as keyof typeof translations]?.[key] || key;
  };

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