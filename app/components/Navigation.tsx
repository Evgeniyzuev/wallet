'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import walletIcon from '../images/icon-wallet.svg';
import tasksIcon from '../images/icon-tasks.svg';
import friendsIcon from '../images/icon-friends.svg';
import coinsIcon from '../images/ph_coins-fill.svg';
import messageIcon from '../images/icon-message.png'; 
import coreIcon from '../images/icon-core.png';

import React from 'react';

export default function Navigation({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const pathname = usePathname()

  const navItems = [
    { href: 'home', label: 'Core', icon: <img src={coreIcon.src} alt="Core" className="w-6 h-6" /> },
    { href: 'ai', label: 'Ai', icon: <img src={messageIcon.src} alt="Ai" className="w-6 h-6" /> },
    { href: 'wallet', label: 'Wallet', icon: <img src={walletIcon.src} alt="Wallet" className="w-6 h-6" /> },
    { href: 'tasks', label: 'Tasks', icon: <img src={coinsIcon.src} alt="Tasks" className="w-6 h-6" /> },
    { href: 'friends', label: 'Frens', icon: <img src={friendsIcon.src} alt="Frens" className="w-6 h-6" /> },
    { href: 'goals', label: 'Goals', icon: <img src={tasksIcon.src} alt="Goals" className="w-6 h-6" /> },
  ]

  return (
    
    <div className="w-full bg-gray-800 py-3 fixed bottom-0">
      <div className="flex justify-around max-w-screen-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => setCurrentPage(item.href)}
            className={`font-medium flex w-1/6 flex-col items-center p-2 rounded-lg transition-all ${
              pathname === item.href
                ? 'text-blue-300 bg-gray-700' // добавляем фон для активной кнопки
                : 'text-white hover:text-blue-300 hover:bg-gray-700'
            }`}
          >
            {item.icon && React.cloneElement(item.icon, {
                className: 'w-6 h-6'
            })}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
