import { useState, useEffect } from 'react'
import { initUtils } from '@telegram-apps/sdk'
import { useUser } from '../UserContext'; 
import { useLanguage } from '../LanguageContext'

interface ReferralSystemProps {
  userId: string
}

interface Referral {
  telegramId: number;
  username: string | null;
  firstName: string | null;
  level: number;
}

const translations = {
  ru: {
    inviteFriend: 'Пригласить друга',
    copyInviteLink: 'Скопировать ссылку',
    showContacts: 'Показать контакты',
    hideContacts: 'Скрыть контакты',
    yourReferrer: 'Вас пригласил',
    noReferrer: 'Нет реферера',
    yourReferrals: 'Вы пригласили',
    showMoreReferrals: 'Показать больше рефералов',
    level: 'уровень',
    inviteCopied: 'Пригласительная ссылка скопирована!',
    shareText: 'Присоединяйтесь к нашему мини-приложению в Telegram!',
    loading: 'Загрузка...',
    refresh: 'Обновить'
  },
  en: {
    inviteFriend: 'Invite Friend',
    copyInviteLink: 'Copy Invite Link',
    showContacts: 'Show Contacts',
    hideContacts: 'Hide Contacts',
    yourReferrer: 'Your Referrer',
    noReferrer: 'No referrer',
    yourReferrals: 'Your Referrals',
    showMoreReferrals: 'Show More Referrals',
    level: 'level',
    inviteCopied: 'Invite link copied to clipboard!',
    shareText: 'Join me on this awesome Telegram mini app!',
    loading: 'Loading...',
    refresh: 'Refresh'
  }
}

const ReferralSystem: React.FC<ReferralSystemProps> = ({ userId }) => {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en
  
  const [referralIds, setReferralIds] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('referralIds');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [referrals, setReferrals] = useState<Referral[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('referrals');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [referrer, setReferrer] = useState<Referral | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('referrer');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 10;
  const INVITE_URL = "https://t.me/WeAiBot_bot/WeAi"
  const { user } = useUser()

  const fetchContact = async (contactId: number) => {
    try {
      const response = await fetch(`/api/user?telegramId=${contactId}`);
      if (!response.ok) throw new Error('Failed to fetch contact');
      const data = await response.json();
      return {
        telegramId: data.telegramId,
        username: data.username,
        firstName: data.firstName,
        level: data.level
      };
    } catch (error) {
      console.error(`Error fetching contact ${contactId}:`, error);
      return null;
    }
  }

  const loadMoreReferrals = async () => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const nextPageIds = referralIds.slice(startIndex, endIndex);

    if (nextPageIds.length > 0) {
      const newReferralDetails = await Promise.all(
        nextPageIds.map(id => fetchContact(id))
      );

      setReferrals(prev => [...prev, ...newReferralDetails.filter((ref): ref is Referral => ref !== null)]);
      setCurrentPage(prev => prev + 1);
    }
  };

  const fetchReferrals = async () => {
    if (userId && !isLoading) {
      try {
        const response = await fetch(`/api/referrals?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch referrals');
        const data = await response.json();
        
        // Store all referral IDs
        const allReferralIds = data.referrals.map((ref: any) => ref.telegramId);
        setReferralIds(allReferralIds);

        // Load first page
        const firstPageIds = allReferralIds.slice(0, ITEMS_PER_PAGE);
        const referralDetails = await Promise.all(
          firstPageIds.map((id: number) => fetchContact(id))
        );
        
        setReferrals(referralDetails.filter((ref): ref is Referral => ref !== null));
        setIsLoading(true);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error fetching referrals:', error);
      }
    }
  }

  const handleShowContacts = () => {
    if (!isLoading) {
      if (user?.referrerId) {
        fetchContact(user.referrerId).then(referrerData => {
          if (referrerData) {
            setReferrer(referrerData);
          }
        });
      }
      fetchReferrals();
    }
  }

  const handleInviteFriend = () => {
    const utils = initUtils()
    const inviteLink = `${INVITE_URL}?startapp=${userId}`
    const shareText = t.shareText
    const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`
    utils.openTelegramLink(fullUrl)
  }

  const handleCopyLink = () => {
    const inviteLink = `${INVITE_URL}?startapp=${userId}`
    navigator.clipboard.writeText(inviteLink)
    alert(t.inviteCopied)
  }

  const refreshContacts = async () => {
    setIsLoading(true);
    try {
      // Fetch referrer if exists
      if (user?.referrerId) {
        const referrerData = await fetchContact(user.referrerId);
        if (referrerData) {
          setReferrer(referrerData);
          localStorage.setItem('referrer', JSON.stringify(referrerData));
        }
      }

      // Fetch referrals
      const response = await fetch(`/api/referrals?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch referrals');
      const data = await response.json();
      
      const allReferralIds = data.referrals.map((ref: any) => ref.telegramId);
      setReferralIds(allReferralIds);
      localStorage.setItem('referralIds', JSON.stringify(allReferralIds));

      const firstPageIds = allReferralIds.slice(0, ITEMS_PER_PAGE);
      const referralDetails = await Promise.all(
        firstPageIds.map((id: number) => fetchContact(id))
      );
      
      const filteredReferrals = referralDetails.filter((ref): ref is Referral => ref !== null);
      setReferrals(filteredReferrals);
      localStorage.setItem('referrals', JSON.stringify(filteredReferrals));
      setCurrentPage(1);
    } catch (error) {
      console.error('Error refreshing contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && referrals.length === 0) {
      refreshContacts();
    }
  }, [userId]);

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col space-y-4">
        <button
          onClick={handleInviteFriend}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {t.inviteFriend}
        </button>
        <button
          onClick={handleCopyLink}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {t.copyInviteLink}
        </button>
      </div>

      <div className="mt-8">
        <button
          onClick={refreshContacts}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 flex items-center justify-center"
        >
          {isLoading ? (
            <span className="animate-spin mr-2">⟳</span>
          ) : (
            <span>⟳</span>
          )}
          {isLoading ? t.loading : t.refresh}
        </button>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            {t.yourReferrer}: {referrer ? `${referrer.firstName} (${t.level}: ${referrer.level})` : t.noReferrer}
          </h2>
        </div>
        <h2 className="text-2xl font-bold mb-4">{t.yourReferrals}:</h2>
        <ul>
          {referrals.map((referral, index) => (
            <li key={index} className="bg-dark-blue p-2 mb-2 rounded">
              ID:{referral.telegramId} {referral.firstName ? `(${referral.firstName})` : `(${referral.username})`} ({t.level}: {referral.level || 0})
            </li>
          ))}
        </ul>
        {referralIds.length > referrals.length && (
          <button
            onClick={loadMoreReferrals}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            {t.showMoreReferrals}
          </button>
        )}
      </div>
    </div>
  )
}

export default ReferralSystem
