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
    reward: '',
    actionText: '',
    action: () => {},
    secondActionText: '',
    secondAction: () => {}
  })

  useEffect(() => {
    const initializeTasks = async () => {
      try {
        await fetchCompletedTasks();
      } catch (error) {
        console.error('Error initializing tasks:', error);
        setError('Failed to load tasks');
      }
    };

    initializeTasks();
  }, []);

  useEffect(() => {
    let tasks = initialTasks
    tasks = tasks.filter(task => !completedTasks.includes(task.taskId))
    setLocalTasks(tasks)
  }, [completedTasks])

  const handleOpenPopup = (task: Task) => {
    setCurrentTask(task);
    setIsPopupOpen(true);
  };

  const handleTaskCompletion = (completedTask: Task) => {
    setLocalTasks(prevTasks => prevTasks.filter(task => task.taskId !== completedTask.taskId));
    setIsPopupOpen(false);
  };

  const fetchCompletedTasks = async () => {
    try {
      const response = await fetch(`/api/completed-tasks?telegramId=${user?.telegramId}`);
      const data = await response.json();
      setCompletedTasks(data.completedTaskIds);
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
      setError('Failed to fetch completed tasks');
    }
  };

  return (
    <main className="bg-dark-blue text-white h-screen flex flex-col">
      <h1 className="text-4xl text-center mb-8">Tasks</h1> 
      <div className="text-sm text-center text-yellow-300 flex-shrink-0">Completed tasks: {completedTasks.join(', ')}</div>
      {/* display local tasks ids */}
      <div className="text-sm text-center text-yellow-300 flex-shrink-0">Local tasks: {localTasks.map(task => task.taskId).join(', ')}</div>
      <div className="flex flex-col items-center w-full px-4">
        {localTasks.map((task, index) => (
          <button 
            key={index}
            onClick={() => handleOpenPopup(task)}
            className="bg-gray-500 bg-opacity-50 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl mt-1 w-full"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 mr-2 flex-shrink-0">
                <Image
                  src={task.image}
                  alt={task.title}
                  width={40}
                  height={40}
                  className="rounded-md"
                />
              </div>
              <div className="flex-grow text-left">{task.title}
              <div className="text-sm text-yellow-300 flex-shrink-0">{task.reward}</div>

              </div>
              <div className="text-sm text-right text-yellow-300 flex-shrink-0">▶️</div>
              
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
          currentTask.secondAction(user, handleUpdateUser, setNotification, () => handleTaskCompletion(currentTask), setIsPopupOpen, setError);
        }}
        secondActionText={currentTask.secondActionText}
      />
      {/* <Navigation /> */}
      {/* display completed tasks ids */}

    </main>
  )
}
