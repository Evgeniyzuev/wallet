'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Aissist' },
    { href: '/wallet', label: 'Wallet' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/friends', label: 'Frens' },
    { href: '/goals', label: 'Goals' },
  ]

  return (
    <div className="w-full bg-gray-800 py-4 fixed bottom-0">
      <div className="flex justify-around max-w-screen-lg mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`font-medium ${
              pathname === item.href
                ? 'text-blue-300'
                : 'text-white hover:text-blue-300'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}