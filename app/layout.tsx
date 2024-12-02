'use client'

import "./globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect, useState } from 'react';
import { UserProvider } from './UserContext';
import { TonPriceProvider } from './TonPriceContext';
import dynamic from 'next/dynamic';
import { LanguageProvider } from './LanguageContext';

const WelcomePopup = dynamic(() => import('./components/WelcomePopup'), {
  ssr: false
});

const InfoPopup = dynamic(() => import('./components/InfoPopup'), {
  ssr: false
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  useEffect(() => {
    const initWebApp = async () => {
      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        WebApp.expand();

        const userExists = localStorage.getItem('userExists');
        setShowInfoPopup(true);
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

  const handleCloseInfoPopup = () => {
    setShowInfoPopup(false);
  };

  return (
    <html lang="en">
      <head>
        <title>WeAi</title>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body>
        <LanguageProvider>
          <TonConnectUIProvider 
            manifestUrl="https://blush-keen-constrictor-906.mypinata.cloud/ipfs/QmSBEGs7dqLGi5SAWGYfQpmp7uW8bWjy2KpiBiWSviWHRZ"
            actionsConfiguration={{
              twaReturnUrl: 'https://t.me/WeAiBot_bot/WeAi'
            }}
          >
            <TonPriceProvider>
              <UserProvider>
                {showWelcomePopup && <WelcomePopup onClose={handleCloseWelcomePopup} />}
                {showInfoPopup && <InfoPopup isOpen={showInfoPopup} onClose={handleCloseInfoPopup} />}
                {children}
              </UserProvider>
            </TonPriceProvider>
          </TonConnectUIProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
