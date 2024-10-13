'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'

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
      <ReferralSystem userId={userId} />
      <Navigation />
    </main>
  );
}
