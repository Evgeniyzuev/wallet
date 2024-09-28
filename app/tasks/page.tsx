'use client'

import { useEffect, useState } from 'react'
import  WebApp  from '@twa-dev/sdk'
import Link from 'next/link'
import { setAicoreBalance } from '../db'
// declare global {
//   interface Window {
//     Telegram?: {
//       WebApp: WebApp
//     }
//   }
// }






export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState('')
  const [aicoreAmount, setAicoreAmount] = useState('')

  // const [userData, setUserData] = useState<UserData | null>(null);

  // interface UserData {
  //   id: number;
  //   first_name: string;
  //   last_name?: string;
  //   username?: string;
  //   language_code: string;
  //   is_premium?: boolean;
  // }



  useEffect(() => {
    if (typeof window !== 'undefined' /*&& window.Telegram?.WebApp*/) {
      const tg = WebApp
      tg.ready()

      // const initData = tg.initData || ''
      const initDataUnsafe = tg.initDataUnsafe || {}

      if (initDataUnsafe.user) {
        fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(initDataUnsafe.user),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setError(data.error)
            } else {
              setUser(data)
            }
          })
          .catch((err) => {
            console.log(err)
            setError('Failed to fetch user data')
          })
      } else {
        setError('No user data available')
      }
    } else {
      setError('This app should be opened in Telegram')
    }
  }, [])

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

  const handleIncreaseAicoreBalance = async () => {
    if (!user || !aicoreAmount) return

    try {
      const res = await fetch('/api/increase-aicore-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId: user.telegramId, amount: parseFloat(aicoreAmount) }),
      })
      const data = await res.json()
      if (data.success) {
        setUser({ ...user, aicoreBalance: data.aicoreBalance })
        setAicoreBalance(data.aicoreBalance)
        setNotification('Aicore balance increased successfully!')
        setAicoreAmount('')
        setTimeout(() => setNotification(''), 3000)
      } else {
        setError('Failed to increase Aicore balance')
      }
    } catch (err) {
      console.log(err)
      setError('An error occurred while increasing Aicore balance')
    }
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>
  }

  if (!user) return <div className="container mx-auto p-4">Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.firstName}!</h1>
      <p>Your current points: {user.points}</p>
      <p>Your current Aicore balance: {user.aicoreBalance}</p>
      <button
        onClick={handleIncreasePoints}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Increase Points
      </button>
      <div className="mt-4">
        <input
          type="number"
          placeholder="Enter amount"
          className="border border-gray-300 rounded px-2 py-1 mr-2"
          value={aicoreAmount}
          onChange={(e) => setAicoreAmount(e.target.value)}
        />
        <button
          onClick={handleIncreaseAicoreBalance}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Increase Aicore Balance
        </button>
      </div>
      {notification && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          {notification}
        </div>
      )}
    
    <div className="w-full bg-gray-800 py-4 fixed bottom-0">
        <div className="flex justify-around max-w-screen-lg mx-auto">
          <Link href="/aissist" className="text-white hover:text-blue-300 font-medium">
            Aissist
          </Link>
          <Link href="/" className="text-white hover:text-blue-300 font-medium">
            Wallet
          </Link>
          <Link href="/tasks" className="text-white hover:text-blue-300 font-medium">
            Tasks
          </Link>
          <Link href="/friends" className="text-white hover:text-blue-300 font-medium">
            Frens
          </Link>
          <Link href="/goals" className="text-white hover:text-blue-300 font-medium">
            Goals
          </Link>
          <Link href="/test" className="text-white hover:text-blue-300 font-medium">
            Test
          </Link>
        </div>
      </div>
    </div>
  )
}