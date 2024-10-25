'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const pathname = usePathname()

  const navItems = [
    { href: 'home', label: 'Core' },
    { href: 'ai', label: 'Ai' },
    { href: 'wallet', label: 'Wallet', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3V3z" />
        </svg>
    ) },
    { href: 'tasks', label: 'Tasks' },
    { href: 'friends', label: 'Frens' },
    { href: 'goals', label: 'Goals' },
  ]

  return (
    
    <div className="w-full bg-gray-800 py-3 fixed bottom-0">
      <div className="flex justify-around max-w-screen-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => setCurrentPage(item.href)}
            className={`font-medium flex flex-col items-center ${
              pathname === item.href
                ? 'text-blue-300'
                : 'text-white hover:text-blue-300'
            }`}
          >
            {item.icon} {/* Добавлено отображение иконки */}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
