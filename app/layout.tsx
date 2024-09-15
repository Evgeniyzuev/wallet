"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "./globals.css";


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
        <TonConnectUIProvider manifestUrl="https://blush-keen-constrictor-906.mypinata.cloud/ipfs/Qmczag3uqNQQ3BKB5NFydHsneBFnbZdJsw8Zrrz5R6buzo">
          {children}
        </TonConnectUIProvider>
      </body>
    </html>
  );
}
