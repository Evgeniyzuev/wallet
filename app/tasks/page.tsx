'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'
import { useUserData } from '../hooks/useUserData'
import Subscription from './subscription'
import TaskPopup from '../components/TaskPopup'

interface Task {
  title: string;
  description: string;
  reward: string;
  actionText: string;
}

export default function Home() {
  const { user, setUser, error, setError, handleIncreaseAicoreBalance } = useUserData();
  const [notification, setNotification] = useState('')
  const [aicoreAmount, setAicoreAmount] = useState('')
  // const [startParam, setStartParam] = useState('')
  const [subscriptionCompleted, setSubscriptionCompleted] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState({
    title: '',
    description: '',
    reward: '',
    actionText: '',
    secondActionText: ''
  })

  // useEffect(() => {
  //   if (typeof window !== 'undefined' /*&& window.Telegram?.WebApp*/) {
  //     const tg = WebApp
  //     tg.ready()

  //     // const initData = tg.initData || ''
  //     const initDataUnsafe = tg.initDataUnsafe || {}
  //     // setInitData(WebApp.initData);
  //     setStartParam(WebApp.initDataUnsafe.start_param || '');

  //     if (initDataUnsafe.user) {
  //       fetch('/api/user', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           user: initDataUnsafe.user,
  //           start_param: initDataUnsafe.start_param
  //         }),
  //       })
  //         .then((res) => res.json())
  //         .then((data) => {
  //           if (data.error) {
  //             setError(data.error)
  //           } else {
  //             setUser(data)
  //           }
  //         })
  //         .catch((err) => {
  //           console.log(err)
  //           setError('Failed to fetch user data')
  //         })
  //     } else {
  //       setError('No user data available')
  //     }
  //   } else {
  //     setError('This app should be opened in Telegram')
  //   }
  // }, [])

  // const handleIncreasePoints = async () => {
  //   if (!user) return

  //   try {
  //     const res = await fetch('/api/increase-points', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ telegramId: user.telegramId }),
  //     })
  //     const data = await res.json()
  //     if (data.success) {
  //       setUser({ ...user, points: data.points })
  //       setNotification('Points increased successfully!')
  //       setTimeout(() => setNotification(''), 3000)
  //     } else {
  //       setError('Failed to increase points')
  //     }
  //   } catch (err) {
  //     console.log(err)
  //     setError('An error occurred while increasing points')
  //   }
  // }

  // const handleIncreaseAicoreBalanceLocal = async () => {
  //   if (!user || !aicoreAmount) return;

  //   const result = await handleIncreaseAicoreBalance(parseFloat(aicoreAmount));
  //   if (result?.success) {
  //     setNotification(result.message);
  //     setAicoreAmount('');
  //     setTimeout(() => setNotification(''), 3000);
  //   } else {
  //     setError(result?.message || 'An error occurred while increasing Aicore balance');
  //   }
  // };

  const handleSubscribe = async () => {
    window.open('https://t.me/WeAi_ch', '_blank');
  };

  const checkMembership = async () => {
    if (!user?.telegramId) {
      setError('User not found');
      return;
    }

    const response = await fetch('/api/check-membership', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegramId: user.telegramId,
        channelUsername: 'WeAi_ch'
      }),
    });

    if (response.ok) {
      const { isMember } = await response.json();
      if (isMember) {
        const result = await handleIncreaseAicoreBalance(0.5);
        if (result?.success) {
          setNotification('Subscription successful! 0.5 Aicore added to your balance.');
          setSubscriptionCompleted(true);
          setIsPopupOpen(false);
        } else {
          setError('Failed to increase Aicore balance');
        }
      } else {
        setError('Please subscribe to the channel to receive the bonus');
      }
    } else {
      setError('Failed to check membership');
    }
  };

  const handleOpenPopup = (task: Task) => {
    setCurrentTask({
      ...task,
      actionText: 'Subscribe',
      secondActionText: 'Check Membership'
    });
    setIsPopupOpen(true);
  };

  return (
    <main className="bg-dark-blue text-white h-screen flex flex-col">
      <h1 className="text-4xl font-bold text-center mb-8">Tasks</h1>
      <div className="flex flex-col">
      <span>🔵приветствие</span>
      <span>🔵подписка</span>
      <span>🔵обучение</span>
      <span>🔵первый уровень</span>
      <span>🔵план</span>
      <span>Награды: ✨💵⬆️💬Core/USD/Reputs/tokens</span>

      {/* task subscription channel WeAi_ch */}

      {subscriptionCompleted ? (
        <div className="bg-green-500 text-white font-bold py-2 px-4 rounded mt-4 text-center">
          ✅ Completed: Core +0.5$
        </div>
      ) : (
        <button 
          onClick={() => handleOpenPopup({
            title: 'Subscribe to the channel',
            description: 'Subscribe to the WeAi channel',
            reward: '+0,500 $',
            actionText: 'Subscribe'
          })}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Subscribe t.me/WeAi_ch
        </button>
      )}

      {/* task popup */}
      {<button onClick={() => handleOpenPopup({
        title: 'Boost Major channel',
        description: 'Boost official Major channel to help it get additional features. Keep your boost to collect free rating every day.',
        reward: '+1,500 ⭐',
        actionText: 'Boost Channel'
      })}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
      >Open Popup</button>
      }

      </div>
      {/* <Subscription /> // for subscription check*/} 
      <Navigation />
      {notification && <p className="text-green-500 mt-2">{notification}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <TaskPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title={currentTask.title}
        description={currentTask.description}
        reward={currentTask.reward}
        onAction={handleSubscribe}
        actionText={currentTask.actionText}
        onSecondAction={checkMembership}
        secondActionText={currentTask.secondActionText}
      />
    </main>
  )
}
