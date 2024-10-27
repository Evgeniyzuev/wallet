import React from 'react';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOpenBot = () => {
    window.open('https://t.me/WeAiBot_bot', '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-4 text-white">Welcome to WeAi! 👋</h2>
        <p className="text-gray-300 mb-6">
          To get started, please connect with our bot to unlock all features.
        </p>
        <button
          onClick={handleOpenBot}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg transition duration-300"
        >
          Connect with Bot
        </button>
      </div>
    </div>
  );
};

export default WelcomePopup;
