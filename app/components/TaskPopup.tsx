import React from 'react';
import Image from 'next/image';
import core from '../images/core-xs.jpg';

interface TaskPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  reward: number;
  onAction: () => void;
  actionText: string;
  onSecondAction: () => void;
  secondActionText: string;
}

const TaskPopup: React.FC<TaskPopupProps> = ({
  isOpen,
  onClose,
  title,
  description,
  reward,
  onAction,
  actionText,
  onSecondAction,
  secondActionText
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center">
      <div className="bg-gray-800 bg-opacity-80 rounded-t-2xl p-6 w-full max-w-2xl h-[70vh] overflow-y-auto animate-slide-up text-white">
        <button onClick={onClose} className="float-right text-gray-300 hover:text-white">&times;</button>
        <div className="text-center mb-6">
            {/* <div className="w-20 h-20 bg-purple-500 rounded-lg mx-auto mb-3"></div> */}
          <div className="w-20 h-20 mx-auto mb-3">
            <Image
              src={core}
              alt="Core"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <div className="text-green-400 font-bold text-xl">🔘{reward} $</div>
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{description}</p>
        <div className="flex space-x-4">
          <button
            onClick={onAction}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg transition duration-300"
          >
            {actionText}
          </button>
          <button
            onClick={onSecondAction}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg transition duration-300"
          >
            {secondActionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;
