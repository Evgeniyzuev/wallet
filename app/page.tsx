'use client'

import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from "@ton/core";
import Link from 'next/link';

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleWalletConnection = useCallback((address: string) => {
    setTonWalletAddress(address);
    console.log("Wallet connected successfully!");
    setIsLoading(false);
  }, []);

  const handleWalletDisconnection = useCallback(() => {
    setTonWalletAddress(null);
    console.log("Wallet disconnected successfully!");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUI.account?.address) {
        handleWalletConnection(tonConnectUI.account?.address);
      } else {
        handleWalletDisconnection();
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnection(wallet.account.address);
      } else {
        handleWalletDisconnection();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, handleWalletConnection, handleWalletDisconnection]);

  const handleWalletAction = async () => {
    if (tonConnectUI.connected) {
      setIsLoading(true);
      await tonConnectUI.disconnect();
    } else {
      await tonConnectUI.openModal();
    }
  };

  const formatAddress = (address: string) => {
    const tempAddress = Address.parse(address).toString();
    return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded">
          Loading...
        </div>
      </main>
    );
  }

  const sendOneToncoin = async () => {
    if (!tonConnectUI.connected || !tonWalletAddress) {
      console.log("Wallet not connected");
      return;
    }
  
    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // Valid for 60 seconds
        messages: [
          {
            address: "UQB7cFPcnMxBh5VjuRxtxwXXG8UuqxR3xbQtsuhw0Ezy7Jfz",
            amount: "1000000000", // 1 TON in nanotons
          },
        ],
      };
  
      const result = await tonConnectUI.sendTransaction(transaction);
      console.log("Transaction sent:", result);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  const sendUSDt = async () => {
    if (!tonConnectUI.connected || !tonWalletAddress) {
      console.log("Wallet not connected");
      return;
    }

    try {
      const usdtContractAddress = "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA"; // USDT contract address on TON
      const recipientAddress = "UQB7cFPcnMxBh5VjuRxtxwXXG8UuqxR3xbQtsuhw0Ezy7Jfz"; // The recipient's address
      const amount = "1000000"; // Amount in minimal units (1 USDT = 1,000,000 units)

      const payload = {
        abi: {
          type: "Contract",
          value: {
            "ABI version": 2,
            "version": "2.2",
            "header": ["time", "expire"],
            "functions": [
              {
                "name": "transfer",
                "inputs": [
                  {"name": "destination", "type": "address"},
                  {"name": "tokens", "type": "uint128"},
                  {"name": "grams", "type": "uint128"},
                  {"name": "return_ownership", "type": "uint128"},
                  {"name": "notify", "type": "bool"}
                ],
                "outputs": []
              }
            ],
            "data": [],
            "events": []
          }
        },
        method: "transfer",
        params: {
          destination: recipientAddress,
          tokens: amount,
          grams: "1000000000", // 0.1 TON for gas
          return_ownership: "0",
          notify: false
        }
      };

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // Valid for 60 seconds
        messages: [
          {
            address: usdtContractAddress,
            amount: "1000000000", // 0.1 TON for gas
            payload: btoa(JSON.stringify(payload)), // Serialize and encode the payload
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      console.log("USDT Transaction sent:", result);
    } catch (error) {
      console.error("Error sending USDT transaction:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">TON Connect Demo</h1>
      {tonWalletAddress ? (
        <div className="flex flex-col items-center">
          <p className="mb-4">Connected: {formatAddress(tonWalletAddress)}</p>

          <button
            onClick={handleWalletAction}
            className="bg-red-500 hover:bg-red-700 w-60 mb-4 text-white font-bold py-2 px-4 rounded"
          >
            Disconnect Wallet
          </button>
          <button
            onClick={sendOneToncoin}
            className="bg-green-500 hover:bg-green-700 w-60 mb-4 text-white font-bold py-2 px-4 rounded"
          >
            Send 1 Toncoin
          </button>
          <button
            onClick={sendUSDt}
            className="bg-blue-500 hover:bg-blue-700 w-60 mb-4 text-white font-bold py-2 px-4 rounded"
          >
            Send 1 USDT
          </button>
        </div>
      ) : (
        <button
          onClick={handleWalletAction}
          className="bg-blue-500 hover:bg-blue-700 mb-4 text-white font-bold py-2 px-4 rounded"
        >
          Connect TON Wallet
        </button>
      )}
      <div className="w-full bg-gray-800 py-4 fixed bottom-0">
        <div className="flex justify-around max-w-screen-lg mx-auto">
          <Link href="/aissist" className="text-white hover:text-blue-300 font-medium">
            Aissist
          </Link>
          <Link href="/" className="text-white hover:text-blue-300 font-medium">
            Wallet
          </Link>
          <Link href="/tasks" className="text-white hover:text-blue-300 font-medium">
            Tasks
          </Link>
          <Link href="/friends" className="text-white hover:text-blue-300 font-medium">
            Frens
          </Link>
          <Link href="/goals" className="text-white hover:text-blue-300 font-medium">
            Goals
          </Link>
          <Link href="/test" className="text-white hover:text-blue-300 font-medium">
            Test
          </Link>
        </div>
      </div>
    </main>
  );
}