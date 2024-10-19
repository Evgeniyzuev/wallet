import React from 'react';
import TonConnect from '../wallet/tonconnect';

interface ReceivePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReceivePopup: React.FC<ReceivePopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center">
      <div className="bg-gray-800 rounded-t-2xl p-6 w-full h-[50vh] animate-slide-up">
        <button onClick={onClose} className="float-right text-gray-300 hover:text-white">&times;</button>
        <h2 className="text-2xl font-bold mb-4">Receive TON</h2>
        console.log('Rendering TonConnect in popup');
        <TonConnect />
      </div>
    </div>
  );
};

export default ReceivePopup;
