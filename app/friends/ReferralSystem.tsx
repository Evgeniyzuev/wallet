import { useState, useEffect } from 'react'
import { initUtils } from '@telegram-apps/sdk'
import { useUserData } from '../hooks/useUserData'

interface ReferralSystemProps {
  initData: string
  userId: string
  startParam: string
}

const ReferralSystem: React.FC<ReferralSystemProps> = () => {
  const [referrals, setReferrals] = useState<string[]>([])
  const INVITE_URL = "https://t.me/WeAiBot_bot/WeAi"
  const { user } = useUserData()
  // try to get user id from user object  
  let userId = ''
  try {
     userId = user.telegramId
  } catch (error) {
    console.error('Error getting user id:', error)
  }

  // useEffect(() => {
    // const checkReferral = async () => {
    //   if (startParam && userId) {
    //     try {
    //       const response = await fetch('/api/referrals', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ userId, referrerId: startParam }),
    //       });
    //       if (!response.ok) throw new Error('Failed to save referral');
    //     } catch (error) {
    //       console.error('Error saving referral:', error);
    //     }
    //   }
    // }

    // const fetchReferrals = async () => {
    //   if (userId) {
    //     try {
    //       const response = await fetch(`/api/referrals?userId=${userId}`);
    //       if (!response.ok) throw new Error('Failed to fetch referrals');
    //       const data = await response.json();
    //       setReferrals(data.referrals);
    //       setReferrer(data.referrer);
    //     } catch (error) {
    //       console.error('Error fetching referrals:', error);
    //     }
    //   }
    // }

    // checkReferral();
    // fetchReferrals();
  // }, [userId])

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


  return (
    <div className="w-full max-w-md">

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
      </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Referrals:</h2>
          <ul>
            {referrals.map((referral, index) => (
              <li key={index} className="bg-gray-100 p-2 mb-2 rounded">
                User {referral}
              </li>
            ))}
          </ul>
        </div>
    </div>
  )
}

export default ReferralSystem