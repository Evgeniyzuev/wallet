import React from 'react';

interface DailyRewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  daysSkipped: number;
  aicoreIncrease: number;
  walletIncrease: number;
}

const DailyRewardPopup: React.FC<DailyRewardPopupProps> = ({
  isOpen,
  onClose,
  daysSkipped,
  aicoreIncrease,
  walletIncrease
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Daily Rewards Accumulated</h2>
        <div className="text-gray-300 space-y-2 mb-6">
          <p>Days skipped: <span className="text-yellow-500 font-bold">{daysSkipped}</span></p>
          <p>Core increase: <span className="text-green-500 font-bold">{aicoreIncrease.toFixed(2)}$</span></p>
          <p>Wallet increase: <span className="text-blue-500 font-bold">{walletIncrease.toFixed(2)}$</span></p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default DailyRewardPopup; 