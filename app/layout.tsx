'use client'

import "./globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { UserProvider } from './UserContext';
import WelcomePopup from './components/WelcomePopup';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    const initWebApp = async () => {
      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        WebApp.expand();
      }
    };

    initWebApp();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>WeAi</title>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body>
        <TonConnectUIProvider manifestUrl="https://blush-keen-constrictor-906.mypinata.cloud/ipfs/QmSBEGs7dqLGi5SAWGYfQpmp7uW8bWjy2KpiBiWSviWHRZ">
          <UserProvider>
            {children}
            <WelcomePopup 
              isOpen={showWelcomePopup} 
              onClose={() => setShowWelcomePopup(false)} 
            />
          </UserProvider>
        </TonConnectUIProvider>
      </body>
    </html>
  );
}
