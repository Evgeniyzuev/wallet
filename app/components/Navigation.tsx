'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Core' },
    { href: '/ai', label: 'Ai' },
    { href: '/wallet', label: 'Wallet' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/friends', label: 'Frens' }, //, image: frensImage
    { href: '/goals', label: 'Goals' },
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
          <Link
            key={item.href}
            href={item.href}
            className={`font-medium flex flex-col items-center ${
              pathname === item.href
                ? 'text-blue-300'
                : 'text-white hover:text-blue-300'
            }`}
          >
            {/* {item.image && (
              <Image
                src={item.image}
                alt={item.label || 'Navigation Icon'}
                width={40}
                height={40}
                className="mb-0"
              />
            )} */}
            {item.label}
          </Link>
          // telegram back button
          
          
        ))}
      </div>
    </div>
  )
}
