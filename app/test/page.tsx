'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { aicoreBalance, addAicoreBalance } from '../db'

export default function TestPage() {
  const [balance, setBalance] = useState(aicoreBalance)

  const handleEarn = (amount: number) => {
    addAicoreBalance(amount);
    setBalance(prevBalance => prevBalance + amount);
  }

  useEffect(() => {
    setBalance(aicoreBalance);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Test</h1>
      <div className="text-xl flex flex-col items-center">
            {/* <div className="flex items-center mb-4">
              <span className="mr-2">Day: {dayCount}</span>
              <button 
                onClick={handleSkipDays} 
                className="p-2 bg-blue-500 text-white rounded mr-2"
              >
                Skip Days
              </button>
              <input
                type="number"
                value={daysToSkip}
                onChange={(e) => setDaysToSkip(Math.min(999, Math.max(0, parseInt(e.target.value) )))}
                className="w-16 p-1 text-black rounded"
                min="1"
                max="999"
              />
            </div> */}
            <div className="text-xl mb-4">Aicore Balance: {balance} USD</div>

            <button onClick={() => handleEarn(0.1)} className="p-2 bg-green-500 text-black rounded mb-2 w-80">
              Get 0.1 USD
            </button>
            <button onClick={() => handleEarn(10)} className="p-2 bg-green-500 text-black rounded mb-2 w-80">
              Get 10 USD
            </button>
            <button onClick={() => handleEarn(1000)} className="p-2 bg-green-500 text-black rounded mb-2 w-80">
              Get 1K USD
            </button>
            {/* <button onClick={handleReset} className="p-2 bg-red-500 text-white rounded w-80 h-10 mb-4">
              Reset
            </button>
            <button onClick={handleLoadData} className="p-2 bg-yellow-500 text-black rounded w-80 h-10 mb-4">
              Load Data
            </button> */}
          </div>


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
    </main>
  );
}