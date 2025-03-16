'use client'

import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, fromNano, toNano, } from "@ton/core";
import { Cell } from '@ton/core';
import TonWeb from "tonweb";
import { useTransactionStatus } from '../hooks/useTransactionStatus';
import { useUser } from '../UserContext';
// import { mnemonicToWalletKey } from "@ton/crypto";
// import { TonClient, WalletContractV4, internal } from "@ton/ton";
// import { getHttpEndpoint } from '@orbs-network/ton-access';
// import { useTonPrice } from '../TonPriceContext';
import { useLanguage } from '../LanguageContext';




 

// const forwardPayload = beginCell()
//     .storeUint(0, 32) // 0 opcode means we have a comment
//     .storeStringTail('Hello, TON!')
//     .endCell();

// const body = beginCell()
//     // .storeUint(0xf8a7ea5, 32) // opcode for jetton transfer
//     // .storeUint(0, 64) // query id
//     // .storeCoins(toNano("0.5")) // Jetton amount for transfer (decimals = 6 - USDT, 9 - default). Function toNano use decimals = 9 (remember it)
//     // .storeAddress(destinationAddress) // TON wallet destination address
//     // .storeAddress(destinationAddress) // response excess destination
//     // .storeBit(0) // no custom payload
//     // .storeCoins(toNano("0.2")) // forward amount (if >0, will send notification message)
//     // .storeBit(1) // we store forwardPayload as a reference
//     // .storeRef(forwardPayload)
//     // .endCell();
//     .storeUint(0xf8a7ea5, 32) // op transfer
//     .storeUint(0, 64) // queryId
//     .storeCoins(toNano(2)) // deposit_amount
//     .storeAddress(
//       Address.parse(destinationAddress.toString()),
//     ) // receiver address
//     .storeAddress(Address.parse(destinationAddress.toString())) //response_adress - address nhận phí GD thừa
//     .storeMaybeRef(null) // custom_payload
//     .storeCoins(toNano("0.05")) // forward_ton_amount
//     .storeMaybeRef(beginCell().storeStringTail("something").endCell()) // forward_payload_amount if receiver is a smart contract
//     .endCell();




