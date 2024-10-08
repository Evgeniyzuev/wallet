'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'
import { useUserData } from '../hooks/useUserData'
import Subscription from './subscription'
export default function Home() {
  const { user, setUser, error, setError, handleIncreaseAicoreBalance } = useUserData();
  const [notification, setNotification] = useState('')
  const [aicoreAmount, setAicoreAmount] = useState('')
  // const [startParam, setStartParam] = useState('')


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

  const handleIncreasePoints = async () => {
    if (!user) return

    try {
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId: user.telegramId }),
      })
      const data = await res.json()
      if (data.success) {
        setUser({ ...user, points: data.points })
        setNotification('Points increased successfully!')
        setTimeout(() => setNotification(''), 3000)
      } else {
        setError('Failed to increase points')
      }
    } catch (err) {
      console.log(err)
      setError('An error occurred while increasing points')
    }
  }

  const handleIncreaseAicoreBalanceLocal = async () => {
    if (!user || !aicoreAmount) return;

    const result = await handleIncreaseAicoreBalance(parseFloat(aicoreAmount));
    if (result?.success) {
      setNotification(result.message);
      setAicoreAmount('');
      setTimeout(() => setNotification(''), 3000);
    } else {
      setError(result?.message || 'An error occurred while increasing Aicore balance');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {error || !user ? (
        <div className="container mx-auto p-4">Loading...only in tg</div>
      ) : (
        <>
          <h1 className="text-2xl items-center font-bold mb-4">Welcome, {user.firstName}!</h1>
          <h1 className="text-2xl items-center font-bold mb-4">Your referrer ID is {user.referrerId}</h1>
          <p>Your current points: {user.points}</p>
          <p>Your current Aicore balance: {user.aicoreBalance}</p>
          <button
            onClick={handleIncreasePoints}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Increase Points
          </button>

          <input
            type="number"
            placeholder="Enter amount"
            className="border border-gray-300 rounded px-2 py-1 mt-4 mr-2"
            value={aicoreAmount}
            onChange={(e) => setAicoreAmount(e.target.value)}
          />
          <button
            onClick={handleIncreaseAicoreBalanceLocal}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Increase Aicore Balance
          </button>

          {notification && (
            <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
              {notification}
            </div>
          )}
        </>
      )}  
      <Subscription />

      <Navigation />
    </div>
  )
}