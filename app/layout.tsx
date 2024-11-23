'use client'

import "./globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect, useState } from 'react';
import { UserProvider } from './UserContext';
import { WalletProvider } from './wallet/WalletContext';

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
        {/* <link rel="icon" href="data:,"></link> */}
      </head>
      <body>
        <TonConnectUIProvider 
        manifestUrl="https://blush-keen-constrictor-906.mypinata.cloud/ipfs/QmSBEGs7dqLGi5SAWGYfQpmp7uW8bWjy2KpiBiWSviWHRZ"
        actionsConfiguration={{
          twaReturnUrl: 'https://t.me/WeAiBot_bot/WeAi'
        }}
        >
          <UserProvider>
            <WalletProvider>
              {children}
            </WalletProvider>
          </UserProvider>
        </TonConnectUIProvider>
      </body>
    </html>
  );
}
