'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import aissistImage from '../images/aissist.png'; 
import coreImage from '../images/core.jpg';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: Message = { role: 'user', content: input };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsAiTyping(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  return (
    <main className="bg-dark-blue text-white h-screen flex flex-col">
      <div className="h-1/4 overflow-hidden flex">
        <div className="w-1/2">
          <Image src={coreImage} alt="AI Core" layout="responsive" objectFit="cover" />
        </div>
        <div className="w-1/2">
          <Image src={aissistImage} alt="AI Assistant" layout="responsive" objectFit="cover" />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-4 pb-20 mb-10">
        {messages.map((msg, index) => (
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
      {/* <Navigation /> */}
    </main>
  );
}
