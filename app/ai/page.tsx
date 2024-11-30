'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import aissistImage from '../images/aissist0.png'; 
import coreImage from '../images/brain.jpg';
import { INITIAL_SYSTEM_PROMPT } from '../constants/prompts';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function AiPage() {
  const { user } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        return JSON.parse(savedMessages);
      }
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      if (typeof window !== 'undefined') {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        } else {
          setIsAiTyping(true);
          try {
            const userPrompt = `${INITIAL_SYSTEM_PROMPT} Обращайтесь к пользователю по имени: ${user?.firstName || 'пользователь'}. Уровень пользователя: ${user?.level || 0}. Используйте язык: ${language}.`;
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ messages: [{ role: 'system', content: userPrompt }] }),
            });

            if (!response.ok) {
              throw new Error('Failed to get response from AI');
            }

            const data = await response.json();
            const aiMessage: Message = { role: 'assistant', content: data.content };
            setMessages([aiMessage]);
            localStorage.setItem('chatMessages', JSON.stringify([aiMessage]));
          } catch (error) {
            console.error('Error getting initial AI response:', error);
            const errorMessage: Message = { role: 'assistant', content: "Извините, произошла ошибка при инициализации чата. Пожалуйста, попробуйте обновить страницу." };
            setMessages([errorMessage]);
          } finally {
            setIsAiTyping(false);
          }
        }
      }
    };

    initializeChat();
  }, [user, language]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: Message = { role: 'user', content: input };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsAiTyping(true);

      const systemMessage: Message = { 
        role: 'system', 
        content: `Уровень пользователя: ${user?.level || 0}. Используйте язык: ${language}. Адаптируйте свой ответ соответственно.`
      };

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: [...messages, systemMessage, userMessage] }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response from AI');
        }

        const data = await response.json();
        const aiMessage: Message = { role: 'assistant', content: data.content };
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorMessage: Message = { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again later." };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsAiTyping(false);
      }
    }
  };

  const clearChat = async () => {
    setIsAiTyping(true);
    setMessages([]);
    localStorage.removeItem('chatMessages');
    setIsSettingsOpen(false);

    try {
      const userPrompt = `${INITIAL_SYSTEM_PROMPT} Обращайтесь к пользователю по имени: ${user?.firstName || 'пользователь'}. Уровень пользователя: ${user?.level || 0}. Используйте язык: ${language}.`;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [{ role: 'system', content: userPrompt }] }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const aiMessage: Message = { role: 'assistant', content: data.content };
      setMessages([aiMessage]);
      localStorage.setItem('chatMessages', JSON.stringify([aiMessage]));
    } catch (error) {
      console.error('Error getting initial AI response:', error);
      const errorMessage: Message = { role: 'assistant', content: "Извините, произошла ошибка при очистке чата. Пожалуйста, попробуйте еще раз." };
      setMessages([errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };


  return (
    <main className="bg-dark-blue text-white h-screen flex flex-col">
      <div className="h-30 flex relative">
        <div className="w-1/2">
          <Image src={coreImage} alt="AI Core" layout="responsive" objectFit="cover" />
        </div>
        <div className="w-1/2">
          <Image src={aissistImage} alt="AI Assistant" layout="responsive" objectFit="cover" />
        </div>
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="text-2xl bg-blue-700 bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300"
          >
            ⚙️
          </button>
          {isSettingsOpen && (
            <div className="absolute w-48 top-10 right-0 bg-gray-800 p-4 rounded shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setLanguage('en')}
                  className={`
                    ${language === 'en' ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-500 hover:bg-gray-700'}
                    w-20 text-white font-bold py-2 px-4 rounded
                  `}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('ru')}
                  className={`
                    ${language === 'ru' ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-500 hover:bg-gray-700'}
                    w-20 text-white font-bold py-2 px-4 rounded
                  `}
                >
                  RU
                </button>
              </div>
              <button
                onClick={() => {
                  clearChat();
                  setIsSettingsOpen(false);
                }}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
              >
                {t('clear_chat')}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-y-auto p-4 pb-20 mb-10">
        {messages.filter(msg => msg.role !== 'system').map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'ml-1' : 'mr-1'}`}>
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isAiTyping && (
          <div className="mb-2 text-left">
            <div className="inline-block p-2 rounded-lg bg-gray-700 text-white">
              ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="fixed bottom-8 left-0 right-0 p-4 mb-2">
        <div className="flex max-w-screen-lg mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow border border-gray-300 rounded-l-lg p-2 bg-gray-700 text-white"
            placeholder={t('enter_message')}
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white rounded-r-lg p-2"
          >
            {t('send')}
          </button>
        </div>
      </div>
    </main>
  );
}
