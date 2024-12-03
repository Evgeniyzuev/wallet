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
    <div className="fixed bottom-0 left-0 right-0 bg-[#252a41]">
      <div className="flex justify-around p-2">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => setCurrentPage(item.href)}
            className={`flex flex-col items-center text-xs ${
              pathname === item.href ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            {item.icon}
            {t(item.label as any)}
          </button>
        ))}
      </div>
    </div>
  );
}
