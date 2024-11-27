import React from 'react';

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
        <h2 className="text-2xl font-bold text-white mb-4">Welcome to WeAi! 👋</h2>
        <p className="text-gray-300 mb-6">
          To get started with WeAi, please visit our Telegram bot first. This will help us set up your account properly.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={handleBotClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Open Telegram Bot
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 