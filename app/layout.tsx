'use client'

import "./globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect, useState } from 'react';
import { UserProvider } from './UserContext';
import { TonPriceProvider } from './TonPriceContext';
import dynamic from 'next/dynamic';

const WelcomePopup = dynamic(() => import('./components/WelcomePopup'), {
  ssr: false
});

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

        // Check if user exists in localStorage
        const userExists = localStorage.getItem('userExists');
        if (!userExists) {
          setShowWelcomePopup(true);
        }
      }
    };

    initWebApp();
  }, []);

  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
    localStorage.setItem('userExists', 'true');
  };

  return (
    <html lang="en">
      <head>
        <title>WeAi</title>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body>
        <TonConnectUIProvider 
          manifestUrl="https://blush-keen-constrictor-906.mypinata.cloud/ipfs/QmSBEGs7dqLGi5SAWGYfQpmp7uW8bWjy2KpiBiWSviWHRZ"
          actionsConfiguration={{
            twaReturnUrl: 'https://t.me/WeAiBot_bot/WeAi'
          }}
        >
          <TonPriceProvider>
            <UserProvider>
              {showWelcomePopup && <WelcomePopup onClose={handleCloseWelcomePopup} />}
              {children}
            </UserProvider>
          </TonPriceProvider>
        </TonConnectUIProvider>
      </body>
    </html>
  );
}
