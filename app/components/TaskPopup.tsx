import React from 'react';
import Image from 'next/image';

interface TaskPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  reward: number;
  onAction?: () => void;
  actionText?: string;
  onSecondAction: () => void;
  secondActionText: string;
  image: string;
  isSecondActionEnabled?: () => boolean;
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
  secondActionText,
  image,
  isSecondActionEnabled
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center">
      <div className="bg-gray-800 bg-opacity-80 rounded-t-2xl p-6 w-full max-w-2xl h-[70vh] overflow-y-auto animate-slide-up text-white">
        <button onClick={onClose} className="float-right text-gray-300 hover:text-white">&times;</button>
        <div className="flex items-center mb-2">
          <div className="w-20 h-20 mr-4">
            <Image
              src={image}
              alt={title}
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <div>
            <div className="text-green-400 font-bold text-xl mt-0">🌟{reward} $</div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p 
          className="text-gray-300 mb-6 whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <div className="flex space-x-4 mb-10">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg transition duration-300"
            >
              {actionText}
            </button>
          )}
          <button
            onClick={onSecondAction}
            disabled={isSecondActionEnabled ? !isSecondActionEnabled() : false}
            className={`flex-1 ${
              isSecondActionEnabled && !isSecondActionEnabled() 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white py-3 rounded-lg text-lg transition duration-300`}
          >
            {secondActionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;
