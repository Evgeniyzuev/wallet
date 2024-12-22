'use client'

import { useState, useEffect, useMemo } from 'react'
import TaskPopup from '../components/TaskPopup'
import { tasks as initialTasks, Task} from './taskData'
import Image from 'next/image'
import { useUser } from '../UserContext';
import { useTaskValidation } from '../hooks/useTaskValidation';
import { useRouter } from 'next/navigation';

interface DailyProgress {
  completedTasks: number;
  earnedRewards: number;
  targetRewards: number;
  date: string;
}

export default function Home() {
  const { user, setUser, handleUpdateUser } = useUser();
  const { isTaskEnabled, getTaskError } = useTaskValidation();
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
    secondAction: () => {}
  })
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    completedTasks: 0,
    earnedRewards: 0,
    targetRewards: 0,
    date: new Date().toDateString()
  });

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

  useEffect(() => {
    // Load daily progress from localStorage
    const loadDailyProgress = () => {
      const today = new Date().toDateString();
      const storedProgress = localStorage.getItem('dailyProgress');
      const targetReward = parseFloat(localStorage.getItem('selectedDailyReward') || '0');
      
      if (storedProgress) {
        const progress: DailyProgress = JSON.parse(storedProgress);
        
        // Reset progress if it's a new day
        if (progress.date !== today) {
          const newProgress = {
            completedTasks: 0,
            earnedRewards: 0,
            targetRewards: targetReward,
            date: today
          };
          localStorage.setItem('dailyProgress', JSON.stringify(newProgress));
          setDailyProgress(newProgress);
        } else {
          progress.targetRewards = targetReward;
          setDailyProgress(progress);
        }
      } else {
        const newProgress = {
          completedTasks: 0,
          earnedRewards: 0,
          targetRewards: targetReward,
          date: today
        };
        localStorage.setItem('dailyProgress', JSON.stringify(newProgress));
        setDailyProgress(newProgress);
      }
    };

    loadDailyProgress();
  }, []);

  const handleOpenPopup = (task: Task) => {
    setCurrentTask(task);
    setIsPopupOpen(true);
  };

  const handleTaskCompletion = (completedTask: Task) => {
    setLocalTasks(prevTasks => prevTasks.filter(task => task.taskId !== completedTask.taskId));
    setIsPopupOpen(false);

    // Update daily progress
    const newProgress = {
      ...dailyProgress,
      completedTasks: dailyProgress.completedTasks + 1,
      earnedRewards: dailyProgress.earnedRewards + completedTask.reward
    };
    setDailyProgress(newProgress);
    localStorage.setItem('dailyProgress', JSON.stringify(newProgress));
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

  const [regularTasks, permanentTasks] = useMemo(() => {
    return [
      localTasks.filter(task => task.taskId > 0),
      localTasks.filter(task => task.taskId < 0)
    ];
  }, [localTasks]);

  return (
    <main className="bg-dark-blue text-white h-screen flex flex-col">
      <h1 className="text-4xl text-center mb-4">Задания</h1>
      
      {/* Daily Progress Bar */}
      <div className="px-4 mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Прогресс за день: {dailyProgress.completedTasks} заданий</span>
          <span>{dailyProgress.earnedRewards}$ / {dailyProgress.targetRewards}$</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (dailyProgress.earnedRewards / dailyProgress.targetRewards) * 100)}%`
            }}
          />
        </div>
      </div>

      <div className="flex flex-col items-center w-full px-4">
        {/* Regular Tasks */}
        {regularTasks.map((task, index) => (
          <button 
            key={`regular-${index}`}
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
        
        {/* Divider */}
        <div className="w-full border-t border-gray-700 my-4"></div>
        
        {/* Permanent Tasks */}
        {permanentTasks.map((task, index) => (
          <button 
            key={`permanent-${index}`}
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
              <div className="flex-grow text-left">{task.title}</div>
              <div className="text-sm text-right text-blue-300 flex-shrink-0">
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
        taskId={currentTask.taskId}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title={currentTask.title}
        description={typeof currentTask.description === 'function' ? currentTask.description(user) : currentTask.description}
        reward={currentTask.reward}
        onAction={currentTask.action ? 
          () => currentTask.action!((path) => router.push(path)) 
          : undefined}
        actionText={currentTask.actionText}
        onSecondAction={() => {
          currentTask.secondAction(user, handleUpdateUser, setNotification, () => handleTaskCompletion(currentTask), setError);
        }}
        secondActionText={currentTask.secondActionText}
        image={currentTask.image}
      />
      {/* <Navigation /> */}
      {/* display completed tasks ids */}

    </main>
  )
}
