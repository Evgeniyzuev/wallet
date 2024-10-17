'use client'

import "./globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect } from 'react';
import BackButton from './components/BackButton'
import { usePathname } from 'next/navigation';
import { UserProvider } from './UserContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <title>TON Connect Demo</title>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        {/* <link rel="icon" href="data:,"></link> */}
      </head>
      <body>
        <TonConnectUIProvider manifestUrl="https://blush-keen-constrictor-906.mypinata.cloud/ipfs/QmdbgPxFiAvgYVCrcMnwRVxtBCqgCtSM6A4Sy27nonHSnr">
          <UserProvider>
            {usePathname() !== '/' && <BackButton />}
            {children}
          </UserProvider>
        </TonConnectUIProvider>
      </body>
    </html>
  );
}
