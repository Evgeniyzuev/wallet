import React, { useState, useEffect } from 'react';

interface InfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoPopup({ isOpen, onClose }: InfoPopupProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user has previously chosen to not show the popup
    const shouldShow = localStorage.getItem('hideInfoPopup');
    if (shouldShow === 'true') {
      onClose();
    }
  }, [onClose]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideInfoPopup', 'true');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-[#1c2033] rounded-lg p-2 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Как получать доход с WeAi?</h2>
        <p className="text-gray-300 mb-6">
          Ai технологии стремительно развиваются и учатся зарабатывать эффективнее.<br/>
          <br/>
          <b>WeAi</b> - первая Ai платформа, которая делит весь доход между пользователями.<br/>
          <br/>
          💲 Размер дохода каждого пользователя зависит от его личного Ai ядра<br/>
          🧠 Ai ядро работает всегда. Каждый день приносит доход и растет<br/>
          ✅ Бонусы за задания увеличивают ядро и доход<br/>
          <br/>
          🎯 Как быстро можно прокачать ядро до нужного дохода?<br/>
          🚀 Сейчас узнаем!
        </p>
        <div className="flex flex-col space-y-4">
          <label className="flex items-center space-x-2 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="appearance-none h-5 w-5 rounded-full border-2 border-blue-500 checked:bg-blue-500 checked:border-transparent transition duration-150 ease-in-out"
            />
            <span>Больше не показывать</span>
          </label>
          <button
            onClick={handleClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
} 