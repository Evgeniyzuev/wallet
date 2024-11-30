import React from 'react';

interface LevelUpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
}

const LevelUpPopup: React.FC<LevelUpPopupProps> = ({
  isOpen,
  onClose,
  newLevel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-4">Congratulations!</h2>
        <div className="text-gray-300 space-y-2 mb-6">
          <p>You've reached</p>
          <p className="text-4xl font-bold text-yellow-500">Level {newLevel}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};

export default LevelUpPopup; 