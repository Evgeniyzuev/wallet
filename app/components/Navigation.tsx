'use client'

import { usePathname } from 'next/navigation'
import tasksIcon from '../images/icon-tasks.svg';
import friendsIcon from '../images/icon-friends.svg';
import walletIcon from '../images/icon-wallet.svg';
import coinsIcon from '../images/ph_coins-fill.svg';
import messageIcon from '../images/icon-ai.svg'; 
import coreIcon from '../images/icon-core.png';
import { useLanguage } from '../LanguageContext';
import React from 'react';

export default function Navigation({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const pathname = usePathname()
  const { t } = useLanguage();
  
  const navItems = [
    { href: 'home', label: 'Core', icon: <img src={coreIcon.src} alt="Core" className="w-6 h-6" /> },
    { href: 'ai', label: 'Ai', icon: <img src={messageIcon.src} alt="Ai" className="w-6 h-6" /> },
    { href: 'wallet', label: 'Wallet', icon: <img src={walletIcon.src} alt="Wallet" className="w-6 h-6" /> },
    { href: 'tasks', label: 'Tasks', icon: <img src={coinsIcon.src} alt="Tasks" className="w-6 h-6" /> },
    { href: 'friends', label: 'Frens', icon: <img src={friendsIcon.src} alt="Frens" className="w-6 h-6" /> },
    { href: 'goals', label: 'Goals', icon: <img src={tasksIcon.src} alt="Goals" className="w-6 h-6" /> },
  ]

  return (
    <div className="w-full bg-gray-800 fixed bottom-0">
      <div className="flex justify-around max-w-screen-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === `/${item.href}`;
          
          return (
            <button
              key={item.href}
              onClick={() => setCurrentPage(item.href)}
              className={`font-medium flex w-1/6 flex-col items-center p-1 rounded-lg transition-all text-sm ${
                isActive
                  ? 'text-blue-300 bg-gray-700'
                  : 'text-white hover:text-blue-300 hover:bg-gray-700'
              }`}
            >
              {item.icon}
              {t(item.label as any)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
