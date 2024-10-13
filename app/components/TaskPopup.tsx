import React from 'react';

interface TaskPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  reward: string;
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
      <div className="bg-white rounded-t-2xl p-4 w-full max-w-md animate-slide-up">
        <button onClick={onClose} className="float-right text-gray-500">&times;</button>
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-purple-500 rounded-lg mx-auto mb-2"></div>
          <div className="text-orange-500 font-bold">{reward}</div>
        </div>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex space-x-2">
          <button
            onClick={onAction}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg"
          >
            {actionText}
          </button>
          <button
            onClick={onSecondAction}
            className="flex-1 bg-green-500 text-white py-2 rounded-lg"
          >
            {secondActionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;
