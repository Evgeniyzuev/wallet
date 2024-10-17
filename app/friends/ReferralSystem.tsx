import { useState } from 'react'
import { initUtils } from '@telegram-apps/sdk'
import { useUserData } from '../hooks/useUserData'

interface ReferralSystemProps {
  userId: string
}

interface Referral {
  telegramId: number;
  username: string | null;
  firstName: string | null;
}

const ReferralSystem: React.FC<ReferralSystemProps> = ({ userId }) => {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [showReferrals, setShowReferrals] = useState(false);
  const [referralsLoaded, setReferralsLoaded] = useState(false);
  const INVITE_URL = "https://t.me/WeAiBot_bot/WeAi"
  const { user } = useUserData()

  const fetchReferrals = async () => {
    if (userId && !referralsLoaded) {
      try {
        const response = await fetch(`/api/referrals?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch referrals');
        const data = await response.json();
        setReferrals(data.referrals);
        setReferralsLoaded(true);
      } catch (error) {
        console.error('Error fetching referrals:', error);
      }
    }
  }

  const handleShowReferrals = () => {
    setShowReferrals(!showReferrals);
    if (!referralsLoaded) {
      fetchReferrals();
    }
  }

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
        <h2 className="text-xl font-bold mb-4">Your Referrer: {user?.referrerId ? `User ${user.referrerId}` : "No referrer"}</h2>
        
      </div>
      <div className="mt-8">
        <button
          onClick={handleShowReferrals}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          {showReferrals ? 'Hide Referrals' : 'Show Referrals'}
        </button>
        {showReferrals && (
          <>
            <h2 className="text-2xl font-bold mb-4">Your Referrals:</h2>
            <ul>
              {referrals.map((referral, index) => (
                <li key={index} className="bg-dark-blue p-2 mb-2 rounded">
                  ID:{referral.telegramId} {referral.firstName ? `(${referral.firstName})` : `(${referral.username})`}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export default ReferralSystem