export default function TonConnect() {
  const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {apiKey: process.env.NEXT_PUBLIC_MAINNET_TONCENTER_API_KEY}));
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [tonAmount, setTonAmount] = useState<string>('0.1');
  const [dollarAmount, setDollarAmount] = useState<string>('0.00');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { transactionStatus, startChecking } = useTransactionStatus();
  const { user, handleUpdateUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [tonPrice, setTonPrice] = useState<number>(0);
  const { language } = useLanguage();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const translations = {
    ru: {
      receiveTon: 'Получить TON',
      enterAmount: 'Введите сумму',
      confirm: 'Подтвердить',
      connected: 'Подключено',
      disconnectWallet: 'Отключить кошелек',
      connectWallet: 'Подключить кошелек',
      loading: 'Загрузка...',
      tonPrice: 'Цена TON',
      lastUpdated: 'Обновлено',
      approxUsd: 'Примерно'
    },
    en: {
      receiveTon: 'Receive TON',
      enterAmount: 'Enter amount',
      confirm: 'Confirm',
      connected: 'Connected',
      disconnectWallet: 'Disconnect Wallet',
      connectWallet: 'Connect Wallet',
      loading: 'Loading...',
      tonPrice: 'TON Price',
      lastUpdated: 'Updated',
      approxUsd: 'Approximately'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Fetch TON price
  useEffect(() => {
    const fetchTonPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd'
        );
        const data = await response.json();
        
        if (data['the-open-network']) {
          const price = data['the-open-network'].usd;
          setTonPrice(price);
          setLastUpdated(new Date());
          
          // Update dollar amount if tonAmount is set
          if (tonAmount) {
            const dollarValue = parseFloat(tonAmount) * price;
            setDollarAmount(dollarValue.toFixed(2));
          }
          
          console.log('TON price updated:', price);
        }
      } catch (error) {
        console.error('Error fetching TON price:', error);
      }
    };

    fetchTonPrice();
    // Update price every 5 minutes
    const interval = setInterval(fetchTonPrice, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Update dollar amount when tonAmount changes
  useEffect(() => {
    if (tonPrice && tonAmount) {
      const dollarValue = parseFloat(tonAmount) * tonPrice;
      setDollarAmount(dollarValue.toFixed(2));
    }
  }, [tonAmount, tonPrice]);

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
        handleWalletConnection(tonConnectUI.account.address);
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
    try {
      if (tonConnectUI.connected) {
        setIsLoading(true);
        await tonConnectUI.disconnect();
      } else {
        setIsLoading(true);
        await tonConnectUI.openModal();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
      console.error('Wallet connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    try {
      const tempAddress = Address.parse(address).toString();
      return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
    } catch {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }
  };

  const handleSendToncoin = async () => {
    if (!tonWalletAddress) {
      console.log("Wallet address not available");
      return;
    }

    try {
      setIsLoading(true);
      const amountInNanotons = toNano(tonAmount);
      
      // Create transaction
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // Valid for 60 seconds
        messages: [
          {
            address: tonWalletAddress,
            amount: amountInNanotons.toString(),
          },
        ],
      };

      // Send transaction
      const result = await tonConnectUI.sendTransaction(transaction);
      console.log("Transaction sent:", result);

      // Update dollar amount
      if (tonPrice && tonAmount) {
        const dollarValue = parseFloat(tonAmount) * tonPrice;
        setDollarAmount(dollarValue.toFixed(2));
      }

      startChecking(result.boc);
      
      return result.boc;
    } catch (error) {
      console.error("Error sending transaction:", error);
      setError(error instanceof Error ? error.message : 'Failed to send transaction');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded">
          {t.loading}
        </div>
      </main>
    );
  }

  return (
    <>
      {tonWalletAddress ? (
        <div className="text-center w-full">
          <div className="mt-0 p-4 border border-gray-700 rounded-lg bg-gray-800">
            <h2 className="text-xl font-bold mb-4">
              {t.receiveTon}
            </h2>
            <input
              type="number"
              value={tonAmount}
              onChange={(e) => setTonAmount(e.target.value)}
              placeholder={t.enterAmount}
              className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white"
              min="0"
              step="0.01"
            />
            {tonPrice > 0 && (
              <p className="text-sm text-gray-400 mb-2">{t.approxUsd}: ${dollarAmount}</p>
            )}
            <button
              onClick={handleSendToncoin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              {t.confirm}
            </button>
          </div>

          <p className="mb-4">{t.connected}: {formatAddress(tonWalletAddress)}</p>

          <button
            onClick={handleWalletAction}
            className="bg-red-500 hover:bg-red-700 w-60 mb-4 text-white font-bold py-2 px-4 rounded"
          >
            {t.disconnectWallet}
          </button>
          {tonPrice > 0 ? (
            <div className="text-sm text-gray-400">
              <p className="mb-1">{t.tonPrice}: ${tonPrice.toFixed(2)}</p>
              {lastUpdated && (
                <p className="text-xs text-gray-500">
                  {t.lastUpdated}: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          ) : (
            <p className="mb-1 text-sm text-gray-400">{t.loading}</p>
          )}
        </div>
      ) : (
        <button
          onClick={handleWalletAction}
          className="bg-blue-500 hover:bg-blue-700 mb-4 text-white font-bold py-2 px-4 rounded"
        >
          {t.connectWallet}
        </button>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500">
          {error}
        </div>
      )}

      {transactionStatus && (
        <div className={`mt-4 p-3 rounded ${
          transactionStatus.includes('успешно') 
            ? 'bg-green-100 text-green-700' 
            : transactionStatus.includes('Ошибка')
            ? 'bg-red-100 text-red-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {transactionStatus}
        </div>
      )}
    </>
  );
}
