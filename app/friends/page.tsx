'use client'

import dynamic from 'next/dynamic'
import { useUser } from '../UserContext'
import { useLanguage } from '../LanguageContext'

const ReferralSystem = dynamic(() => import('./ReferralSystem'), { ssr: false })

// Add translations object
const translations = {
  ru: {
    title: 'Друзья',
    greeting: 'Привет,'
  },
  en: {
    title: 'Friends',
    greeting: 'Hello,'
  }
}

export default function FriendsPage() {
  const { user } = useUser()
  const { language } = useLanguage()

  // Get translations based on current language
  const t = translations[language as keyof typeof translations] || translations.en

  return (
    <main className="bg-dark-blue text-white h-screen flex flex-col">
      <h1 className="text-4xl text-center font-bold mb-8">{t.title}</h1>
      <h1 className="text-xl text-center font-bold mb-8">{t.greeting} {user?.firstName}!</h1>
      <ReferralSystem userId={user?.telegramId.toString() || ''} />
    </main>
  )
}
