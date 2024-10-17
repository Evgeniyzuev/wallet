'use client'

import { useState } from 'react';
import Navigation from './components/Navigation';
import Core from './core/page';
import AiPage from './ai/page';
import Wallet from './wallet/page';
import Tasks from './tasks/page';
import Friends from './friends/page';
import Goals from './goals/page';
import { useUser } from './UserContext';

type Page = 'core' | 'ai' | 'wallet' | 'tasks' | 'friends' | 'goals';

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState<Page>('core');
  // const { user, setUser } = useUser();


  const renderContent = () => {
    switch (currentPage) {
      case 'core':
        return <Core/>;
      case 'ai':
        return <AiPage />;
      case 'wallet':
        return <Wallet />;
      case 'tasks':
        return <Tasks />;
      case 'friends':
        return <Friends />;
      case 'goals':
        return <Goals />;
      default:
        return <Core />;
    }
  };

  return (
    <main className="bg-[#1c2033] text-white min-h-screen flex flex-col">
      {renderContent()}
      <Navigation setCurrentPage={(page: string) => setCurrentPage(page as Page)} />
    </main>
  );
}
