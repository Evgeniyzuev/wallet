'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const pathname = usePathname()

  const navItems = [
    { href: 'home', label: 'Core' },
    { href: 'ai', label: 'Ai' },
    { href: 'wallet', label: 'Wallet' },
    { href: 'tasks', label: 'Tasks' },
    { href: 'friends', label: 'Frens' },
    { href: 'goals', label: 'Goals' },
  ]

  // if (pathname !== '/') {
  //   return (
  //     <>
  //       {/* <BackButton /> */}
  //       <TelegramBackButton />
  //     </>
  //   );
  // }

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
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
