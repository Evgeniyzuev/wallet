'use client'

import ReferralSystem from './ReferralSystem'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function FriendsPage() {
    const [initData, setInitData] = useState('')
    const [userId, setUserId] = useState('')
    const [startParam, setStartParam] = useState('')
    const [userName, setUserName] = useState('')
    useEffect(() => {
      const initWebApp = async () => {
        if (typeof window !== 'undefined') {
          const WebApp = (await import('@twa-dev/sdk')).default;
          WebApp.ready();
          
          const handleViewportChanged = () => {
            setInitData(WebApp.initData);
            setUserId(WebApp.initDataUnsafe.user?.id.toString() || '');
            setStartParam(WebApp.initDataUnsafe.start_param || '');
            setUserName(WebApp.initDataUnsafe.user?.first_name || '');
            
            // Remove the event listener after it's been called
            WebApp.offEvent('viewportChanged', handleViewportChanged);
          };

          WebApp.onEvent('viewportChanged', handleViewportChanged);
        }
      };
  
      initWebApp();
    }, [])
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Friends</h1>
      <h1 className="text-xl font-bold mb-8">Hello, {userName}!</h1>
      <ReferralSystem initData={initData} userId={userId} startParam={startParam} />
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