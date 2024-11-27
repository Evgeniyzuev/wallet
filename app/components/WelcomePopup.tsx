import React from 'react';
import Image from 'next/image';
import welcomeImage from '../images/welcome.jpg';

interface WelcomePopupProps {
  onClose: () => void;
}

export default function WelcomePopup({ onClose }: WelcomePopupProps) {
  const handleBotClick = () => {
    window.open('https://t.me/WeAiBot_bot', '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1c2033] rounded-lg p-6 max-w-md w-full">
        <div className="w-full h-48 relative mb-6">
          <Image
            src={welcomeImage}
            alt="Welcome to WeAi"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Welcome to WeAi! 👋</h2>
        <p className="text-gray-300 mb-6">
          Зарабатывай и расти вместе с Ai🚀<br/>
          Сделай задания до 20 уровня🎯<br/> и достигни капитала 1,000,000$💵<br/><br/>
          Бот для связи: @WeAiBot_bot
        </p>
        <div className="flex justify-center">
          <button
            onClick={handleBotClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full"
          >
            Open Telegram Bot
          </button>
        </div>
      </div>
    </div>
  );
} 