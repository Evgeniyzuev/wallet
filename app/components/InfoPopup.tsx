import React from 'react';

interface InfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoPopup({ isOpen, onClose }: InfoPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1c2033] rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Как получать доход с WeAi?</h2>
        <p className="text-gray-300 mb-6">
          Ai технологии стремительно развиваются и учится зарабатывать эффективнее.<br/>
          WeAi - первая Ai платформа, которая делит весь доход между пользователями.<br/>
          <br/>
          💲 Размер дохода каждого пользователя зависит от его личного Ai ядра<br/>
          ☢️ Ai ядро работает всегда. Каждый день приносит доход и растет<br/>
          ✅ Бонусы за задания увеличивают ядро и доход<br/>
          <br/>
          🎯 Как быстро можно прокачать ядро до нужного дохода?<br/>
          🚀 Сейчас узнаем!
        </p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
} 