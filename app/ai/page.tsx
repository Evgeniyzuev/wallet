'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import aissistImage from '../images/aissist.png';
import Navigation from '../components/Navigation';

interface Message {
  text: string;
  isUser: boolean;
}

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      setMessages(prevMessages => [...prevMessages, { text: input, isUser: true }]);
      setInput('');
      setIsAiTyping(true);

      // Имитация ответа ИИ
      setTimeout(() => {
        setIsAiTyping(false);
        setMessages(prevMessages => [...prevMessages, { text: "Ai not available yet", isUser: false }]);
      }, 2000); // Задержка в 2 секунды для имитации обработки
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  return (
    <main className="bg-black text-white h-screen flex flex-col">
      <div className="h-1/3 overflow-hidden">
        <Image src={aissistImage} alt="AI Assistant" layout="responsive" objectFit="cover" />
      </div>
      <div className="flex-grow overflow-y-auto p-4 pb-20">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.isUser ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.isUser ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
              }`}
            >
              {msg.text}
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
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-gray-800">
        <div className="flex max-w-screen-lg mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow border border-gray-300 rounded-l-lg p-2 bg-gray-700 text-white"
            placeholder="Введите сообщение..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white rounded-r-lg p-2"
          >
            Отправить
          </button>
        </div>
      </div>
      <Navigation />
    </main>
  );
}
