'use client'

import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import { useUserData } from '../hooks/useUserData'
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
  const [currentTask, setCurrentTask] = useState<Task>({
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
    setLocalTasks(initialTasks)
  }, [])

  const handleOpenPopup = (task: Task) => {
    setCurrentTask(task);
    setIsPopupOpen(true);
  };

  const handleTaskCompletion = (completedTask: Task) => {
    setLocalTasks(prevTasks => prevTasks.filter(task => task.title !== completedTask.title));
    setIsPopupOpen(false);
  };

  return (
    <main className="bg-dark-blue text-white h-screen flex flex-col">
      <h1 className="text-4xl text-center mb-8">Tasks</h1> 
      <div className="flex flex-col items-center w-full px-4">
        {localTasks.map((task, index) => (
          <button 
            key={index}
            onClick={() => handleOpenPopup(task)}
            className="bg-blue-500 bg-opacity-50 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-1 w-full"
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
              <div className="flex-grow text-left">{task.title}</div>
              <div className="text-sm text-yellow-300 flex-shrink-0">{task.reward}</div>
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
    </main>
  )
}
