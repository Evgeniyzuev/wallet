'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const ReferralSystem = dynamic(() => import('./ReferralSystem'), { ssr: false })

export default function FriendsPage() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [initData, setInitData] = useState('')
    const [userId, setUserId] = useState('')
    const [startParam, setStartParam] = useState('')

    interface UserData {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code: string;
        is_premium?: boolean;
      }

      useEffect(() => {
        const initWebApp = async () => {
          if (typeof window !== 'undefined') {
            const WebApp = (await import('@twa-dev/sdk')).default;
            WebApp.ready();
            setInitData(WebApp.initData);
            setUserId(WebApp.initDataUnsafe.user?.id.toString() || '');
            setStartParam(WebApp.initDataUnsafe.start_param || '');
            if (WebApp.initDataUnsafe.user) {
              setUserData(WebApp.initDataUnsafe.user as UserData);
            }
          }
        };

        initWebApp();
      }, []);


  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Friends</h1>
      <h1 className="text-xl font-bold mb-8">Hello, {userData?.first_name}!</h1>
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
        </div>
      </div>
    </main>
  );
}