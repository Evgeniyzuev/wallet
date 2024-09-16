'use client'

import { useState, useEffect } from 'react'
import { initUtils } from '@telegram-apps/sdk'
import WebApp from '@twa-dev/sdk';

const INVITE_URL = 'https://t.me/AissistIncomeBot/AissistIncomeBot/start'

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

const ReferralSystem: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userId, setUserId] = useState('')
  const [startParam, setStartParam] = useState('')
  const [referrals] = useState<string[]>([])
  const [referrer, setReferrer] = useState<string | null>(null)
  const [showReferrals, setShowReferrals] = useState(true)

  useEffect(() => {
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData);
    }
  }, []);

  useEffect(() => {
    const initWebApp = async () => {
      if (typeof window !== 'undefined') {
        const webApp = (await import('@twa-dev/sdk')).default;
        webApp.ready();
        setUserId(webApp.initDataUnsafe.user?.id.toString() || '');
        setStartParam(webApp.initDataUnsafe.start_param || '');
      }
    }
    initWebApp();
  }, []);

  useEffect(() => {
    if (startParam) {
      setReferrer(startParam);
    }
  }, [startParam]);

  const handleInviteFriend = () => {
    const utils = initUtils()
    const inviteLink = `${INVITE_URL}?startapp=${userId}`
    const shareText = `Join me on this awesome Telegram mini app!`
    const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`
    utils.openTelegramLink(fullUrl)
  }

  const handleCopyLink = () => {
    const inviteLink = `${INVITE_URL}?startapp=${userId}`
    navigator.clipboard.writeText(inviteLink)
    alert('Invite link copied to clipboard!')
  }

  const handleShowReferrals = () => {
    setShowReferrals(true)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Friends</h1>
      <div className="flex flex-col space-y-4">
        {(() => {
          try {
            return `Welcome, ${userData?.first_name || 'Username'}!`;
          } catch (error) {
            return 'Welcome, Username!';
          }
        })()}
      </div>
    
      <div className="w-full max-w-md">
        {referrer ? (
          <p className="text-green-500 mb-4">You were referred by user {referrer}</p>
        ) : (
          <p className="text-gray-500 mb-4">No referrer {startParam}</p>
        )}
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleInviteFriend}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Invite Friend
          </button>
          <button
            onClick={handleCopyLink}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Copy Invite Link
          </button>
          <button
            onClick={handleShowReferrals}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Show Referrals
          </button>
        </div>
        {showReferrals && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Your Referrals</h2>
            {referrals.length > 0 ? (
              <ul>
                {referrals.map((referral, index) => (
                  <li key={index} className="bg-gray-100 p-2 mb-2 rounded">
                    User {referral}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No referrals</p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default ReferralSystem