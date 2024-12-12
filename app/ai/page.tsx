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
  image?: {
    mimeType: string;
    data: string;
  };
}

interface AiPageProps {
  // существующие пропсы
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
  const [selectedModel, setSelectedModel] = useState<'groq' | 'gemini'>('groq');

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
        const endpoint = selectedModel === 'groq' ? '/api/chat' : '/api/gemini';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: [...messages, systemMessage, userMessage] }),
        });

        if (!response.ok) {
          throw new Error(`Failed to get response from ${selectedModel} AI`);
        }

        const data = await response.json();
        const aiMessage: Message = { role: 'assistant', content: data.content };
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorMessage: Message = { 
          role: 'assistant', 
          content: "Произошла ошибка. Пожалуйста, попробуйте позже." 
        };
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
      const endpoint = selectedModel === 'groq' ? '/api/chat' : '/api/gemini';
      const userPrompt = `${INITIAL_SYSTEM_PROMPT} Обращайтесь к пользователю по имени: ${user?.firstName || 'пользователь'}. Уровень пользователя: ${user?.level || 0}. Используйте язык: ${language}.`;
      
      const response = await fetch(endpoint, {
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
      const errorMessage: Message = { 
        role: 'assistant', 
        content: "Извините, произошла ошибка при очистке чата. Пожалуйста, попробуйте еще раз." 
      };
      setMessages([errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Конвертируем файл в base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const userMessage: Message = {
        role: 'user',
        content: 'Что изображено на этой картинке?',
        image: {
          mimeType: file.type,
          data: base64Data
        }
      };

      setMessages(prev => [...prev, userMessage]);
      setIsAiTyping(true);

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [userMessage] }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.content 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Произошла ошибка при обработке изображения.' 
      }]);
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
              <div className="flex items-center justify-end mb-4">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as 'groq' | 'gemini')}
                  className="bg-gray-700 text-white rounded px-3 py-1"
                >
                  <option value="groq">Groq</option>
                  <option value="gemini">Gemini</option>
                </select>
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
        <div className="flex max-w-screen-lg mx-auto gap-2">
          <label
            htmlFor="imageUpload"
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-2 cursor-pointer"
          >
            📷
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            className="hidden"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow border border-gray-300 rounded-lg p-2 bg-gray-700 text-white"
            placeholder={t('enter_message')}
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 hover:bg-blue-700 text-white rounded-lg p-2"
          >
            {t('send')}
          </button>
        </div>
      </div>
    </main>
  );
}
