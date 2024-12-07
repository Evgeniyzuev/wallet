'use client'

import { useState, useEffect } from 'react'
import TaskPopup from '../components/TaskPopup'
import { tasks as initialTasks, Task } from './taskData'
import Image from 'next/image'
import { useUser } from '../UserContext';

export default function Home() {
  const { user, setUser, handleUpdateUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState('')
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [localTasks, setLocalTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [currentTask, setCurrentTask] = useState<Task>({
    taskId: 0,
    title: '',
    image: '',
    description: '',
    reward: 0,
    actionText: '',
    action: () => {},
    secondActionText: '',
    secondAction: () => {},
    isSecondActionEnabled: () => true
  })
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.telegramId) {
      fetchCompletedTasks();
    }
  }, []);

  useEffect(() => {
    // if (!isLoading) 
      {
      const filteredTasks = initialTasks.filter(task => !completedTasks.includes(task.taskId));
      setLocalTasks(filteredTasks.slice(0, 10));
    }
  }, [completedTasks, isLoading]);

  const handleOpenPopup = (task: Task) => {
    setCurrentTask(task);
    setIsPopupOpen(true);
  };

  const handleTaskCompletion = (completedTask: Task) => {
    setLocalTasks(prevTasks => prevTasks.filter(task => task.taskId !== completedTask.taskId));
    setIsPopupOpen(false);
  };

  const fetchCompletedTasks = async () => {
    if (!user?.telegramId) return;
    
    // First load from localStorage
    const localCompletedTasksStr = localStorage.getItem('completedTasks');
    const localCompletedTasks = localCompletedTasksStr ? JSON.parse(localCompletedTasksStr) : [];
    
    // Set initial state from localStorage
    setCompletedTasks(localCompletedTasks);
    
    try {
      const response = await fetch(`/api/completed-tasks?telegramId=${user?.telegramId}`);
      const data = await response.json();
      setCompletedTasks(data.completedTaskIds);
      localStorage.setItem('completedTasks', JSON.stringify(data.completedTaskIds));
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
      setError('Failed to fetch completed tasks');
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-dark-blue text-white h-screen flex flex-col">
      <h1 className="text-4xl text-center mb-8">Задания</h1> 
      {/* <div className="text-sm text-center text-yellow-300 flex-shrink-0">Выполненные задания: {completedTasks.join(', ')}</div> */}
      {/* display local tasks ids */}
      {/* <div className="text-sm text-center text-yellow-300 flex-shrink-0">Локальные задания: {localTasks.map(task => task.taskId).join(', ')}</div> */}
      <div className="flex flex-col items-center w-full px-4">
        {localTasks.map((task, index) => (
          <button 
            key={index}
            onClick={() => handleOpenPopup(task)}
            className="rounded-lg bg-gray-800 hover:bg-gray-700 transition-all text-white font-bold py-1 px-1 mt-1 w-full"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 mr-2 flex-shrink-0">
                <Image
                  src={task.image}
                  alt={task.title}
                  width={48}
                  height={48}
                  className="rounded-md w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow text-left">{task.title}
              <div className="text-sm text-green-300 flex-shrink-0">🔘{task.reward} $</div>

              </div>
              <div className="text-sm text-right text-yellow-300 flex-shrink-0">
                <span className="inline-block px-3 py-1 bg-yellow-500 text-black rounded-full text-xs font-bold">
                  START
                </span>
              </div>

            </div>
          </button>
        ))}
      </div>

      {notification && <p className="text-green-500 mt-2">{notification}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <TaskPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title={currentTask.title}
        description={currentTask.description}
        reward={currentTask.reward}
        onAction={currentTask.action}
        actionText={currentTask.actionText}
        onSecondAction={() => {
          currentTask.secondAction(user, handleUpdateUser, setNotification, () => handleTaskCompletion(currentTask), setError);
        }}
        secondActionText={currentTask.secondActionText}
        image={currentTask.image}
        isSecondActionEnabled={currentTask.isSecondActionEnabled}
      />
      {/* <Navigation /> */}
      {/* display completed tasks ids */}

    </main>
  )
}
