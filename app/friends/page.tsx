'use client'

import dynamic from 'next/dynamic'
// import { useState, useEffect } from 'react'
import { useUser } from '../UserContext'

const ReferralSystem = dynamic(() => import('./ReferralSystem'), { ssr: false })

export default function FriendsPage() {
  const { user, setUser } = useUser();



  return (
    <main className="bg-dark-blue text-white h-screen flex flex-col">
      <h1 className="text-4xl text-center font-bold mb-8">Friends</h1>
      <h1 className="text-xl text-center font-bold mb-8">Hello, {user?.firstName}!</h1>
      <ReferralSystem userId={user?.telegramId.toString() || ''} />
    </main>
  );
}
