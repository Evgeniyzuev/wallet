'use client'

import "./globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>TON Connect Demo</title>
      </head>
      <body>
        <TonConnectUIProvider manifestUrl="https://blush-keen-constrictor-906.mypinata.cloud/ipfs/QmdbgPxFiAvgYVCrcMnwRVxtBCqgCtSM6A4Sy27nonHSnr">
          {children}
        </TonConnectUIProvider>
      </body>
    </html>
  );
}