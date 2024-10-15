'use client'

import "./globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect } from 'react';
import BackButton from './components/BackButton'
import { usePathname } from 'next/navigation';

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
      </head>
      <body>
        <TonConnectUIProvider manifestUrl="https://blush-keen-constrictor-906.mypinata.cloud/ipfs/QmdbgPxFiAvgYVCrcMnwRVxtBCqgCtSM6A4Sy27nonHSnr">
          {usePathname() !== '/' && <BackButton />}
          
          {children}
        </TonConnectUIProvider>
      </body>
    </html>
  );
}
