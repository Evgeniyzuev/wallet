import React from 'react';
import { useLanguage } from '../LanguageContext';

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
  const { language } = useLanguage();
  
  const translations = {
    ru: {
      title: 'Ежедневный доход',
      days: 'Дни',
      core: 'Ядро',
      wallet: 'Кошелёк'
    },
    en: {
      title: 'Daily Income',
      days: 'Days',
      core: 'Core',
      wallet: 'Wallet'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">{t.title}</h2>
        <div className="text-gray-300 space-y-2 mb-6">
          <p>{t.days}: <span className="text-yellow-500 font-bold">{daysSkipped}</span></p>
          <p>{t.core}: <span className="text-green-500 font-bold">+{aicoreIncrease.toFixed(6)}$</span></p>
          <p>{t.wallet}: <span className="text-blue-500 font-bold">+{walletIncrease.toFixed(6)}$</span></p>
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