import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTaskValidation } from '../hooks/useTaskValidation';
import Modal from './Modal';

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
}

export default function TaskPopup({
  isOpen,
  onClose,
  title,
  description,
  reward,
  onAction,
  actionText,
  onSecondAction,
  secondActionText,
  image
}: TaskPopupProps) {
  const { isTaskEnabled } = useTaskValidation();
  const [isEnabled, setIsEnabled] = useState(false);
  const taskId = title === 'Желаемый размер дохода' ? 2 : 
                 title === 'Желаемые изменения' ? 1 : 
                 title === 'Ai угроза и возможность' ? 3 :
                 title === 'Subscribe to the channel' ? 4 :
                 title === 'Прокачать ядро' ? 5 :
                 title === 'Секретный код' ? 6 :
                 title === 'Проверить ввод и вывод средств' ? 7 : 0;

  useEffect(() => {
    const checkEnabled = () => {
      setIsEnabled(isTaskEnabled(taskId));
    };

    checkEnabled();
    // Set up interval to check periodically
    const interval = setInterval(checkEnabled, 1000);

    return () => clearInterval(interval);
  }, [taskId, isTaskEnabled]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 bg-opacity-80 rounded-t-2xl p-4 w-full max-w-2xl h-[100vh] overflow-y-auto animate-slide-up text-white">
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
          className="text-white mb-6 whitespace-pre-wrap break-words text-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <div className="mt-4 flex justify-between">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              {actionText}
            </button>
          )}
          <button
            onClick={onSecondAction}
            disabled={!isEnabled}
            className={`${
              isEnabled
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-500 cursor-not-allowed'
            } text-white font-bold py-2 px-4 rounded`}
          >
            {secondActionText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
